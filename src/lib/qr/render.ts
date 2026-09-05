/**
 * QR マトリクスを印刷用データへ書き出すレンダラ。
 *
 * - SVG : ベクター。SVG 規格に CMYK は存在しないため黒は #000000 で出力します
 * - PDF : ベクター。K100（DeviceCMYK 0 / 0 / 0 / 100）で出力します
 * - PNG : ラスター。校正・確認用（ブラウザの canvas を使用）
 *
 * いずれも「元のドット配置（モジュール配置）」をそのまま正方形として書き出し、
 * 補間や平滑化を一切かけません。
 */

import type { QrMatrix } from './encoder';

export const MM_TO_PT = 72 / 25.4;

export interface RenderOptions {
  /** 仕上がりサイズ（クワイエットゾーンを除いた QR 本体の 1 辺・mm） */
  sizeMm: number;
  /** クワイエットゾーン（余白）のモジュール数。規格上の推奨は 4 */
  quietZone: number;
  /** true で K100（CMYK 0/0/0/100）、false で RGB のブラック */
  k100: boolean;
}

/* ------------------------------------------------------------------ */
/* 共通：横方向のランレングスにまとめた矩形リスト                          */
/* ------------------------------------------------------------------ */

export interface ModuleRun {
  row: number;
  col: number;
  length: number;
}

/**
 * 黒モジュールを行単位で連結し、矩形の数を減らします。
 * モジュール境界は動かさないため、ドット配置は変化しません。
 */
export function toModuleRuns(matrix: QrMatrix): ModuleRun[] {
  const runs: ModuleRun[] = [];
  for (let row = 0; row < matrix.size; row += 1) {
    let col = 0;
    while (col < matrix.size) {
      if (!matrix.modules[row][col]) {
        col += 1;
        continue;
      }
      const start = col;
      while (col < matrix.size && matrix.modules[row][col]) col += 1;
      runs.push({ row, col: start, length: col - start });
    }
  }
  return runs;
}

function round(value: number, digits = 4): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

/* ------------------------------------------------------------------ */
/* SVG                                                                 */
/* ------------------------------------------------------------------ */

export function renderSvg(matrix: QrMatrix, options: RenderOptions): string {
  const { sizeMm, quietZone, k100 } = options;
  const module = sizeMm / matrix.size;
  const totalMm = round(sizeMm + module * quietZone * 2);
  const offset = module * quietZone;

  const path = toModuleRuns(matrix)
    .map((run) => {
      const x = round(offset + run.col * module);
      const y = round(offset + run.row * module);
      const w = round(run.length * module);
      const h = round(module);
      return `M${x} ${y}h${w}v${h}h${-w}z`;
    })
    .join('');

  const colorNote = k100
    ? 'K100 (CMYK 0/0/0/100) として出力する前提の黒です。SVG 規格に CMYK 指定は無いため #000000 で記述しています。'
    : 'RGB ブラック (#000000) で出力しています。';

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<!-- ココデザイン 印刷用QRコード変換 / ${matrix.size}×${matrix.size} モジュール / バージョン ${matrix.version} / 誤り訂正 ${matrix.ecc} -->`,
    `<!-- ${colorNote} -->`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="${totalMm}mm" height="${totalMm}mm" viewBox="0 0 ${totalMm} ${totalMm}" shape-rendering="crispEdges">`,
    `<rect width="${totalMm}" height="${totalMm}" fill="#FFFFFF"/>`,
    `<path fill="#000000" d="${path}"/>`,
    '</svg>',
    '',
  ].join('\n');
}

/* ------------------------------------------------------------------ */
/* PDF（K100 ベクター）                                                 */
/* ------------------------------------------------------------------ */

/**
 * 依存を増やさないため、必要最小限の PDF を直接組み立てます。
 * 図形は矩形パスのみなので Illustrator でそのまま編集できます。
 */
export function renderPdf(matrix: QrMatrix, options: RenderOptions): Uint8Array<ArrayBuffer> {
  const { sizeMm, quietZone, k100 } = options;
  const modulePt = (sizeMm * MM_TO_PT) / matrix.size;
  const offsetPt = modulePt * quietZone;
  const pagePt = round(sizeMm * MM_TO_PT + offsetPt * 2, 3);

  const fill = k100 ? '0 0 0 1 k' : '0 0 0 rg';

  // PDF の中身は 1 文字 = 1 バイトを保つため ASCII のみで記述します
  const lines: string[] = ['% COCO DESIGN QR print converter', 'q', fill];

  for (const run of toModuleRuns(matrix)) {
    const x = round(offsetPt + run.col * modulePt, 3);
    // PDF の原点は左下のため Y を反転する
    const y = round(pagePt - offsetPt - (run.row + 1) * modulePt, 3);
    const w = round(run.length * modulePt, 3);
    const h = round(modulePt, 3);
    lines.push(`${x} ${y} ${w} ${h} re`);
  }
  lines.push('f', 'Q');

  const content = lines.join('\n');

  const objects: string[] = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pagePt} ${pagePt}] /Resources << /ProcSet [/PDF] >> /Contents 4 0 R >>`,
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    `<< /Producer (COCO DESIGN QR print converter) /Title (QR ${matrix.size}x${matrix.size} module ver.${matrix.version} ecc-${matrix.ecc}) /Creator (COCO DESIGN) >>`,
  ];

  let pdf = '%PDF-1.7\n%âãÏÓ\n';
  const offsets: number[] = [];
  objects.forEach((body, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (const offset of offsets) {
    pdf += `${offset.toString().padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info 5 0 R >>\n`;
  pdf += `startxref\n${xrefOffset}\n%%EOF\n`;

  // 全て Latin-1 の範囲で組み立てているため 1 文字 = 1 バイト
  const bytes = new Uint8Array(pdf.length);
  for (let i = 0; i < pdf.length; i += 1) bytes[i] = pdf.charCodeAt(i) & 0xff;
  return bytes;
}

/* ------------------------------------------------------------------ */
/* PNG（確認用ラスター / ブラウザ専用）                                   */
/* ------------------------------------------------------------------ */

/**
 * 指定 dpi の PNG を生成します。モジュール境界を整数ピクセルに丸めるため、
 * 拡大時もエッジがにじみません。
 */
export async function renderPngBlob(
  matrix: QrMatrix,
  options: RenderOptions,
  dpi = 600,
): Promise<Blob> {
  const totalModules = matrix.size + options.quietZone * 2;
  const targetPx = (options.sizeMm / 25.4) * dpi;
  const modulePx = Math.max(2, Math.round(targetPx / matrix.size));
  const side = modulePx * totalModules;

  const canvas = document.createElement('canvas');
  canvas.width = side;
  canvas.height = side;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('この環境では PNG を生成できません。');

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, side, side);
  ctx.fillStyle = '#000000';
  const offset = options.quietZone * modulePx;
  for (const run of toModuleRuns(matrix)) {
    ctx.fillRect(
      offset + run.col * modulePx,
      offset + run.row * modulePx,
      run.length * modulePx,
      modulePx,
    );
  }

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('PNG の生成に失敗しました。'));
    }, 'image/png');
  });
}

/* ------------------------------------------------------------------ */
/* 画面表示用の軽量 SVG パス                                             */
/* ------------------------------------------------------------------ */

/** viewBox が 0 0 size size の座標系で使うパス文字列 */
export function toDisplayPath(matrix: QrMatrix): string {
  return toModuleRuns(matrix)
    .map((run) => `M${run.col} ${run.row}h${run.length}v1h${-run.length}z`)
    .join('');
}
