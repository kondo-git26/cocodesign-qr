'use client';

import { Check, Download, Info, TriangleAlert } from 'lucide-react';

import { QrModules } from '@/components/ui/QrArtwork';
import { OUTPUT_FORMAT_LABELS, type ConvertResult, type OutputFormat } from '@/lib/convert';

import { formatBytes } from './UploadDropzone';

const STATUS_ICON = {
  pass: Check,
  info: Info,
  warn: TriangleAlert,
} as const;

const STATUS_COLOR = {
  pass: 'text-aomidori',
  info: 'text-sumi-500',
  warn: 'text-shu',
} as const;

export function ResultPanel({
  result,
  format,
  onDownload,
}: {
  result: ConvertResult;
  format: OutputFormat;
  onDownload: () => void;
}) {
  return (
    <div className="border border-ink bg-paper">
      <div className="flex items-center justify-between border-b border-sumi-200 bg-sumi-50 px-4 py-2.5">
        <p className="flex items-center gap-2 text-sm font-medium text-ink">
          <Check size={16} aria-hidden="true" className="text-aomidori" />
          変換完了
        </p>
        <span className="spec-label">{OUTPUT_FORMAT_LABELS[format].label}</span>
      </div>

      <div className="grid gap-6 p-4 sm:grid-cols-[minmax(0,180px)_1fr] sm:p-5">
        <div>
          <div className="border border-sumi-200 bg-paper p-2">
            <QrModules
              modules={result.modules}
              quietZone={2}
              className="h-auto w-full"
              title="変換後のQRコード（プレビュー）"
            />
          </div>
          <dl className="mt-3 space-y-1 font-mono text-2xs text-sumi-500">
            <div className="flex justify-between gap-2">
              <dt>セル数</dt>
              <dd className="text-ink">
                {result.size} × {result.size}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>型番</dt>
              <dd className="text-ink">ver.{result.version}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>誤り訂正</dt>
              <dd className="text-ink">{result.ecc}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>サイズ</dt>
              <dd className="text-ink">{formatBytes(result.byteSize)}</dd>
            </div>
          </dl>
        </div>

        <div className="min-w-0">
          <ul className="space-y-3">
            {result.checks.map((check) => {
              const Icon = STATUS_ICON[check.status];
              return (
                <li key={check.id} className="flex gap-2.5">
                  <Icon
                    size={15}
                    aria-hidden="true"
                    className={`mt-0.5 shrink-0 ${STATUS_COLOR[check.status]}`}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">
                      {check.label}
                      <span className="sr-only">
                        {check.status === 'pass'
                          ? '：確認済み'
                          : check.status === 'warn'
                            ? '：要確認'
                            : '：補足'}
                      </span>
                    </p>
                    <p className="mt-0.5 text-2xs leading-5 text-sumi-500">{check.detail}</p>
                  </div>
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            onClick={onDownload}
            className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-sm border border-ink bg-ink px-5 text-sm font-medium text-paper transition-colors hover:bg-sumi-700 sm:w-auto"
          >
            <Download size={16} aria-hidden="true" />
            ダウンロード
            <span className="font-mono text-2xs font-normal text-sumi-300">{result.fileName}</span>
          </button>

          <p className="mt-3 text-2xs leading-5 text-sumi-500">
            ダウンロード後、内容が正しいかを必ず確認してください。印刷前に実データでのテストをおすすめします。
          </p>
        </div>
      </div>
    </div>
  );
}
