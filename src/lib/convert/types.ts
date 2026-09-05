/**
 * 変換サービスの境界（インターフェース）定義。
 *
 * 画面側はこの型だけに依存します。
 * 既定はブラウザ内で完結する localApi、環境変数を設定するとサーバー API（httpApi）に切り替わります。
 * 詳細は README の「本物のQR変換APIへの差し替え方」を参照してください。
 */

import type { Preservation } from '@/lib/qr/decode';
import type { EccLevel } from '@/lib/qr/encoder';

export type { EccLevel, Preservation };

/** 出力形式 */
export type OutputFormat = 'pdf' | 'svg' | 'png';

/** アップロード画像の解析結果 */
export interface AnalyzeResult {
  /** 読み取れた QR の内容 */
  content: string;
  /** 元画像の幅・高さ（px） */
  imageWidth: number;
  imageHeight: number;
  /** 元画像でのセル 1 個あたりの画素数（読み取り精度の目安。2 未満はかなり厳しい） */
  pxPerModule: number | null;
  /** 1 辺のセル数 */
  cells: number;
  /** 型番 */
  version: number;
  /** 誤り訂正レベル。確定できた場合のみ */
  ecc: EccLevel | null;
  /** 元のドット配置をどこまで保てたか */
  preservation: Preservation;
  /** exact のとき、サンプリング結果と確定配置の差分セル数 */
  mismatchCells: number | null;
  /** 元のドット配置。preservation が none のときは null */
  sourceModules: boolean[][] | null;
  /** 元画像からシンボル部分だけを射影補正で切り出した PNG（data URL）。変換前の見た目 */
  symbolPreview: string | null;
  /** 画面に出す注意事項 */
  notes: string[];
}

/** 解析で得た元配置を変換に引き渡すための最小限の情報 */
export interface SourceLayout {
  modules: boolean[][];
  ecc: EccLevel | null;
}

/** 変換の指定 */
export interface ConvertOptions {
  /** 出力する QR の内容 */
  content: string;
  format: OutputFormat;
  /** K100（CMYK 0/0/0/100）で出力するか */
  k100: boolean;
  /** 元のドット配置をできるだけ維持するか */
  preserveDots: boolean;
  /** 変換後に内容が一致するかを検証するか */
  verifyContent: boolean;
  /** 再生成するときの誤り訂正レベル */
  ecc: EccLevel;
  /** 仕上がりサイズ（mm・QR 本体の 1 辺） */
  sizeMm: number;
  /** クワイエットゾーン（余白）のモジュール数 */
  quietZone: number;
  /** 解析で得た元配置。preserveDots が有効で内容が一致する場合にそのまま使う */
  source?: SourceLayout | null;
}

/** 変換後のチェック項目 */
export interface CheckItem {
  id: string;
  label: string;
  status: 'pass' | 'info' | 'warn';
  detail: string;
}

/** 変換結果 */
export interface ConvertResult {
  fileName: string;
  mimeType: string;
  /** ダウンロード用データ */
  blob: Blob;
  /** 画面プレビュー用のモジュール配置 */
  modules: boolean[][];
  size: number;
  version: number;
  ecc: EccLevel;
  byteSize: number;
  checks: CheckItem[];
  /** 元のドット配置をそのまま書き出したか */
  dotsPreserved: boolean;
  /** 内容一致チェックの結果。未実施なら null */
  contentVerified: boolean | null;
}

/** 変換サービスの実装が満たすインターフェース */
export interface ConverterApi {
  /** 実装の種類 */
  readonly kind: 'local' | 'http';
  analyzeImage(file: File): Promise<AnalyzeResult>;
  convert(options: ConvertOptions): Promise<ConvertResult>;
}

/** 入力エラー。画面ではフォーム直下に表示します */
export class ConvertInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConvertInputError';
  }
}

/** 画像は読めたが QR が見つからなかった */
export class QrNotFoundError extends ConvertInputError {
  constructor(message = 'QRコードを見つけられませんでした。別の画像でお試しください。') {
    super(message);
    this.name = 'QrNotFoundError';
  }
}

export const ACCEPTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
export const ACCEPTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'] as const;
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export const OUTPUT_FORMAT_LABELS: Record<OutputFormat, { label: string; note: string }> = {
  pdf: { label: 'PDF', note: 'ベクター・K100で出力' },
  svg: { label: 'SVG', note: 'ベクター・Web/編集向け' },
  png: { label: 'PNG', note: 'ラスター・確認用' },
};

export const ECC_LABELS: Record<EccLevel, string> = {
  L: 'L（約7%復元）',
  M: 'M（約15%復元）',
  Q: 'Q（約25%復元）',
  H: 'H（約30%復元）',
};
