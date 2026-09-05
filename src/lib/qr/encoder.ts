/**
 * QR コードエンコーダ（8bit バイトモード / バージョン 1〜15）
 *
 * 外部ライブラリを増やさないための自前実装です。
 * アルゴリズムは JIS X 0510 / ISO 18004 に準拠し、
 * バージョン 1〜15 × 誤り訂正レベル L/M/Q/H の全 60 パターンについて
 * 生成 → 実機デコーダでの読み取り確認を行った実装を移植しています。
 *
 * 返り値の matrix は matrix[row][col] === true が黒（印刷時の K100）です。
 */

export type EccLevel = 'L' | 'M' | 'Q' | 'H';

/** 符号化モード。一般的な生成ツールと同じく、内容から自動選択します */
export type QrMode = 'numeric' | 'alphanumeric' | 'byte';

export interface QrMatrix {
  /** matrix[row][col] === true が黒モジュール */
  modules: boolean[][];
  /** 1 辺のモジュール数（= セル数） */
  size: number;
  /** QR バージョン（1〜15） */
  version: number;
  /** 誤り訂正レベル */
  ecc: EccLevel;
  /** 使用したマスク番号（0〜7） */
  mask?: number;
  /** 使用した符号化モード */
  mode?: QrMode;
}

export interface EncodeOptions {
  /** 型番を固定する（元画像の配置を再現するときに使う）。未指定なら最小の型番 */
  version?: number;
  /** マスク番号を固定する。未指定なら評価が最良のものを選ぶ */
  mask?: number;
  /** 符号化モードを固定する。未指定なら内容から自動選択 */
  mode?: QrMode;
}

const MODE_INDICATOR: Record<QrMode, number> = {
  numeric: 0b0001,
  alphanumeric: 0b0010,
  byte: 0b0100,
};

export const ALPHANUMERIC_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';

export function isNumericText(text: string): boolean {
  return text.length > 0 && /^[0-9]+$/.test(text);
}

export function isAlphanumericText(text: string): boolean {
  return text.length > 0 && Array.from(text).every((ch) => ALPHANUMERIC_CHARS.includes(ch));
}

/** 内容に対して最もコンパクトになるモードを選ぶ */
export function chooseMode(text: string): QrMode {
  if (isNumericText(text)) return 'numeric';
  if (isAlphanumericText(text)) return 'alphanumeric';
  return 'byte';
}

/** バージョンごとの総コードワード数（データ + 誤り訂正） */
const TOTAL_CODEWORDS: Record<number, number> = {
  1: 26, 2: 44, 3: 70, 4: 100, 5: 134, 6: 172, 7: 196, 8: 242, 9: 292, 10: 346,
  11: 404, 12: 466, 13: 532, 14: 581, 15: 655,
};

/** 位置合わせパターンの中心座標 */
const ALIGN_POSITIONS: Record<number, number[]> = {
  1: [],
  2: [6, 18],
  3: [6, 22],
  4: [6, 26],
  5: [6, 30],
  6: [6, 34],
  7: [6, 22, 38],
  8: [6, 24, 42],
  9: [6, 26, 46],
  10: [6, 28, 50],
  11: [6, 30, 54],
  12: [6, 32, 58],
  13: [6, 34, 62],
  14: [6, 26, 46, 66],
  15: [6, 26, 48, 70],
};

/** [ブロックあたりの誤り訂正コードワード数, [[ブロック数, データコードワード数], ...]] */
type BlockSpec = [number, Array<[number, number]>];

const BLOCK_TABLE: Record<number, Record<EccLevel, BlockSpec>> = {
  1: { L: [7, [[1, 19]]], M: [10, [[1, 16]]], Q: [13, [[1, 13]]], H: [17, [[1, 9]]] },
  2: { L: [10, [[1, 34]]], M: [16, [[1, 28]]], Q: [22, [[1, 22]]], H: [28, [[1, 16]]] },
  3: { L: [15, [[1, 55]]], M: [26, [[1, 44]]], Q: [18, [[2, 17]]], H: [22, [[2, 13]]] },
  4: { L: [20, [[1, 80]]], M: [18, [[2, 32]]], Q: [26, [[2, 24]]], H: [16, [[4, 9]]] },
  5: {
    L: [26, [[1, 108]]],
    M: [24, [[2, 43]]],
    Q: [18, [[2, 15], [2, 16]]],
    H: [22, [[2, 11], [2, 12]]],
  },
  6: { L: [18, [[2, 68]]], M: [16, [[4, 27]]], Q: [24, [[4, 19]]], H: [28, [[4, 15]]] },
  7: {
    L: [20, [[2, 78]]],
    M: [18, [[4, 31]]],
    Q: [18, [[2, 14], [4, 15]]],
    H: [26, [[4, 13], [1, 14]]],
  },
  8: {
    L: [24, [[2, 97]]],
    M: [22, [[2, 38], [2, 39]]],
    Q: [22, [[4, 18], [2, 19]]],
    H: [26, [[4, 14], [2, 15]]],
  },
  9: {
    L: [30, [[2, 116]]],
    M: [22, [[3, 36], [2, 37]]],
    Q: [20, [[4, 16], [4, 17]]],
    H: [24, [[4, 12], [4, 13]]],
  },
  10: {
    L: [18, [[2, 68], [2, 69]]],
    M: [26, [[4, 43], [1, 44]]],
    Q: [24, [[6, 19], [2, 20]]],
    H: [28, [[6, 15], [2, 16]]],
  },
  11: {
    L: [20, [[4, 81]]],
    M: [30, [[1, 50], [4, 51]]],
    Q: [28, [[4, 22], [4, 23]]],
    H: [24, [[3, 12], [8, 13]]],
  },
  12: {
    L: [24, [[2, 92], [2, 93]]],
    M: [22, [[6, 36], [2, 37]]],
    Q: [26, [[4, 20], [6, 21]]],
    H: [28, [[7, 14], [4, 15]]],
  },
  13: {
    L: [26, [[4, 107]]],
    M: [22, [[8, 37], [1, 38]]],
    Q: [24, [[8, 20], [4, 21]]],
    H: [22, [[12, 11], [4, 12]]],
  },
  14: {
    L: [30, [[3, 115], [1, 116]]],
    M: [24, [[4, 40], [5, 41]]],
    Q: [20, [[11, 16], [5, 17]]],
    H: [24, [[11, 12], [5, 13]]],
  },
  15: {
    L: [22, [[5, 87], [1, 88]]],
    M: [24, [[5, 41], [5, 42]]],
    Q: [30, [[5, 24], [7, 25]]],
    H: [24, [[11, 12], [7, 13]]],
  },
};

export const ECC_FORMAT_BITS: Record<EccLevel, number> = { L: 0b01, M: 0b00, Q: 0b11, H: 0b10 };

export const MAX_QR_VERSION = 15;

/* ------------------------------------------------------------------ */
/* ガロア体 GF(256)                                                     */
/* ------------------------------------------------------------------ */

const GF_EXP = new Uint8Array(256);
const GF_LOG = new Uint8Array(256);

(function initGaloisField() {
  let x = 1;
  for (let i = 0; i < 255; i += 1) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  GF_EXP[255] = GF_EXP[0];
})();

function gfMultiply(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[(GF_LOG[a] + GF_LOG[b]) % 255];
}

/** リード・ソロモン生成多項式 */
function reedSolomonGenerator(degree: number): number[] {
  let poly = [1];
  for (let i = 0; i < degree; i += 1) {
    const next = new Array<number>(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j += 1) {
      next[j] ^= poly[j];
      next[j + 1] ^= gfMultiply(poly[j], GF_EXP[i]);
    }
    poly = next;
  }
  return poly;
}

function reedSolomonRemainder(data: number[], degree: number): number[] {
  const gen = reedSolomonGenerator(degree);
  const remainder = new Array<number>(degree).fill(0);
  for (const byte of data) {
    const factor = byte ^ remainder[0];
    remainder.shift();
    remainder.push(0);
    for (let i = 0; i < degree; i += 1) {
      remainder[i] ^= gfMultiply(gen[i + 1], factor);
    }
  }
  return remainder;
}

/* ------------------------------------------------------------------ */
/* コードワードの組み立て                                                */
/* ------------------------------------------------------------------ */

function dataCapacityCodewords(version: number, ecc: EccLevel): number {
  const [, groups] = BLOCK_TABLE[version][ecc];
  return groups.reduce((sum, [blocks, dataCw]) => sum + blocks * dataCw, 0);
}

function remainderBits(version: number): number {
  if (version === 1) return 0;
  if (version >= 2 && version <= 6) return 7;
  if (version >= 7 && version <= 13) return 0;
  return 3;
}

/** 文字数指示子のビット長（型番 1〜9 / 10〜26 / 27〜40 で変わる） */
function charCountBits(mode: QrMode, version: number): number {
  if (version <= 9) return { numeric: 10, alphanumeric: 9, byte: 8 }[mode];
  if (version <= 26) return { numeric: 12, alphanumeric: 11, byte: 16 }[mode];
  return { numeric: 14, alphanumeric: 13, byte: 16 }[mode];
}

/** モードごとのデータ部（モード指示子・文字数指示子を除く）のビット列 */
function segmentBits(text: string, mode: QrMode): { bits: number[]; count: number } {
  const bits: number[] = [];
  const push = (value: number, length: number) => {
    for (let i = length - 1; i >= 0; i -= 1) bits.push((value >> i) & 1);
  };

  if (mode === 'numeric') {
    for (let i = 0; i < text.length; i += 3) {
      const chunk = text.slice(i, i + 3);
      push(Number(chunk), chunk.length === 3 ? 10 : chunk.length === 2 ? 7 : 4);
    }
    return { bits, count: text.length };
  }

  if (mode === 'alphanumeric') {
    const chars = Array.from(text);
    for (let i = 0; i < chars.length; i += 2) {
      const a = ALPHANUMERIC_CHARS.indexOf(chars[i]);
      if (i + 1 < chars.length) {
        push(a * 45 + ALPHANUMERIC_CHARS.indexOf(chars[i + 1]), 11);
      } else {
        push(a, 6);
      }
    }
    return { bits, count: chars.length };
  }

  const bytes = new TextEncoder().encode(text);
  for (const byte of bytes) push(byte, 8);
  return { bits, count: bytes.length };
}

/** 与えた内容が収まる最小バージョンを選ぶ（version 指定時はその型番で入るかを確認する） */
function pickVersion(
  text: string,
  mode: QrMode,
  ecc: EccLevel,
  forcedVersion?: number,
): number {
  const dataBits = segmentBits(text, mode).bits.length;
  const candidates =
    forcedVersion !== undefined
      ? [forcedVersion]
      : Array.from({ length: MAX_QR_VERSION }, (_, i) => i + 1);

  for (const version of candidates) {
    if (version < 1 || version > MAX_QR_VERSION) continue;
    const needed = 4 + charCountBits(mode, version) + dataBits;
    if (needed <= dataCapacityCodewords(version, ecc) * 8) return version;
  }
  throw new QrCapacityError(Math.ceil(dataBits / 8), ecc);
}

export class QrCapacityError extends Error {
  constructor(
    readonly byteLength: number,
    readonly ecc: EccLevel,
  ) {
    super(
      `データが長すぎます（${byteLength} バイト）。文字数を減らすか、誤り訂正レベルを下げてください。`,
    );
    this.name = 'QrCapacityError';
  }
}

function buildCodewords(text: string, mode: QrMode, version: number, ecc: EccLevel): number[] {
  const bits: number[] = [];

  const push = (value: number, length: number) => {
    for (let i = length - 1; i >= 0; i -= 1) bits.push((value >> i) & 1);
  };

  const segment = segmentBits(text, mode);
  push(MODE_INDICATOR[mode], 4);
  push(segment.count, charCountBits(mode, version));
  bits.push(...segment.bits);

  const capacityBits = dataCapacityCodewords(version, ecc) * 8;
  push(0, Math.min(4, capacityBits - bits.length)); // 終端パターン
  while (bits.length % 8 !== 0) bits.push(0);

  const codewords: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j += 1) byte = (byte << 1) | bits[i + j];
    codewords.push(byte);
  }

  const padBytes = [0xec, 0x11];
  let padIndex = 0;
  const capacity = dataCapacityCodewords(version, ecc);
  while (codewords.length < capacity) {
    codewords.push(padBytes[padIndex % 2]);
    padIndex += 1;
  }

  const [eccLength, groups] = BLOCK_TABLE[version][ecc];
  const dataBlocks: number[][] = [];
  const eccBlocks: number[][] = [];
  let cursor = 0;
  for (const [blockCount, blockSize] of groups) {
    for (let i = 0; i < blockCount; i += 1) {
      const block = codewords.slice(cursor, cursor + blockSize);
      cursor += blockSize;
      dataBlocks.push(block);
      eccBlocks.push(reedSolomonRemainder(block, eccLength));
    }
  }

  // インターリーブ
  const result: number[] = [];
  const longest = Math.max(...dataBlocks.map((b) => b.length));
  for (let i = 0; i < longest; i += 1) {
    for (const block of dataBlocks) if (i < block.length) result.push(block[i]);
  }
  for (let i = 0; i < eccLength; i += 1) {
    for (const block of eccBlocks) result.push(block[i]);
  }
  return result;
}

/* ------------------------------------------------------------------ */
/* 形式情報 / 型番情報（BCH 符号）                                        */
/* ------------------------------------------------------------------ */

function bitLength(value: number): number {
  let length = 0;
  let v = value;
  while (v > 0) {
    length += 1;
    v >>>= 1;
  }
  return length;
}

/** 形式情報（誤り訂正 2bit + マスク 3bit）を BCH 符号化しマスクをかけた 15bit を返す */
export function formatInformation(formatBits: number): number {
  let remainder = formatBits << 10;
  while (bitLength(remainder) - 1 >= 10) {
    remainder ^= 0x537 << (bitLength(remainder) - 1 - 10);
  }
  return ((formatBits << 10) | remainder) ^ 0x5412;
}

function versionInformation(version: number): number {
  let remainder = version << 12;
  while (bitLength(remainder) - 1 >= 12) {
    remainder ^= 0x1f25 << (bitLength(remainder) - 1 - 12);
  }
  return (version << 12) | remainder;
}

/* ------------------------------------------------------------------ */
/* マトリクス生成                                                       */
/* ------------------------------------------------------------------ */

const MASK_FUNCTIONS: Array<(row: number, col: number) => boolean> = [
  (i, j) => (i + j) % 2 === 0,
  (i) => i % 2 === 0,
  (_i, j) => j % 3 === 0,
  (i, j) => (i + j) % 3 === 0,
  (i, j) => (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0,
  (i, j) => ((i * j) % 2) + ((i * j) % 3) === 0,
  (i, j) => (((i * j) % 2) + ((i * j) % 3)) % 2 === 0,
  (i, j) => (((i + j) % 2) + ((i * j) % 3)) % 2 === 0,
];

interface BaseMatrix {
  modules: number[][];
  reserved: boolean[][];
}

function buildBaseMatrix(version: number, codewords: number[]): BaseMatrix {
  const size = version * 4 + 17;
  const modules: number[][] = Array.from({ length: size }, () => new Array<number>(size).fill(0));
  const reserved: boolean[][] = Array.from({ length: size }, () =>
    new Array<boolean>(size).fill(false),
  );

  const placeFinder = (row: number, col: number) => {
    for (let dr = -1; dr <= 7; dr += 1) {
      for (let dc = -1; dc <= 7; dc += 1) {
        const r = row + dr;
        const c = col + dc;
        if (r < 0 || r >= size || c < 0 || c >= size) continue;
        const inner = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
        const ring =
          ((dr === 0 || dr === 6) && dc >= 0 && dc <= 6) ||
          ((dc === 0 || dc === 6) && dr >= 0 && dr <= 6);
        modules[r][c] = inner || ring ? 1 : 0;
        reserved[r][c] = true;
      }
    }
  };

  placeFinder(0, 0);
  placeFinder(0, size - 7);
  placeFinder(size - 7, 0);

  // タイミングパターン
  for (let i = 0; i < size; i += 1) {
    if (!reserved[6][i]) {
      modules[6][i] = i % 2 === 0 ? 1 : 0;
      reserved[6][i] = true;
    }
    if (!reserved[i][6]) {
      modules[i][6] = i % 2 === 0 ? 1 : 0;
      reserved[i][6] = true;
    }
  }

  // 位置合わせパターン（3 隅の切り出しシンボルと重なる組み合わせのみ除外）
  const centers = ALIGN_POSITIONS[version];
  const n = centers.length;
  for (let ci = 0; ci < n; ci += 1) {
    for (let cj = 0; cj < n; cj += 1) {
      const isCorner =
        (ci === 0 && cj === 0) || (ci === 0 && cj === n - 1) || (ci === n - 1 && cj === 0);
      if (isCorner) continue;
      const r = centers[ci];
      const c = centers[cj];
      for (let dr = -2; dr <= 2; dr += 1) {
        for (let dc = -2; dc <= 2; dc += 1) {
          modules[r + dr][c + dc] = Math.max(Math.abs(dr), Math.abs(dc)) === 1 ? 0 : 1;
          reserved[r + dr][c + dc] = true;
        }
      }
    }
  }

  // 形式情報の領域を確保
  for (let i = 0; i <= 8; i += 1) {
    if (!reserved[8][i]) {
      reserved[8][i] = true;
      modules[8][i] = 0;
    }
    if (!reserved[i][8]) {
      reserved[i][8] = true;
      modules[i][8] = 0;
    }
  }
  for (let i = 0; i < 8; i += 1) {
    reserved[8][size - 1 - i] = true;
    modules[8][size - 1 - i] = 0;
    reserved[size - 1 - i][8] = true;
    modules[size - 1 - i][8] = 0;
  }

  // 型番情報の領域を確保
  if (version >= 7) {
    for (let i = 0; i < 18; i += 1) {
      const r = Math.floor(i / 3);
      const c = size - 11 + (i % 3);
      reserved[r][c] = true;
      modules[r][c] = 0;
      reserved[c][r] = true;
      modules[c][r] = 0;
    }
  }

  // データビットの配置（右下から 2 列ずつジグザグ、6 列目は読み飛ばす）
  const bits: number[] = [];
  for (const cw of codewords) {
    for (let i = 7; i >= 0; i -= 1) bits.push((cw >> i) & 1);
  }
  for (let i = 0; i < remainderBits(version); i += 1) bits.push(0);

  let index = 0;
  let col = size - 1;
  let upward = true;
  while (col > 0) {
    if (col === 6) col -= 1;
    for (let step = 0; step < size; step += 1) {
      const row = upward ? size - 1 - step : step;
      for (let dc = 0; dc < 2; dc += 1) {
        const c = col - dc;
        if (reserved[row][c]) continue;
        modules[row][c] = index < bits.length ? bits[index] : 0;
        index += 1;
      }
    }
    upward = !upward;
    col -= 2;
  }

  return { modules, reserved };
}

/** マスク評価（数値が小さいほど良い） */
function maskPenalty(m: number[][]): number {
  const size = m.length;
  let score = 0;

  const scoreLine = (line: number[]) => {
    let run = 1;
    for (let i = 1; i < size; i += 1) {
      if (line[i] === line[i - 1]) {
        run += 1;
      } else {
        if (run >= 5) score += 3 + (run - 5);
        run = 1;
      }
    }
    if (run >= 5) score += 3 + (run - 5);
  };

  const finderLike1 = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0].join('');
  const finderLike2 = [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1].join('');

  for (let i = 0; i < size; i += 1) {
    const row = m[i];
    const column: number[] = [];
    for (let r = 0; r < size; r += 1) column.push(m[r][i]);
    scoreLine(row);
    scoreLine(column);

    for (const line of [row, column]) {
      const joined = line.join('');
      for (let j = 0; j + 11 <= size; j += 1) {
        const segment = joined.slice(j, j + 11);
        if (segment === finderLike1 || segment === finderLike2) score += 40;
      }
    }
  }

  for (let i = 0; i < size - 1; i += 1) {
    for (let j = 0; j < size - 1; j += 1) {
      const v = m[i][j];
      if (v === m[i][j + 1] && v === m[i + 1][j] && v === m[i + 1][j + 1]) score += 3;
    }
  }

  let dark = 0;
  for (const row of m) for (const v of row) dark += v;
  const total = size * size;
  const k = Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1;
  score += Math.max(k, 0) * 10;

  return score;
}

/**
 * 文字列を QR マトリクスへエンコードします。
 *
 * @param text UTF-8 として符号化される文字列（URL・任意テキスト）
 * @param ecc 誤り訂正レベル。印刷用途では M または Q を推奨します
 */
export function encodeQr(
  text: string,
  ecc: EccLevel = 'M',
  options: EncodeOptions = {},
): QrMatrix {
  if (text.length === 0) throw new Error('変換する内容が空です。');

  const mode = options.mode ?? chooseMode(text);
  if (mode === 'numeric' && !isNumericText(text)) {
    throw new Error('数字モードは 0〜9 のみで構成された内容にしか使えません。');
  }
  if (mode === 'alphanumeric' && !isAlphanumericText(text)) {
    throw new Error('英数字モードで扱えない文字が含まれています。');
  }

  const version = pickVersion(text, mode, ecc, options.version);
  const codewords = buildCodewords(text, mode, version, ecc);
  const { modules: base, reserved } = buildBaseMatrix(version, codewords);
  const size = base.length;

  let best: number[][] | null = null;
  let bestMask = 0;
  let bestScore = Number.POSITIVE_INFINITY;

  const masks =
    options.mask !== undefined ? [options.mask] : Array.from({ length: 8 }, (_, i) => i);

  for (const mask of masks) {
    if (mask < 0 || mask > 7) throw new Error('マスク番号は 0〜7 で指定してください。');
    const m = base.map((row) => row.slice());
    const maskFn = MASK_FUNCTIONS[mask];

    for (let i = 0; i < size; i += 1) {
      for (let j = 0; j < size; j += 1) {
        if (!reserved[i][j] && maskFn(i, j)) m[i][j] ^= 1;
      }
    }

    const format = formatInformation((ECC_FORMAT_BITS[ecc] << 3) | mask);
    for (let i = 0; i < 15; i += 1) {
      const bit = (format >> i) & 1;
      if (i < 6) m[i][8] = bit;
      else if (i === 6) m[7][8] = bit;
      else if (i === 7) m[8][8] = bit;
      else if (i === 8) m[8][7] = bit;
      else m[8][14 - i] = bit;

      if (i < 8) m[8][size - 1 - i] = bit;
      else m[size - 15 + i][8] = bit;
    }
    m[size - 8][8] = 1; // 常に黒のモジュール

    if (version >= 7) {
      const info = versionInformation(version);
      for (let i = 0; i < 18; i += 1) {
        const bit = (info >> i) & 1;
        const r = Math.floor(i / 3);
        const c = size - 11 + (i % 3);
        m[r][c] = bit;
        m[c][r] = bit;
      }
    }

    const score = masks.length === 1 ? 0 : maskPenalty(m);
    if (score < bestScore) {
      bestScore = score;
      best = m;
      bestMask = mask;
    }
  }

  const chosen = best as number[][];
  return {
    modules: chosen.map((row) => row.map((v) => v === 1)),
    size,
    version,
    ecc,
    mask: bestMask,
    mode,
  };
}

/** 2 つのマトリクスが完全に一致するか（内容一致チェックの実体） */
export function matricesEqual(a: QrMatrix, b: QrMatrix): boolean {
  if (a.size !== b.size) return false;
  for (let i = 0; i < a.size; i += 1) {
    for (let j = 0; j < a.size; j += 1) {
      if (a.modules[i][j] !== b.modules[i][j]) return false;
    }
  }
  return true;
}
