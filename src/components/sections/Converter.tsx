'use client';

import { FileText, Loader2, TriangleAlert, Wand2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  EccSelect,
  FormatSelect,
  SizeSelect,
  ToggleRow,
} from '@/components/converter/OptionControls';
import { ResultPanel } from '@/components/converter/ResultPanel';
import { UploadDropzone } from '@/components/converter/UploadDropzone';
import {
  ConvertInputError,
  getConverterApi,
  type AnalyzeResult,
  type ConvertResult,
  type EccLevel,
  type OutputFormat,
} from '@/lib/convert';

type Tab = 'image' | 'text';
type Status = 'idle' | 'analyzing' | 'converting' | 'done';

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'image', label: '画像から変換' },
  { id: 'text', label: 'URL・テキストから生成' },
];

export function Converter() {
  const api = useMemo(() => getConverterApi(), []);

  const [tab, setTab] = useState<Tab>('image');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalyzeResult | null>(null);

  const [imageContent, setImageContent] = useState('');
  const [textContent, setTextContent] = useState('https://cocodesign.jp/');

  const [format, setFormat] = useState<OutputFormat>('pdf');
  const [k100, setK100] = useState(true);
  const [preserveDots, setPreserveDots] = useState(true);
  const [verifyContent, setVerifyContent] = useState(true);
  const [ecc, setEcc] = useState<EccLevel>('M');
  const [sizeMm, setSizeMm] = useState(20);

  const [result, setResult] = useState<ConvertResult | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const content = tab === 'image' ? imageContent : textContent;
  const busy = status === 'analyzing' || status === 'converting';

  // 入力や設定が変われば、前回の結果は無効にする
  const invalidate = useCallback(() => {
    setResult(null);
    setStatus((current) => (current === 'done' ? 'idle' : current));
  }, []);

  // 一時URLは差し替え時・アンマウント時にまとめて解放する
  useEffect(() => {
    if (!previewUrl) return undefined;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const handleSelectFile = async (selected: File) => {
    setError(null);
    setResult(null);
    setFile(selected);
    setAnalysis(null);
    setPreviewUrl(
      selected.type === 'application/pdf' ? null : URL.createObjectURL(selected),
    );

    setStatus('analyzing');
    try {
      const analyzed = await api.analyzeImage(selected);
      setAnalysis(analyzed);
      setImageContent(analyzed.content);
      if (analyzed.ecc) setEcc(analyzed.ecc);
      setStatus('idle');
    } catch (caught) {
      setStatus('idle');
      setError(
        caught instanceof ConvertInputError
          ? caught.message
          : '解析に失敗しました。別の画像でお試しください。',
      );
    }
  };

  const handleClearFile = () => {
    setFile(null);
    setAnalysis(null);
    setImageContent('');
    setResult(null);
    setError(null);
    setStatus('idle');
    setPreviewUrl(null);
  };

  const handleConvert = async () => {
    setError(null);

    if (content.trim().length === 0) {
      setError(
        tab === 'image'
          ? 'QRの読み取り内容が空です。内容を入力してください。'
          : 'URLまたはテキストを入力してください。',
      );
      return;
    }

    setStatus('converting');
    try {
      const converted = await api.convert({
        content: content.trim(),
        format,
        k100,
        preserveDots,
        verifyContent,
        ecc,
        sizeMm,
        quietZone: 4,
        source:
          tab === 'image' && analysis?.sourceModules
            ? { modules: analysis.sourceModules, ecc: analysis.ecc }
            : null,
      });
      setResult(converted);
      setStatus('done');
      window.setTimeout(() => {
        resultRef.current?.focus();
      }, 0);
    } catch (caught) {
      setStatus('idle');
      setError(
        caught instanceof ConvertInputError
          ? caught.message
          : '変換に失敗しました。内容を確認して再度お試しください。',
      );
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const url = URL.createObjectURL(result.blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = result.fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const canConvert = !busy && content.trim().length > 0 && (tab === 'text' || file !== null);

  return (
    <section
      id="convert"
      aria-labelledby="convert-heading"
      className="scroll-mt-20 border-t border-sumi-200 bg-sumi-50"
    >
      <div className="mx-auto w-full max-w-content px-5 py-14 sm:px-8 md:py-20">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="spec-label mb-3">変換ツール</p>
            <h2
              id="convert-heading"
              className="text-2xl font-bold tracking-japanese text-ink md:text-3xl"
            >
              QRを変換する
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-sumi-600">
              登録不要・無料で試せます。まずは手元のQR画像を1枚入れてみてください。
            </p>
          </div>
          {api.kind === 'local' && (
            <p className="max-w-sm self-start text-2xs leading-5 text-sumi-500">
              読み取りと変換はすべてブラウザ内で行います。画像がサーバーへ送られることはありません。
            </p>
          )}
        </div>

        <div className="border border-sumi-300 bg-paper shadow-panel">
          {/* タブ */}
          <div role="tablist" aria-label="変換方法" className="flex border-b border-sumi-200">
            {TABS.map((item) => {
              const selected = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  id={`tab-${item.id}`}
                  aria-selected={selected}
                  aria-controls={`panel-${item.id}`}
                  onClick={() => {
                    setTab(item.id);
                    setError(null);
                    invalidate();
                  }}
                  className={[
                    'flex-1 border-b-2 px-3 py-3.5 text-center text-sm font-medium transition-colors sm:flex-none sm:px-6',
                    selected
                      ? 'border-ink text-ink'
                      : 'border-transparent text-sumi-500 hover:text-ink',
                  ].join(' ')}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="p-4 sm:p-6">
            {/* 入力 */}
            <div
              role="tabpanel"
              id="panel-image"
              aria-labelledby="tab-image"
              hidden={tab !== 'image'}
            >
              <UploadDropzone
                file={file}
                onSelect={handleSelectFile}
                onClear={handleClearFile}
                onReject={(message) => setError(message)}
                disabled={busy}
              />

              {status === 'analyzing' && (
                <p className="mt-4 flex items-center gap-2 text-sm text-sumi-600" role="status">
                  <Loader2 size={16} aria-hidden="true" className="animate-spin" />
                  画像を解析しています…
                </p>
              )}

              {analysis && (
                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  <div>
                    <p className="spec-label mb-2">プレビュー</p>
                    <div className="flex aspect-square items-center justify-center border border-sumi-200 bg-sumi-50 p-3">
                      {previewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- ローカルの一時URLのため
                        <img
                          src={previewUrl}
                          alt="アップロードしたQR画像のプレビュー"
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <p className="flex flex-col items-center gap-2 text-center text-2xs text-sumi-500">
                          <FileText size={24} aria-hidden="true" className="text-sumi-400" />
                          PDFはプレビューを表示しません
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="spec-label mb-2">解析結果</p>
                    <dl className="space-y-2 border border-sumi-200 p-3 font-mono text-2xs">
                      <div className="flex justify-between gap-3">
                        <dt className="text-sumi-500">元画像サイズ</dt>
                        <dd className="text-ink">
                          {analysis.imageWidth > 0
                            ? `${analysis.imageWidth} × ${analysis.imageHeight} px`
                            : '—'}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-sumi-500">セル数</dt>
                        <dd className="text-ink">
                          {analysis.cells} × {analysis.cells}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-sumi-500">型番 / 誤り訂正</dt>
                        <dd className="text-ink">
                          ver.{analysis.version} / {analysis.ecc ?? '—'}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-sumi-500">セルあたり画素数</dt>
                        <dd className="text-ink">
                          {analysis.pxPerModule ? `${analysis.pxPerModule.toFixed(1)} px` : '—'}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-sumi-500">ドット配置</dt>
                        <dd className="text-ink">
                          {analysis.preservation === 'exact'
                            ? '元配置を確定'
                            : analysis.preservation === 'approximate'
                              ? '近似で取得'
                              : '再生成'}
                        </dd>
                      </div>
                    </dl>

                    <label
                      htmlFor="read-content"
                      className="spec-label mb-2 mt-4 block"
                    >
                      QR読取内容
                    </label>
                    <input
                      id="read-content"
                      type="text"
                      value={imageContent}
                      onChange={(event) => {
                        setImageContent(event.target.value);
                        invalidate();
                      }}
                      disabled={busy}
                      className="h-10 w-full rounded-sm border border-sumi-300 bg-paper px-3 font-mono text-xs text-ink disabled:opacity-50"
                    />
                    {analysis.notes.map((note) => (
                      <p key={note} className="mt-2 text-2xs leading-5 text-sumi-500">
                        {note}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div role="tabpanel" id="panel-text" aria-labelledby="tab-text" hidden={tab !== 'text'}>
              <label htmlFor="text-content" className="spec-label mb-2 block">
                URL・テキスト
              </label>
              <textarea
                id="text-content"
                value={textContent}
                onChange={(event) => {
                  setTextContent(event.target.value);
                  invalidate();
                }}
                rows={3}
                maxLength={500}
                disabled={busy}
                placeholder="https://example.com/campaign"
                aria-describedby="text-content-help"
                className="w-full resize-y rounded-sm border border-sumi-300 bg-paper p-3 font-mono text-sm leading-6 text-ink placeholder:text-sumi-400 disabled:opacity-50"
              />
              <p
                id="text-content-help"
                className="mt-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-2xs text-sumi-500"
              >
                <span>URLでもテキストでも構いません。日本語も使えます。</span>
                <span className="shrink-0 font-mono">{textContent.length} / 500</span>
              </p>
            </div>

            {/* 設定 */}
            <div className="mt-8 border-t border-sumi-200 pt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                  <FormatSelect
                    value={format}
                    onChange={(value) => {
                      setFormat(value);
                      invalidate();
                    }}
                    disabled={busy}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <SizeSelect
                      value={sizeMm}
                      onChange={(value) => {
                        setSizeMm(value);
                        invalidate();
                      }}
                      disabled={busy}
                    />
                    <EccSelect
                      value={ecc}
                      onChange={(value) => {
                        setEcc(value);
                        invalidate();
                      }}
                      disabled={busy}
                    />
                  </div>
                </div>

                <div>
                  <p className="spec-label mb-1">変換設定</p>
                  <ToggleRow
                    label="K100変換"
                    note="PDFの黒をCMYK 0 / 0 / 0 / 100で書き出します。SVGはRGBのみの規格のため #000000 で出力します。"
                    checked={k100}
                    onChange={(value) => {
                      setK100(value);
                      invalidate();
                    }}
                    disabled={busy}
                  />
                  <ToggleRow
                    label="ドット配置維持"
                    note="読み取れたセルの並びをそのまま正方形で書き出します。補間はかけません。"
                    checked={preserveDots}
                    onChange={(value) => {
                      setPreserveDots(value);
                      invalidate();
                    }}
                    disabled={busy}
                  />
                  <ToggleRow
                    label="内容一致チェック"
                    note="出力する配置を描き直して再読み取りし、内容が一致するか照合します。"
                    checked={verifyContent}
                    onChange={(value) => {
                      setVerifyContent(value);
                      invalidate();
                    }}
                    disabled={busy}
                  />
                </div>
              </div>

              {error && (
                <p
                  role="alert"
                  className="mt-6 flex items-start gap-2 border border-shu bg-shu/5 px-3 py-2.5 text-sm leading-6 text-shu"
                >
                  <TriangleAlert size={16} aria-hidden="true" className="mt-1 shrink-0" />
                  {error}
                </p>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={handleConvert}
                  disabled={!canConvert}
                  aria-label="設定した内容でQRコードを変換する"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-sm border border-ink bg-ink px-6 text-[0.9375rem] font-medium text-paper transition-colors hover:bg-sumi-700 disabled:cursor-not-allowed disabled:border-sumi-300 disabled:bg-sumi-300 disabled:text-sumi-500"
                >
                  {status === 'converting' ? (
                    <>
                      <Loader2 size={16} aria-hidden="true" className="animate-spin" />
                      変換中…
                    </>
                  ) : (
                    <>
                      <Wand2 size={16} aria-hidden="true" />
                      変換する
                    </>
                  )}
                </button>

                {!canConvert && status !== 'converting' && (
                  <p className="text-2xs leading-5 text-sumi-500">
                    {tab === 'image'
                      ? 'QR画像をアップロードすると変換できます。'
                      : 'URLまたはテキストを入力すると変換できます。'}
                  </p>
                )}
              </div>

              {status === 'converting' && (
                <div className="mt-4" role="status" aria-live="polite">
                  <div className="h-0.5 w-full overflow-hidden bg-sumi-200">
                    <div className="h-full w-1/3 animate-bar-move bg-ink" />
                  </div>
                  <p className="mt-2 font-mono text-2xs text-sumi-500">
                    セル配置を再構成 → K100へ変換 → 内容を照合
                  </p>
                </div>
              )}
            </div>

            {/* 結果 */}
            <div
              ref={resultRef}
              tabIndex={-1}
              className="mt-6 focus:outline-none"
            >
              {result && status === 'done' && (
                <ResultPanel result={result} format={format} onDownload={handleDownload} />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
