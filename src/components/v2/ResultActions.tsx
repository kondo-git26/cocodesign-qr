'use client';

import { Download, Loader2 } from 'lucide-react';

import type { AnalyzeResult, ConvertResult, Preservation } from '@/lib/convert';

interface ResultActionsProps {
  visible: boolean;
  dotsPreserved: boolean;
  /** 一度でも画像を置いたか（ドット配置ラベルを出すかどうか） */
  fromImage: boolean;
  /** 元配置をどこまで保てたか。詳細の表示に使う */
  preservation: Preservation | null;
  downloading: boolean;
  onDownload: () => void;
  onReset: () => void;
  analysis: AnalyzeResult | null;
  result: ConvertResult | null;
}

const LABELS = [
  { key: 'k100', text: 'K100', delay: 0 },
  { key: 'vector', text: 'ベクター', delay: 140 },
  { key: 'dots', text: 'ドット配置', delay: 280 },
] as const;

/**
 * 変換後に現れる操作。ボタンは「受け取る」ひとつ。
 * 数値や設定は「詳細」を開いた人にだけ見せます。
 */
export function ResultActions({
  visible,
  dotsPreserved,
  fromImage,
  preservation,
  downloading,
  onDownload,
  onReset,
  analysis,
  result,
}: ResultActionsProps) {
  if (!visible) return null;

  return (
    <div className="mt-6">
      <ul className="flex flex-wrap items-center gap-x-5 gap-y-2" aria-label="出力の特徴">
        {LABELS.map((label) => {
          if (label.key === 'dots' && !fromImage) return null;
          const on = label.key !== 'dots' || dotsPreserved;
          return (
            <li
              key={label.key}
              style={{ animationDelay: `${label.delay}ms` }}
              className={`animate-rise-in flex items-center gap-2 font-mono text-xs ${
                on ? 'text-ink' : 'text-sumi-600'
              }`}
            >
              <span
                aria-hidden="true"
                className={`block h-2 w-2 ${on ? 'bg-shu' : 'border border-sumi-300'}`}
              />
              {label.text}
              {!on && <span className="text-2xs">（再生成）</span>}
            </li>
          );
        })}
      </ul>

      <div
        className="animate-rise-in mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        style={{ animationDelay: '380ms' }}
      >
        <button
          type="button"
          onClick={onDownload}
          disabled={downloading}
          aria-label="K100のPDFを受け取る"
          className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-sm border border-ink bg-ink px-10 text-base font-medium tracking-japanese text-paper transition-colors hover:bg-sumi-700 disabled:cursor-wait disabled:opacity-60 sm:w-auto"
        >
          {downloading ? (
            <Loader2 size={18} aria-hidden="true" className="animate-spin" />
          ) : (
            <Download size={18} aria-hidden="true" />
          )}
          受け取る
          <span className="font-mono text-2xs font-normal text-sumi-300">PDF · K100</span>
        </button>
        <p className="text-2xs text-sumi-500">SVG・PNGは登録後に受け取れます</p>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <details className="group">
          <summary className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 py-1 font-mono text-2xs text-sumi-500 hover:text-ink">
            <span aria-hidden="true" className="transition-transform group-open:rotate-90">
              ▸
            </span>
            詳細
          </summary>
          <dl className="mt-3 grid max-w-md gap-x-6 gap-y-1.5 font-mono text-2xs text-sumi-500 sm:grid-cols-2">
            {result && (
              <>
                <Row label="セル数" value={`${result.size} × ${result.size}`} />
                <Row label="型番 / 誤り訂正" value={`ver.${result.version} / ${result.ecc}`} />
                <Row
                  label="ドット配置"
                  value={
                    !result.dotsPreserved
                      ? '内容から再生成'
                      : preservation === 'approximate'
                        ? '元画像の配置を近似で維持'
                        : '元画像の配置をそのまま'
                  }
                />
                <Row
                  label="内容一致"
                  value={
                    result.contentVerified === null
                      ? '—'
                      : result.contentVerified
                        ? '再読み取りで確認'
                        : '要確認'
                  }
                />
                <Row label="色" value="CMYK 0 / 0 / 0 / 100" />
                <Row label="仕上がり" value="20mm 角・余白4セル" />
              </>
            )}
            {analysis && (
              <>
                <Row label="元画像" value={`${analysis.imageWidth} × ${analysis.imageHeight} px`} />
                <Row
                  label="セルあたり画素数"
                  value={analysis.pxPerModule ? `${analysis.pxPerModule.toFixed(1)} px` : '—'}
                />
              </>
            )}
          </dl>
          {analysis?.notes.map((note) => (
            <p key={note} className="mt-2 max-w-md text-2xs leading-5 text-sumi-500">
              {note}
            </p>
          ))}
        </details>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex min-h-11 items-center px-2 font-mono text-2xs text-sumi-500 underline-offset-4 hover:text-ink hover:underline"
        >
          やり直す
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-sumi-200 pb-1">
      <dt>{label}</dt>
      <dd className="text-ink">{value}</dd>
    </div>
  );
}
