import type { ReactElement } from 'react';

import { encodeQr, type EccLevel } from '@/lib/qr/encoder';
import { grayscalePngDataUri } from '@/lib/qr/png';
import { toDisplayPath } from '@/lib/qr/render';

/* ------------------------------------------------------------------ */
/* ベクター（変換後）                                                    */
/* ------------------------------------------------------------------ */

interface QrModulesProps {
  modules: boolean[][];
  /** 余白のモジュール数 */
  quietZone?: number;
  className?: string;
  /** 読み上げ用の説明。装飾扱いにする場合は省略する */
  title?: string;
}

/** モジュール配置をそのまま矩形パスで描く（実際の出力と同じ考え方） */
export function QrModules({ modules, quietZone = 2, className, title }: QrModulesProps): ReactElement {
  const size = modules.length;
  const total = size + quietZone * 2;
  const path = toDisplayPath({ modules, size, version: 0, ecc: 'M' });

  return (
    <svg
      viewBox={`0 0 ${total} ${total}`}
      className={className}
      shapeRendering="crispEdges"
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <rect width={total} height={total} fill="#FFFFFF" />
      <g transform={`translate(${quietZone} ${quietZone})`}>
        <path d={path} fill="#000000" />
      </g>
    </svg>
  );
}

interface QrVectorProps {
  content: string;
  ecc?: EccLevel;
  quietZone?: number;
  className?: string;
  title?: string;
}

/** 文字列から読み取り可能な QR をベクターで描画します */
export function QrVector({ content, ecc = 'M', quietZone = 2, className, title }: QrVectorProps) {
  const matrix = encodeQr(content, ecc);
  return (
    <QrModules modules={matrix.modules} quietZone={quietZone} className={className} title={title} />
  );
}

/* ------------------------------------------------------------------ */
/* 低解像度（変換前）                                                    */
/* ------------------------------------------------------------------ */

/** 決定的な擬似乱数。サーバーとクライアントで同じ結果になるようにする */
function seededNoise(index: number): number {
  const x = Math.sin(index * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

interface QrLowResProps {
  content: string;
  ecc?: EccLevel;
  /** モジュール 1 個あたりのピクセル数。1.7 前後で「よくある粗い支給画像」になります */
  pixelsPerModule?: number;
  className?: string;
  alt: string;
}

/**
 * 変換前のビジュアル。
 *
 * QR を実際に低解像度のラスター画像へ落としてから拡大表示します。
 * モジュール境界とピクセル境界がずれて中間調が生まれる、
 * 支給画像でよく見る状態をそのまま再現しています（見た目だけの加工ではありません）。
 */
export function QrLowRes({
  content,
  ecc = 'M',
  pixelsPerModule = 1.7,
  className,
  alt,
}: QrLowResProps) {
  const matrix = encodeQr(content, ecc);
  const quiet = 2;
  const gridSize = matrix.size + quiet * 2;
  const pixels = Math.round(gridSize * pixelsPerModule);
  const step = gridSize / pixels;

  const gray = new Uint8Array(pixels * pixels);

  for (let py = 0; py < pixels; py += 1) {
    const y0 = py * step;
    const y1 = y0 + step;
    for (let px = 0; px < pixels; px += 1) {
      const x0 = px * step;
      const x1 = x0 + step;

      // 面積平均（ボックスフィルタ）でモジュールの被覆率を求める
      let dark = 0;
      for (let my = Math.floor(y0); my < Math.min(gridSize, Math.ceil(y1)); my += 1) {
        const oy = Math.min(y1, my + 1) - Math.max(y0, my);
        if (oy <= 0) continue;
        const row = my - quiet;
        if (row < 0 || row >= matrix.size) continue;
        for (let mx = Math.floor(x0); mx < Math.min(gridSize, Math.ceil(x1)); mx += 1) {
          const col = mx - quiet;
          if (col < 0 || col >= matrix.size) continue;
          if (!matrix.modules[row][col]) continue;
          const ox = Math.min(x1, mx + 1) - Math.max(x0, mx);
          if (ox > 0) dark += ox * oy;
        }
      }

      const coverage = Math.min(1, dark / (step * step));
      // 純黒にも純白にもならない = 圧縮された支給画像の状態
      const noise = (seededNoise(py * pixels + px) - 0.5) * 0.1;
      const value = Math.max(0, Math.min(1, 0.94 - coverage * 0.8 + noise));
      gray[py * pixels + px] = Math.round(value * 255);
    }
  }

  const src = grayscalePngDataUri(gray, pixels, pixels);

  return (
    // eslint-disable-next-line @next/next/no-img-element -- data URI のため next/image は不要
    <img src={src} alt={alt} width={pixels} height={pixels} className={className} />
  );
}
