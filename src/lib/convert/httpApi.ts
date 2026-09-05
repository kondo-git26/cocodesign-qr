/**
 * 本実装の QR 変換 API を呼ぶクライアント。
 *
 * 環境変数 `NEXT_PUBLIC_CONVERT_API_BASE` を設定すると、
 * 画面側は何も変えずにこちらの実装へ切り替わります（index.ts を参照）。
 *
 * 期待するサーバー側のエンドポイントは 2 つだけです。
 *
 *   POST {base}/analyze
 *     multipart/form-data  field: "file"
 *     → AnalyzeResult を JSON で返す
 *
 *   POST {base}/convert
 *     application/json      body: ConvertOptions
 *     → 変換済みファイルをバイナリで返す
 *        ヘッダ:
 *          Content-Type            : application/pdf | image/svg+xml | image/png
 *          Content-Disposition     : filename を含む
 *          X-Qr-Modules            : モジュール配置（"0101..." を size 行分、改行区切り）
 *          X-Qr-Version / X-Qr-Ecc : 型番・誤り訂正レベル
 *          X-Qr-Checks             : CheckItem[] を JSON 文字列化したもの
 */

import { encodeQr } from '@/lib/qr/encoder';
import {
  ConvertInputError,
  type AnalyzeResult,
  type CheckItem,
  type ConverterApi,
  type ConvertOptions,
  type ConvertResult,
  type EccLevel,
} from './types';

function parseFileName(disposition: string | null, fallback: string): string {
  if (!disposition) return fallback;
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition);
  return match ? decodeURIComponent(match[1]) : fallback;
}

function parseModules(raw: string | null): boolean[][] {
  if (!raw) return [];
  return raw
    .trim()
    .split(/[\n,]/)
    .filter((line) => line.length > 0)
    .map((line) => Array.from(line.trim()).map((ch) => ch === '1'));
}

export function createHttpConverterApi(baseUrl: string): ConverterApi {
  const base = baseUrl.replace(/\/+$/, '');

  return {
    kind: 'http',

    async analyzeImage(file: File): Promise<AnalyzeResult> {
      const form = new FormData();
      form.append('file', file);

      const response = await fetch(`${base}/analyze`, { method: 'POST', body: form });
      if (!response.ok) {
        throw new ConvertInputError(
          `解析に失敗しました（${response.status}）。時間をおいて再度お試しください。`,
        );
      }
      return (await response.json()) as AnalyzeResult;
    },

    async convert(options: ConvertOptions): Promise<ConvertResult> {
      const response = await fetch(`${base}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        throw new ConvertInputError(
          `変換に失敗しました（${response.status}）。内容を確認して再度お試しください。`,
        );
      }

      const blob = await response.blob();
      const modules = parseModules(response.headers.get('X-Qr-Modules'));

      // サーバーがモジュール配置を返さない場合は、表示用にクライアント側で再現します
      const preview = modules.length > 0 ? modules : encodeQr(options.content, options.ecc).modules;

      let checks: CheckItem[] = [];
      const rawChecks = response.headers.get('X-Qr-Checks');
      if (rawChecks) {
        try {
          checks = JSON.parse(rawChecks) as CheckItem[];
        } catch {
          checks = [];
        }
      }

      return {
        fileName: parseFileName(
          response.headers.get('Content-Disposition'),
          `qr_K100.${options.format}`,
        ),
        mimeType: blob.type || 'application/octet-stream',
        blob,
        modules: preview,
        size: preview.length,
        version: Number(response.headers.get('X-Qr-Version') ?? 0),
        ecc: (response.headers.get('X-Qr-Ecc') as EccLevel | null) ?? options.ecc,
        byteSize: blob.size,
        checks,
        dotsPreserved: response.headers.get('X-Qr-Dots-Preserved') === 'true',
        contentVerified:
          response.headers.get('X-Qr-Content-Verified') === null
            ? null
            : response.headers.get('X-Qr-Content-Verified') === 'true',
      };
    },
  };
}
