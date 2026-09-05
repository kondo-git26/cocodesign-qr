/**
 * ブラウザ内で完結する変換実装（既定）。
 *
 * - 画像からの QR 読み取り      : jsQR + 元配置のサンプリング（lib/qr/decode.ts）
 * - QR 生成                    : 自前エンコーダ（lib/qr/encoder.ts）
 * - PDF / SVG / PNG の書き出し : lib/qr/render.ts
 * - 内容一致チェック            : 出力する配置を描き直して再読み取りし、内容を照合
 *
 * 画像がサーバーへ送られることはありません。
 */

import { cropSymbol, decodeQr, verifyModulesDecodeTo, type RgbaImage } from '@/lib/qr/decode';
import { encodeQr, QrCapacityError, type QrMatrix } from '@/lib/qr/encoder';
import { renderPdf, renderPngBlob, renderSvg } from '@/lib/qr/render';

import {
  ACCEPTED_EXTENSIONS,
  ACCEPTED_MIME_TYPES,
  ConvertInputError,
  MAX_UPLOAD_BYTES,
  QrNotFoundError,
  type AnalyzeResult,
  type CheckItem,
  type ConverterApi,
  type ConvertOptions,
  type ConvertResult,
} from './types';

/** デコードに使う作業画像の長辺の上限（これより大きい画像は縮小してから読む） */
const MAX_DECODE_SIDE = 1600;
/** 変換前ビジュアル用の切り出しサイズ（px） */
const PREVIEW_SIDE = 480;

/* ------------------------------------------------------------------ */
/* ブラウザ依存のユーティリティ                                           */
/* ------------------------------------------------------------------ */

function isSupportedImage(file: File): boolean {
  if ((ACCEPTED_MIME_TYPES as readonly string[]).includes(file.type)) return true;
  const lower = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((extension) => lower.endsWith(extension));
}

function loadImageElement(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new ConvertInputError('画像を読み込めませんでした。JPG・PNG・WebPでお試しください。'));
    };
    image.src = url;
  });
}

function imageToRgba(image: HTMLImageElement, maxSide: number): { rgba: RgbaImage; scale: number } {
  const longSide = Math.max(image.naturalWidth, image.naturalHeight);
  const scale = Math.min(1, maxSide / longSide);
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new ConvertInputError('この環境では画像を解析できません。');
  ctx.imageSmoothingEnabled = scale < 1;
  ctx.drawImage(image, 0, 0, width, height);
  const imageData = ctx.getImageData(0, 0, width, height);
  return { rgba: { data: imageData.data, width, height }, scale };
}

function rgbaToDataUrl(img: RgbaImage): string {
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  // ImageData は ArrayBuffer 裏付けの配列を要求するため、コピーして渡す
  const pixels = new Uint8ClampedArray(img.data);
  ctx.putImageData(new ImageData(pixels, img.width, img.height), 0, 0);
  return canvas.toDataURL('image/png');
}

/** ファイル名に使える形へ整える */
function toSafeStem(content: string): string {
  const stem = content
    .replace(/^https?:\/\//, '')
    .replace(/[^0-9A-Za-z._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return stem.length > 0 ? stem : 'qr';
}

/* ------------------------------------------------------------------ */
/* チェック項目                                                         */
/* ------------------------------------------------------------------ */

function buildChecks(
  options: ConvertOptions,
  info: { size: number; dotsPreserved: boolean; contentVerified: boolean | null },
): CheckItem[] {
  const checks: CheckItem[] = [];

  if (info.contentVerified !== null) {
    checks.push({
      id: 'content',
      label: 'QR内容一致',
      status: info.contentVerified ? 'pass' : 'warn',
      detail: info.contentVerified
        ? '出力する配置を描き直して再読み取りし、内容が一致することを確認しました。'
        : '再読み取りで内容を確認できませんでした。印刷前に必ず実際の読み取りをテストしてください。',
    });
  }

  checks.push({
    id: 'dots',
    label: 'ドット配置',
    status: info.dotsPreserved ? 'pass' : 'info',
    detail: info.dotsPreserved
      ? `元画像の ${info.size} × ${info.size} セルの並びをそのまま書き出しました。補間・平滑化はかけていません。`
      : options.source
        ? '内容から再生成しました。セルの並びは元画像と異なります。'
        : `${info.size} × ${info.size} セルで新規に生成しました。`,
  });

  checks.push({
    id: 'color',
    label: 'K100',
    status: options.k100 ? 'pass' : 'info',
    detail:
      options.format === 'pdf'
        ? options.k100
          ? 'PDF の黒を CMYK 0 / 0 / 0 / 100 で出力しました。'
          : 'RGB のブラックで出力しました。印刷用途では K100 を推奨します。'
        : options.format === 'svg'
          ? 'SVG 規格に CMYK 指定はないため #000000 で出力しています。Illustrator 側でカラーモードを CMYK にすると K100 として扱えます。'
          : 'PNG はラスター形式です。校正・確認用としてお使いください。',
  });

  checks.push({
    id: 'vector',
    label: 'ベクター',
    status: options.format === 'png' ? 'info' : 'pass',
    detail:
      options.format === 'png'
        ? 'PNG はラスターのため、拡大時の再現性は解像度に依存します。'
        : '矩形パスのみで構成しています。Illustrator でそのまま編集・再利用できます。',
  });

  return checks;
}

/* ------------------------------------------------------------------ */
/* 実装                                                                */
/* ------------------------------------------------------------------ */

export function createLocalConverterApi(): ConverterApi {
  return {
    kind: 'local',

    async analyzeImage(file: File): Promise<AnalyzeResult> {
      if (file.size > MAX_UPLOAD_BYTES) {
        throw new ConvertInputError('ファイルサイズが 10MB を超えています。');
      }
      if (file.type === 'application/pdf') {
        throw new ConvertInputError(
          'PDF の読み取りは準備中です。QR 部分を JPG または PNG に書き出してお試しください。',
        );
      }
      if (!isSupportedImage(file)) {
        throw new ConvertInputError('JPG・PNG・WebPのいずれかを選択してください。');
      }

      const image = await loadImageElement(file);
      const { rgba, scale } = imageToRgba(image, MAX_DECODE_SIDE);
      const decoded = decodeQr(rgba);
      if (!decoded) throw new QrNotFoundError();

      const [tl, tr] = decoded.corners;
      const symbolWidthPx = Math.hypot(tr.x - tl.x, tr.y - tl.y) / scale;
      const pxPerModule = symbolWidthPx > 0 ? symbolWidthPx / decoded.size : null;

      const notes: string[] = [];
      if (decoded.preservation === 'approximate') {
        notes.push('元の配置を近似で取り出しました。数セルの誤差が残る可能性があります。');
      } else if (decoded.preservation === 'none') {
        notes.push('元の配置を取り出せなかったため、読み取った内容から再生成します。');
      }
      if (pxPerModule !== null && pxPerModule < 2) {
        notes.push('元画像がかなり小さいため、印刷前に必ず実際の読み取りをテストしてください。');
      }

      return {
        content: decoded.data,
        imageWidth: image.naturalWidth,
        imageHeight: image.naturalHeight,
        pxPerModule,
        cells: decoded.size,
        version: decoded.version,
        ecc: decoded.ecc,
        preservation: decoded.preservation,
        mismatchCells: decoded.mismatchCells,
        sourceModules: decoded.modules,
        symbolPreview: rgbaToDataUrl(
          cropSymbol(rgba, decoded.corners, decoded.size, PREVIEW_SIDE, 2),
        ),
        notes,
      };
    },

    async convert(options: ConvertOptions): Promise<ConvertResult> {
      const content = options.content.trim();
      if (content.length === 0) {
        throw new ConvertInputError('変換する内容を入力してください。');
      }

      // 元配置が使えるのは、配置維持が有効で、その配置が今の内容を指している場合だけ。
      // この場合は再エンコードしないため、文字数の上限も関係ありません。
      let matrix: QrMatrix;
      let dotsPreserved = false;
      const source = options.preserveDots ? (options.source ?? null) : null;
      if (source && verifyModulesDecodeTo(source.modules, content)) {
        const size = source.modules.length;
        matrix = {
          modules: source.modules,
          size,
          version: (size - 17) / 4,
          ecc: source.ecc ?? options.ecc,
        };
        dotsPreserved = true;
      } else {
        if (content.length > 500) {
          throw new ConvertInputError(
            'QRの内容が500文字を超えているため変換できません。文字数を減らしてください。',
          );
        }
        try {
          matrix = encodeQr(content, options.ecc);
        } catch (error) {
          if (error instanceof QrCapacityError) {
            throw new ConvertInputError(
              '内容が長すぎて QR に収まりません。文字数を減らしてください。',
            );
          }
          throw error;
        }
      }

      const contentVerified = options.verifyContent
        ? verifyModulesDecodeTo(matrix.modules, content)
        : null;

      const renderOptions = {
        sizeMm: options.sizeMm,
        quietZone: options.quietZone,
        k100: options.k100,
      };

      const stem = toSafeStem(content);
      let blob: Blob;
      let fileName: string;
      let mimeType: string;

      if (options.format === 'svg') {
        mimeType = 'image/svg+xml';
        blob = new Blob([renderSvg(matrix, renderOptions)], { type: mimeType });
        fileName = `${stem}_K100.svg`;
      } else if (options.format === 'pdf') {
        mimeType = 'application/pdf';
        blob = new Blob([renderPdf(matrix, renderOptions)], { type: mimeType });
        fileName = `${stem}_K100.pdf`;
      } else {
        mimeType = 'image/png';
        blob = await renderPngBlob(matrix, renderOptions);
        fileName = `${stem}_600dpi.png`;
      }

      return {
        fileName,
        mimeType,
        blob,
        modules: matrix.modules,
        size: matrix.size,
        version: matrix.version,
        ecc: matrix.ecc,
        byteSize: blob.size,
        checks: buildChecks(options, { size: matrix.size, dotsPreserved, contentVerified }),
        dotsPreserved,
        contentVerified,
      };
    },
  };
}
