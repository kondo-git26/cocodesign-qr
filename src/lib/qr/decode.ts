/**
 * ブラウザ内での QR 読み取りと、元画像からのモジュール配置サンプリング。
 *
 * 位置検出とデコードは jsQR に任せ、その結果（四隅の座標・型番）を使って
 * 元画像のモジュール（セル）配置をこちらで直接サンプリングします。
 * 内容を再エンコードするのではなく元の配置をそのまま持ち出すので、
 * 「ドット配置をできるだけ維持」を実データで実現できます。
 *
 * サンプリングに失敗した／検証に通らなかった場合は modules を null にし、
 * 呼び出し側で再エンコードへフォールバックします（その場合はラベルを消す）。
 *
 * canvas に依存しない純粋な関数だけで構成しているため、Node でもそのままテストできます。
 */

import jsQR from 'jsqr';

import {
  ECC_FORMAT_BITS,
  encodeQr,
  formatInformation,
  isAlphanumericText,
  isNumericText,
  MAX_QR_VERSION,
  type EccLevel,
  type QrMode,
} from './encoder';

export interface RgbaImage {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

/** シンボルの四隅（元画像座標）: 左上・右上・右下・左下 */
export type Corners = [Point, Point, Point, Point];

/**
 * 元のドット配置をどこまで保てたか。
 * - exact       : 内容・型番・誤り訂正・マスク・モードが一致する候補と突き合わせて確定。誤差ゼロ
 * - approximate : 画像から直接サンプリングした配置。読み取りは通るが数セルの誤差を含みうる
 * - none        : 配置を取り出せなかった。内容から再生成する
 */
export type Preservation = 'exact' | 'approximate' | 'none';

export interface DecodeResult {
  /** 読み取れた内容 */
  data: string;
  /** 型番（1〜40） */
  version: number;
  /** 1 辺のモジュール数 */
  size: number;
  /** 元画像の配置を再現したモジュール。preservation が none のときは null */
  modules: boolean[][] | null;
  preservation: Preservation;
  /** exact のとき、サンプリング結果と確定配置の差分セル数（サンプリング品質の目安） */
  mismatchCells: number | null;
  /** 誤り訂正レベル。確定または形式情報から読めた場合のみ */
  ecc: EccLevel | null;
  /** マスク番号。確定または形式情報から読めた場合のみ */
  mask: number | null;
  /** 符号化モード。exact のときのみ */
  mode: QrMode | null;
  corners: Corners;
  /** デコードに成功した拡大率（1 = 等倍） */
  scale: number;
}

/* ------------------------------------------------------------------ */
/* 画素ユーティリティ                                                    */
/* ------------------------------------------------------------------ */

function luminanceAt(img: RgbaImage, x: number, y: number): number {
  const xi = Math.min(img.width - 1, Math.max(0, Math.round(x)));
  const yi = Math.min(img.height - 1, Math.max(0, Math.round(y)));
  const i = (yi * img.width + xi) * 4;
  return 0.299 * img.data[i] + 0.587 * img.data[i + 1] + 0.114 * img.data[i + 2];
}

/** バイリニア補間で輝度を読む（低解像度でも中心値が安定する） */
function luminanceBilinear(img: RgbaImage, x: number, y: number): number {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const l00 = luminanceAt(img, x0, y0);
  const l10 = luminanceAt(img, x0 + 1, y0);
  const l01 = luminanceAt(img, x0, y0 + 1);
  const l11 = luminanceAt(img, x0 + 1, y0 + 1);
  return (
    l00 * (1 - fx) * (1 - fy) + l10 * fx * (1 - fy) + l01 * (1 - fx) * fy + l11 * fx * fy
  );
}

/** 最近傍で整数倍に拡大する（小さな画像を jsQR が読める大きさにする） */
export function upscaleNearest(img: RgbaImage, factor: number): RgbaImage {
  if (factor <= 1) return img;
  const width = img.width * factor;
  const height = img.height * factor;
  const out = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    const sy = Math.floor(y / factor);
    for (let x = 0; x < width; x += 1) {
      const sx = Math.floor(x / factor);
      const si = (sy * img.width + sx) * 4;
      const di = (y * width + x) * 4;
      out[di] = img.data[si];
      out[di + 1] = img.data[si + 1];
      out[di + 2] = img.data[si + 2];
      out[di + 3] = img.data[si + 3];
    }
  }
  return { data: out, width, height };
}

/** バイリニア補間で整数倍に拡大する（強いぼけ・JPEG ノイズの画像で最近傍より読みやすくなることがある） */
export function upscaleBilinear(img: RgbaImage, factor: number): RgbaImage {
  if (factor <= 1) return img;
  const width = img.width * factor;
  const height = img.height * factor;
  const out = new Uint8ClampedArray(width * height * 4);
  const maxX = img.width - 1;
  const maxY = img.height - 1;
  for (let y = 0; y < height; y += 1) {
    const sy = Math.min(maxY, Math.max(0, (y + 0.5) / factor - 0.5));
    const y0 = Math.floor(sy);
    const y1 = Math.min(maxY, y0 + 1);
    const fy = sy - y0;
    for (let x = 0; x < width; x += 1) {
      const sx = Math.min(maxX, Math.max(0, (x + 0.5) / factor - 0.5));
      const x0 = Math.floor(sx);
      const x1 = Math.min(maxX, x0 + 1);
      const fx = sx - x0;
      const i00 = (y0 * img.width + x0) * 4;
      const i10 = (y0 * img.width + x1) * 4;
      const i01 = (y1 * img.width + x0) * 4;
      const i11 = (y1 * img.width + x1) * 4;
      const di = (y * width + x) * 4;
      for (let ch = 0; ch < 4; ch += 1) {
        out[di + ch] =
          img.data[i00 + ch] * (1 - fx) * (1 - fy) +
          img.data[i10 + ch] * fx * (1 - fy) +
          img.data[i01 + ch] * (1 - fx) * fy +
          img.data[i11 + ch] * fx * fy;
      }
    }
  }
  return { data: out, width, height };
}

/** 大津の二値化しきい値 */
function otsuThreshold(values: number[]): number {
  const histogram = new Array<number>(256).fill(0);
  for (const v of values) histogram[Math.min(255, Math.max(0, Math.round(v)))] += 1;
  const total = values.length;
  let sum = 0;
  for (let i = 0; i < 256; i += 1) sum += i * histogram[i];

  let sumBackground = 0;
  let weightBackground = 0;
  let best = 0;
  let threshold = 128;
  for (let t = 0; t < 256; t += 1) {
    weightBackground += histogram[t];
    if (weightBackground === 0) continue;
    const weightForeground = total - weightBackground;
    if (weightForeground === 0) break;
    sumBackground += t * histogram[t];
    const meanBackground = sumBackground / weightBackground;
    const meanForeground = (sum - sumBackground) / weightForeground;
    const between =
      weightBackground * weightForeground * (meanBackground - meanForeground) ** 2;
    if (between > best) {
      best = between;
      threshold = t;
    }
  }
  return threshold;
}

/* ------------------------------------------------------------------ */
/* 射影変換（単位正方形 → 四角形）                                         */
/* ------------------------------------------------------------------ */

interface PerspectiveTransform {
  apply(x: number, y: number): Point;
}

/**
 * 単位正方形 (0,0)-(1,1) を四角形 p0(左上) p1(右上) p2(右下) p3(左下) へ写す変換。
 * ZXing の PerspectiveTransform.squareToQuadrilateral と同じ式です。
 */
function squareToQuadrilateral(corners: Corners): PerspectiveTransform {
  const [{ x: x0, y: y0 }, { x: x1, y: y1 }, { x: x2, y: y2 }, { x: x3, y: y3 }] = corners;
  const dx3 = x0 - x1 + x2 - x3;
  const dy3 = y0 - y1 + y2 - y3;

  let a11: number;
  let a21: number;
  let a12: number;
  let a22: number;
  let a13 = 0;
  let a23 = 0;
  const a31 = x0;
  const a32 = y0;
  const a33 = 1;

  if (dx3 === 0 && dy3 === 0) {
    a11 = x1 - x0;
    a21 = x2 - x1;
    a12 = y1 - y0;
    a22 = y2 - y1;
  } else {
    const dx1 = x1 - x2;
    const dx2 = x3 - x2;
    const dy1 = y1 - y2;
    const dy2 = y3 - y2;
    const denominator = dx1 * dy2 - dx2 * dy1;
    a13 = (dx3 * dy2 - dx2 * dy3) / denominator;
    a23 = (dx1 * dy3 - dx3 * dy1) / denominator;
    a11 = x1 - x0 + a13 * x1;
    a21 = x3 - x0 + a23 * x3;
    a12 = y1 - y0 + a13 * y1;
    a22 = y3 - y0 + a23 * y3;
  }

  return {
    apply(x: number, y: number): Point {
      const denominator = a13 * x + a23 * y + a33;
      return {
        x: (a11 * x + a21 * y + a31) / denominator,
        y: (a12 * x + a22 * y + a32) / denominator,
      };
    },
  };
}

/* ------------------------------------------------------------------ */
/* モジュール配置のサンプリングと検証                                       */
/* ------------------------------------------------------------------ */

/** 四隅と型番から、各モジュール中心の輝度を読んで二値化する */
export function sampleModules(img: RgbaImage, corners: Corners, size: number): boolean[][] {
  const transform = squareToQuadrilateral(corners);
  const values: number[] = [];
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      const p = transform.apply((col + 0.5) / size, (row + 0.5) / size);
      values.push(luminanceBilinear(img, p.x, p.y));
    }
  }
  const threshold = otsuThreshold(values);
  const modules: boolean[][] = [];
  for (let row = 0; row < size; row += 1) {
    const line: boolean[] = [];
    for (let col = 0; col < size; col += 1) {
      // 大津法の慣例どおり「しきい値以下を暗（黒）」とする。
      // 輝度が 0 と 255 だけの鮮明な画像ではしきい値が 0 になるため、
      // ここを < にすると黒モジュールが 1 つも取れなくなる。
      line.push(values[row * size + col] <= threshold);
    }
    modules.push(line);
  }
  return modules;
}

/** 3 つの位置検出パターンが期待どおりか（各 7×7 で誤り 2 個まで許容） */
export function finderPatternsLookValid(modules: boolean[][]): boolean {
  const size = modules.length;
  const origins: Array<[number, number]> = [
    [0, 0],
    [0, size - 7],
    [size - 7, 0],
  ];
  for (const [r0, c0] of origins) {
    let errors = 0;
    for (let dr = 0; dr < 7; dr += 1) {
      for (let dc = 0; dc < 7; dc += 1) {
        const ring = dr === 0 || dr === 6 || dc === 0 || dc === 6;
        const core = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
        const expected = ring || core;
        if (modules[r0 + dr][c0 + dc] !== expected) errors += 1;
      }
    }
    if (errors > 2) return false;
  }
  return true;
}

/** 有効な 32 通りの形式情報（BCH 符号化・マスク済み） */
const VALID_FORMAT_CODES: Array<{ code: number; ecc: EccLevel; mask: number }> = (() => {
  const list: Array<{ code: number; ecc: EccLevel; mask: number }> = [];
  (Object.keys(ECC_FORMAT_BITS) as EccLevel[]).forEach((ecc) => {
    for (let mask = 0; mask < 8; mask += 1) {
      list.push({ code: formatInformation((ECC_FORMAT_BITS[ecc] << 3) | mask), ecc, mask });
    }
  });
  return list;
})();

function hammingDistance(a: number, b: number): number {
  let v = a ^ b;
  let count = 0;
  while (v) {
    count += v & 1;
    v >>>= 1;
  }
  return count;
}

/**
 * 形式情報を読み、誤り訂正レベルとマスク番号を返します。
 * 2 か所のコピーそれぞれについて最も近い有効符号を探し、距離 3 以内なら採用します。
 */
export function readFormatInfo(
  modules: boolean[][],
): { ecc: EccLevel; mask: number } | null {
  const size = modules.length;
  const bit = (r: number, c: number) => (modules[r][c] ? 1 : 0);

  let first = 0;
  let second = 0;
  for (let i = 0; i < 15; i += 1) {
    let b1: number;
    if (i < 6) b1 = bit(i, 8);
    else if (i === 6) b1 = bit(7, 8);
    else if (i === 7) b1 = bit(8, 8);
    else if (i === 8) b1 = bit(8, 7);
    else b1 = bit(8, 14 - i);
    first |= b1 << i;

    const b2 = i < 8 ? bit(8, size - 1 - i) : bit(size - 15 + i, 8);
    second |= b2 << i;
  }

  for (const candidate of [first, second]) {
    let best: { ecc: EccLevel; mask: number } | null = null;
    let bestDistance = 16;
    for (const entry of VALID_FORMAT_CODES) {
      const d = hammingDistance(candidate, entry.code);
      if (d < bestDistance) {
        bestDistance = d;
        best = { ecc: entry.ecc, mask: entry.mask };
      }
    }
    if (best && bestDistance <= 3) return best;
  }
  return null;
}

/** モジュール配置を RGBA 画像に描く（検証用・確認用） */
export function renderModulesToRgba(
  modules: boolean[][],
  modulePx = 8,
  quietZone = 4,
): RgbaImage {
  const size = modules.length;
  const side = (size + quietZone * 2) * modulePx;
  const data = new Uint8ClampedArray(side * side * 4).fill(255);
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (!modules[row][col]) continue;
      const x0 = (col + quietZone) * modulePx;
      const y0 = (row + quietZone) * modulePx;
      for (let y = y0; y < y0 + modulePx; y += 1) {
        for (let x = x0; x < x0 + modulePx; x += 1) {
          const i = (y * side + x) * 4;
          data[i] = 0;
          data[i + 1] = 0;
          data[i + 2] = 0;
        }
      }
    }
  }
  return { data, width: side, height: side };
}

/** サンプリングした配置を描き直して読み、内容が一致するかを確かめる */
export function verifyModulesDecodeTo(modules: boolean[][], expected: string): boolean {
  const rendered = renderModulesToRgba(modules);
  const result = jsQR(rendered.data, rendered.width, rendered.height, {
    inversionAttempts: 'dontInvert',
  });
  return result !== null && result.data === expected;
}

/* ------------------------------------------------------------------ */
/* 変換前ビジュアル用：シンボル部分の射影補正切り出し                         */
/* ------------------------------------------------------------------ */

/**
 * 元画像からシンボル部分だけを正方形に切り出します（余白 quietModules 分を含む）。
 * 元の解像度のまま補間するので、支給画像の粗さがそのまま残ります。
 */
export function cropSymbol(
  img: RgbaImage,
  corners: Corners,
  size: number,
  outputPx: number,
  quietModules = 2,
): RgbaImage {
  const transform = squareToQuadrilateral(corners);
  const total = size + quietModules * 2;
  const data = new Uint8ClampedArray(outputPx * outputPx * 4);
  for (let y = 0; y < outputPx; y += 1) {
    const gy = ((y + 0.5) / outputPx) * total - quietModules;
    for (let x = 0; x < outputPx; x += 1) {
      const gx = ((x + 0.5) / outputPx) * total - quietModules;
      const p = transform.apply(gx / size, gy / size);
      const i = (y * outputPx + x) * 4;
      if (p.x < 0 || p.y < 0 || p.x > img.width - 1 || p.y > img.height - 1) {
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
        data[i + 3] = 255;
        continue;
      }
      const lum = luminanceBilinear(img, p.x, p.y);
      data[i] = lum;
      data[i + 1] = lum;
      data[i + 2] = lum;
      data[i + 3] = 255;
    }
  }
  return { data, width: outputPx, height: outputPx };
}

/* ------------------------------------------------------------------ */
/* デコード本体                                                         */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* 元配置の確定：候補との突き合わせ                                          */
/* ------------------------------------------------------------------ */

function hammingModules(a: boolean[][], b: boolean[][]): number {
  let count = 0;
  for (let r = 0; r < a.length; r += 1) {
    const rowA = a[r];
    const rowB = b[r];
    for (let c = 0; c < rowA.length; c += 1) if (rowA[c] !== rowB[c]) count += 1;
  }
  return count;
}

export interface OriginalMatch {
  modules: boolean[][];
  ecc: EccLevel;
  mask: number;
  mode: QrMode;
  /** サンプリング結果との差分セル数 */
  mismatchCells: number;
}

/**
 * 読み取った内容と型番から「誤り訂正レベル × マスク × モード」の全候補を生成し、
 * 画像からサンプリングした配置に最も近いものを探します。
 *
 * サンプリングは低解像度だと数セル誤りますが、正しい候補との距離は小さく、
 * 誤った候補（別マスク・別レベル）との距離はセル総数の 4〜5 割になるため、
 * 明確に区別できます。一致すれば誤差ゼロの「元の配置」が得られます。
 */
export function reconstructOriginal(
  sampled: boolean[][],
  data: string,
  version: number,
  /** 形式情報から読めた誤り訂正レベルとマスク。候補の裏付けに使う */
  formatHint: { ecc: EccLevel; mask: number } | null = null,
): OriginalMatch | null {
  if (version < 1 || version > MAX_QR_VERSION) return null;

  const modes: QrMode[] = ['byte'];
  if (isAlphanumericText(data)) modes.push('alphanumeric');
  if (isNumericText(data)) modes.push('numeric');
  const levels: EccLevel[] = ['L', 'M', 'Q', 'H'];

  let best: OriginalMatch | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;
  let secondDistance = Number.POSITIVE_INFINITY;

  for (const mode of modes) {
    for (const ecc of levels) {
      for (let mask = 0; mask < 8; mask += 1) {
        let candidate;
        try {
          candidate = encodeQr(data, ecc, { version, mask, mode });
        } catch {
          continue; // この型番・レベルには収まらない
        }
        const distance = hammingModules(sampled, candidate.modules);
        if (distance < bestDistance) {
          secondDistance = bestDistance;
          bestDistance = distance;
          best = { modules: candidate.modules, ecc, mask, mode, mismatchCells: distance };
        } else if (distance < secondDistance) {
          secondDistance = distance;
        }
      }
    }
  }

  if (!best) return null;
  const total = sampled.length * sampled.length;
  const limit = Math.max(8, Math.floor(total * 0.25));
  if (bestDistance > limit) return null;

  // 2 位と十分に差があるか、形式情報が同じ（誤り訂正レベル・マスク）を指していれば確定する。
  // 短い内容ではパディングが同じになり、隣の誤り訂正レベルの候補が近くなるため、
  // 形式情報による裏付けを併用しています。
  const clearlySeparated = secondDistance >= bestDistance * 2 + 10;
  const confirmedByFormat =
    formatHint !== null && formatHint.ecc === best.ecc && formatHint.mask === best.mask;
  if (!clearlySeparated && !confirmedByFormat) return null;
  return best;
}

/* ------------------------------------------------------------------ */
/* デコード本体                                                         */
/* ------------------------------------------------------------------ */

const MAX_WORKING_SIDE = 2400;

/**
 * 画像から QR を読み取り、可能なら元のモジュール配置も取り出します。
 * 小さな画像は段階的に拡大して再試行します。
 */
export function decodeQr(img: RgbaImage): DecodeResult | null {
  const longSide = Math.max(img.width, img.height);
  const fits = (s: number) => longSide * s <= MAX_WORKING_SIDE;

  // まず最近傍拡大（輪郭が保たれる）、だめならバイリニア拡大（ノイズがならされる）で再試行
  const attempts: Array<{ scale: number; method: 'nearest' | 'bilinear' }> = [
    ...[1, 2, 3, 4].filter((s) => s === 1 || fits(s)).map((scale) => ({ scale, method: 'nearest' as const })),
    ...[2, 3, 4, 5].filter(fits).map((scale) => ({ scale, method: 'bilinear' as const })),
  ];

  for (const { scale, method } of attempts) {
    const working =
      method === 'nearest' ? upscaleNearest(img, scale) : upscaleBilinear(img, scale);
    const found = jsQR(working.data, working.width, working.height, {
      inversionAttempts: 'attemptBoth',
    });
    if (!found || found.data.length === 0) continue;

    const size = found.version * 4 + 17;
    const toOriginal = (p: Point): Point => ({ x: p.x / scale, y: p.y / scale });
    const corners: Corners = [
      toOriginal(found.location.topLeftCorner),
      toOriginal(found.location.topRightCorner),
      toOriginal(found.location.bottomRightCorner),
      toOriginal(found.location.bottomLeftCorner),
    ];

    const sampled = sampleModules(img, corners, size);
    const formatHint = readFormatInfo(sampled);

    // 1) 候補と突き合わせて確定できれば誤差ゼロの元配置
    const match = reconstructOriginal(sampled, found.data, found.version, formatHint);
    if (match && verifyModulesDecodeTo(match.modules, found.data)) {
      return {
        data: found.data,
        version: found.version,
        size,
        modules: match.modules,
        preservation: 'exact',
        mismatchCells: match.mismatchCells,
        ecc: match.ecc,
        mask: match.mask,
        mode: match.mode,
        corners,
        scale,
      };
    }

    // 2) 確定できなくても、サンプリング結果が読み取りに通るならそれを使う
    if (finderPatternsLookValid(sampled) && verifyModulesDecodeTo(sampled, found.data)) {
      const format = readFormatInfo(sampled);
      return {
        data: found.data,
        version: found.version,
        size,
        modules: sampled,
        preservation: 'approximate',
        mismatchCells: null,
        ecc: format?.ecc ?? null,
        mask: format?.mask ?? null,
        mode: null,
        corners,
        scale,
      };
    }

    // 3) 配置は取り出せない。内容だけ返し、呼び出し側で再生成する
    return {
      data: found.data,
      version: found.version,
      size,
      modules: null,
      preservation: 'none',
      mismatchCells: null,
      ecc: null,
      mask: null,
      mode: null,
      corners,
      scale,
    };
  }

  return null;
}
