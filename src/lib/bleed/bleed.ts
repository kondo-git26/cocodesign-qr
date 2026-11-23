/**
 * 塗り足し（ブリード）を付ける処理。ブラウザ内で完結し、画像は外に送りません。
 *
 * 仕上がりサイズの画像を受け取り、四辺に塗り足しぶんを足した画像を返します。
 * 足した部分は、元画像のふちから作ります（伸ばす / 折り返す）。
 * PDF には TrimBox（仕上がり線）と BleedBox（塗り足しを含む範囲）を書き、
 * 印刷会社のチェックで「塗り足しあり」と読めるようにします。
 */

export type BleedMode = 'extend' | 'mirror';

export interface PaperSize {
  id: string;
  label: string;
  /** 縦長で置いたときの幅・高さ（mm） */
  widthMm: number;
  heightMm: number;
}

export const PAPER_SIZES: readonly PaperSize[] = [
  { id: 'meishi', label: '名刺 91×55mm', widthMm: 55, heightMm: 91 },
  { id: 'hagaki', label: 'はがき 100×148mm', widthMm: 100, heightMm: 148 },
  { id: 'a6', label: 'A6 105×148mm', widthMm: 105, heightMm: 148 },
  { id: 'a5', label: 'A5 148×210mm', widthMm: 148, heightMm: 210 },
  { id: 'b5', label: 'B5 182×257mm', widthMm: 182, heightMm: 257 },
  { id: 'a4', label: 'A4 210×297mm', widthMm: 210, heightMm: 297 },
  { id: 'b4', label: 'B4 257×364mm', widthMm: 257, heightMm: 364 },
  { id: 'a3', label: 'A3 297×420mm', widthMm: 297, heightMm: 420 },
  { id: 'square', label: '正方形 90×90mm（シールなど）', widthMm: 90, heightMm: 90 },
];

export const BLEED_MM = 3;
/** 出力の最大解像度。これ以上にしても印刷の見た目は変わらず、ファイルが重くなるだけ */
const MAX_DPI = 350;
/** 出力画像の画素数の上限（ブラウザの限界に当たらないように） */
const MAX_PIXELS = 40_000_000;

export interface BleedOptions {
  /** 仕上がりサイズ（mm） */
  widthMm: number;
  heightMm: number;
  bleedMm: number;
  mode: BleedMode;
}

export interface BleedResult {
  canvas: HTMLCanvasElement;
  /** 出力の解像度（dpi） */
  dpi: number;
  /** 元画像を仕上がりサイズに置いたときの実効解像度（dpi） */
  sourceDpi: number;
  /** 仕上がり部分・塗り足し部分の画素数 */
  trimWidthPx: number;
  trimHeightPx: number;
  bleedPx: number;
  /** 画像の縦横比が仕上がりサイズと違い、はみ出した分を切ったか */
  cropped: boolean;
  /** 仕上がりサイズ・塗り足し（mm）。PDF に書く */
  options: BleedOptions;
}

export class BleedInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BleedInputError';
  }
}

/** 画像の向きに合わせて、用紙の幅・高さを入れ替える */
export function orientPaper(paper: { widthMm: number; heightMm: number }, imageW: number, imageH: number) {
  const landscape = imageW > imageH;
  const paperLandscape = paper.widthMm > paper.heightMm;
  if (landscape === paperLandscape || paper.widthMm === paper.heightMm) {
    return { widthMm: paper.widthMm, heightMm: paper.heightMm };
  }
  return { widthMm: paper.heightMm, heightMm: paper.widthMm };
}

export async function loadImage(file: File): Promise<ImageBitmap> {
  try {
    // 写真の回転情報（EXIF）を反映して読む
    return await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    throw new BleedInputError('この画像は読めませんでした。PNG か JPEG でお試しください。');
  }
}

export function makeBleed(image: ImageBitmap, options: BleedOptions): BleedResult {
  const { widthMm, heightMm, bleedMm, mode } = options;
  if (!(widthMm > 0 && heightMm > 0)) throw new BleedInputError('仕上がりサイズを入れてください。');

  // 元画像を仕上がりサイズに置いたときの解像度（長辺ではなく両方向の小さい方）
  const sourceDpi = Math.min((image.width / widthMm) * 25.4, (image.height / heightMm) * 25.4);

  let dpi = Math.min(MAX_DPI, Math.max(72, Math.round(sourceDpi)));
  const pixelsAt = (d: number) =>
    Math.round(((widthMm + bleedMm * 2) / 25.4) * d) * Math.round(((heightMm + bleedMm * 2) / 25.4) * d);
  while (pixelsAt(dpi) > MAX_PIXELS && dpi > 72) dpi -= 10;

  const mmToPx = (mm: number) => Math.round((mm / 25.4) * dpi);
  const bleedPx = mmToPx(bleedMm);
  const trimW = mmToPx(widthMm);
  const trimH = mmToPx(heightMm);

  // 1. 仕上がりサイズの画像を作る（縦横比が違えば中央を残して切る）
  const trim = document.createElement('canvas');
  trim.width = trimW;
  trim.height = trimH;
  const tctx = trim.getContext('2d');
  if (!tctx) throw new BleedInputError('この環境では画像を作れません。');
  tctx.fillStyle = '#FFFFFF';
  tctx.fillRect(0, 0, trimW, trimH);
  tctx.imageSmoothingEnabled = true;
  tctx.imageSmoothingQuality = 'high';

  const targetRatio = trimW / trimH;
  const imageRatio = image.width / image.height;
  const cropped = Math.abs(imageRatio / targetRatio - 1) > 0.015;
  let sx = 0;
  let sy = 0;
  let sw = image.width;
  let sh = image.height;
  if (cropped) {
    if (imageRatio > targetRatio) {
      sw = image.height * targetRatio;
      sx = (image.width - sw) / 2;
    } else {
      sh = image.width / targetRatio;
      sy = (image.height - sh) / 2;
    }
  }
  tctx.drawImage(image, sx, sy, sw, sh, 0, 0, trimW, trimH);

  // 2. 塗り足しぶん大きなキャンバスに、中央へ置く
  const out = document.createElement('canvas');
  out.width = trimW + bleedPx * 2;
  out.height = trimH + bleedPx * 2;
  const ctx = out.getContext('2d');
  if (!ctx) throw new BleedInputError('この環境では画像を作れません。');
  ctx.imageSmoothingEnabled = false;
  const b = bleedPx;
  const W = trimW;
  const H = trimH;

  if (b > 0) {
    if (mode === 'extend') {
      // ふちの 1 ピクセル幅を外へ引き伸ばす
      ctx.drawImage(trim, 0, 0, W, 1, b, 0, W, b); // 上
      ctx.drawImage(trim, 0, H - 1, W, 1, b, b + H, W, b); // 下
      ctx.drawImage(trim, 0, 0, 1, H, 0, b, b, H); // 左
      ctx.drawImage(trim, W - 1, 0, 1, H, b + W, b, b, H); // 右
      // 四隅は角の 1 ピクセルの色で埋める
      ctx.drawImage(trim, 0, 0, 1, 1, 0, 0, b, b);
      ctx.drawImage(trim, W - 1, 0, 1, 1, b + W, 0, b, b);
      ctx.drawImage(trim, 0, H - 1, 1, 1, 0, b + H, b, b);
      ctx.drawImage(trim, W - 1, H - 1, 1, 1, b + W, b + H, b, b);
    } else {
      // ふちの内側を鏡のように折り返す
      const flip = (
        sxp: number,
        syp: number,
        swp: number,
        shp: number,
        dx: number,
        dy: number,
        sxScale: number,
        syScale: number,
      ) => {
        ctx.save();
        ctx.translate(sxScale < 0 ? dx + swp : dx, syScale < 0 ? dy + shp : dy);
        ctx.scale(sxScale, syScale);
        ctx.drawImage(trim, sxp, syp, swp, shp, 0, 0, swp, shp);
        ctx.restore();
      };
      const bw = Math.min(b, W);
      const bh = Math.min(b, H);
      flip(0, 0, W, bh, b, b - bh, 1, -1); // 上
      flip(0, H - bh, W, bh, b, b + H, 1, -1); // 下
      flip(0, 0, bw, H, b - bw, b, -1, 1); // 左
      flip(W - bw, 0, bw, H, b + W, b, -1, 1); // 右
      flip(0, 0, bw, bh, b - bw, b - bh, -1, -1); // 左上
      flip(W - bw, 0, bw, bh, b + W, b - bh, -1, -1); // 右上
      flip(0, H - bh, bw, bh, b - bw, b + H, -1, -1); // 左下
      flip(W - bw, H - bh, bw, bh, b + W, b + H, -1, -1); // 右下
    }
  }
  ctx.drawImage(trim, b, b);

  return {
    canvas: out,
    dpi,
    sourceDpi,
    trimWidthPx: trimW,
    trimHeightPx: trimH,
    bleedPx: b,
    cropped,
    options,
  };
}

/* ------------------------------------------------------------------ */
/* 書き出し                                                             */
/* ------------------------------------------------------------------ */

export function toPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new BleedInputError('PNG の書き出しに失敗しました。'));
    }, 'image/png');
  });
}

const encoder = new TextEncoder();

function concat(parts: Uint8Array[]): Uint8Array<ArrayBuffer> {
  const total = parts.reduce((sum, p) => sum + p.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const p of parts) {
    out.set(p, offset);
    offset += p.length;
  }
  return out;
}

async function deflate(data: Uint8Array<ArrayBuffer>): Promise<Uint8Array<ArrayBuffer>> {
  // PDF の FlateDecode は zlib 形式。ブラウザの 'deflate' がその形式
  const stream = new Blob([data]).stream().pipeThrough(new CompressionStream('deflate'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

const MM_TO_PT = 72 / 25.4;
const fmt = (n: number) => (Math.round(n * 1000) / 1000).toString();

/**
 * 画像を 1 枚だけ置いた PDF を作る。
 * 画像は可逆圧縮（劣化なし）。MediaBox = BleedBox = 塗り足しを含む範囲、TrimBox = 仕上がり。
 * 色は RGB のまま（CMYK 変換はしない）。
 */
export async function toPdfBlob(result: BleedResult): Promise<Blob> {
  const { canvas, options } = result;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new BleedInputError('PDF の書き出しに失敗しました。');
  if (typeof CompressionStream === 'undefined') {
    throw new BleedInputError('このブラウザでは PDF を作れません。PNG をお使いください。');
  }

  const { width, height } = canvas;
  const rgba = ctx.getImageData(0, 0, width, height).data;
  const rgb = new Uint8Array(width * height * 3);
  for (let i = 0, j = 0; i < rgba.length; i += 4, j += 3) {
    rgb[j] = rgba[i];
    rgb[j + 1] = rgba[i + 1];
    rgb[j + 2] = rgba[i + 2];
  }
  const compressed = await deflate(rgb);

  const pageW = (options.widthMm + options.bleedMm * 2) * MM_TO_PT;
  const pageH = (options.heightMm + options.bleedMm * 2) * MM_TO_PT;
  const bleedPt = options.bleedMm * MM_TO_PT;
  const content = `q ${fmt(pageW)} 0 0 ${fmt(pageH)} 0 0 cm /Im0 Do Q`;

  const header = encoder.encode('%PDF-1.7\n%\xE2\xE3\xCF\xD3\n');
  const chunks: Uint8Array[] = [header];
  const offsets: number[] = [];
  let length = header.length;
  const push = (bytes: Uint8Array) => {
    chunks.push(bytes);
    length += bytes.length;
  };
  const addObject = (n: number, head: string, stream?: Uint8Array) => {
    offsets[n] = length;
    if (stream) {
      push(encoder.encode(`${n} 0 obj\n${head.replace('>>', `/Length ${stream.length} >>`)}\nstream\n`));
      push(stream);
      push(encoder.encode('\nendstream\nendobj\n'));
    } else {
      push(encoder.encode(`${n} 0 obj\n${head}\nendobj\n`));
    }
  };

  const box = `[0 0 ${fmt(pageW)} ${fmt(pageH)}]`;
  const trimBox = `[${fmt(bleedPt)} ${fmt(bleedPt)} ${fmt(pageW - bleedPt)} ${fmt(pageH - bleedPt)}]`;

  addObject(1, '<< /Type /Catalog /Pages 2 0 R >>');
  addObject(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  addObject(
    3,
    `<< /Type /Page /Parent 2 0 R /MediaBox ${box} /BleedBox ${box} /TrimBox ${trimBox} ` +
      `/Resources << /XObject << /Im0 4 0 R >> /ProcSet [/PDF /ImageC] >> /Contents 5 0 R >>`,
  );
  addObject(
    4,
    `<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} ` +
      '/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode >>',
    compressed,
  );
  addObject(5, '<< >>', encoder.encode(content));
  addObject(6, '<< /Title (Nurikomi 3mm) /Producer (cocodesign.pro) >>');

  const xrefOffset = length;
  let xref = `xref\n0 7\n0000000000 65535 f \n`;
  for (let n = 1; n <= 6; n += 1) xref += `${offsets[n].toString().padStart(10, '0')} 00000 n \n`;
  xref += `trailer\n<< /Size 7 /Root 1 0 R /Info 6 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  push(encoder.encode(xref));

  return new Blob([concat(chunks)], { type: 'application/pdf' });
}
