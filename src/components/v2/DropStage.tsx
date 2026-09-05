'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from 'react';

import {
  ConvertInputError,
  getConverterApi,
  type AnalyzeResult,
  type ConvertResult,
  type SourceLayout,
} from '@/lib/convert';
import { encodeQr, QrCapacityError, type EccLevel, type QrMatrix } from '@/lib/qr/encoder';

import { ContentLine } from './ContentLine';
import { ResultActions } from './ResultActions';
import { makeSampleFile } from './sampleFile';
import { Stage, type StagePhase } from './Stage';

type Source = 'image' | 'text' | null;

/** 変換設定はここで固定する。ユーザーには選ばせない */
const FIXED_OPTIONS = {
  format: 'pdf' as const,
  k100: true,
  preserveDots: true,
  verifyContent: true,
  sizeMm: 20,
  quietZone: 4,
};

/** 型番16以上など、自前エンコーダで再生成できない QR のための文言 */
const TOO_LARGE_MESSAGE =
  'このQRは大きすぎて（型番16以上）、このツールでは扱えません。もう少し短い内容のQRでお試しください。';

/**
 * v2 のファーストビュー。
 *
 * 置く（ドロップ / ⌘V / クリック）→ 粗い QR が鮮明になる → 受け取る。
 * 「QR の中身」の 1 行は、読み取り結果の表示でもあり、URL・テキストの入力欄でもある。
 */
export function DropStage() {
  const api = useMemo(() => getConverterApi(), []);

  const [phase, setPhase] = useState<StagePhase>('idle');
  const [source, setSource] = useState<Source>(null);
  const [analysis, setAnalysis] = useState<AnalyzeResult | null>(null);
  const [content, setContent] = useState('');
  const [modules, setModules] = useState<boolean[][] | null>(null);
  const [dotsPreserved, setDotsPreserved] = useState(false);
  const [result, setResult] = useState<ConvertResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [downloading, setDownloading] = useState(false);
  /** 端末が確定するまでは null。SSR と初回描画を一致させるため */
  const [coarsePointer, setCoarsePointer] = useState<boolean | null>(null);
  const [isMac, setIsMac] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLInputElement>(null);
  const convertSeq = useRef(0);
  const analyzeSeq = useRef(0);
  const phaseRef = useRef<StagePhase>('idle');
  phaseRef.current = phase;

  useEffect(() => {
    const query = window.matchMedia('(pointer: coarse)');
    const apply = () => setCoarsePointer(query.matches);
    apply();
    query.addEventListener('change', apply);
    setIsMac(/Mac|iPhone|iPad|iPod/.test(`${navigator.platform} ${navigator.userAgent}`));
    return () => query.removeEventListener('change', apply);
  }, []);

  /* ---------------------------------------------------------------- */
  /* 変換（結果が出た時点で先に PDF を作り、「受け取る」を即応させる）          */
  /* ---------------------------------------------------------------- */

  const runConvert = useCallback(
    async (text: string, layout: SourceLayout | null, ecc: EccLevel | null) => {
      const seq = (convertSeq.current += 1);
      try {
        const converted = await api.convert({
          ...FIXED_OPTIONS,
          content: text,
          ecc: ecc ?? 'M',
          source: layout,
        });
        if (seq !== convertSeq.current) return;
        setResult(converted);
        setDotsPreserved(converted.dotsPreserved);
      } catch (caught) {
        if (seq !== convertSeq.current) return;
        setResult(null);
        setError(caught instanceof ConvertInputError ? caught.message : '変換に失敗しました。');
      }
    },
    [api],
  );

  /* ---------------------------------------------------------------- */
  /* 画像を置いたとき                                                    */
  /* ---------------------------------------------------------------- */

  const handleFile = useCallback(
    async (file: File) => {
      const seq = (analyzeSeq.current += 1);
      convertSeq.current += 1; // 進行中の変換を無効にする
      setError(null);
      setResult(null);
      setAnalysis(null);
      setSource('image');
      setPhase('reading');
      try {
        const analyzed = await api.analyzeImage(file);
        if (seq !== analyzeSeq.current) return;

        // 元配置が取れなかった場合はここで再生成する（型番16以上だと収まらないことがある）
        let shown = analyzed.sourceModules;
        if (!shown) {
          let regenerated: QrMatrix;
          try {
            regenerated = encodeQr(analyzed.content, analyzed.ecc ?? 'M');
          } catch (caught) {
            setSource(null);
            setAnalysis(null);
            setModules(null);
            setPhase('error');
            setError(caught instanceof QrCapacityError ? TOO_LARGE_MESSAGE : '変換に失敗しました。');
            return;
          }
          shown = regenerated.modules;
        }

        setAnalysis(analyzed);
        setContent(analyzed.content);
        setModules(shown);
        setDotsPreserved(analyzed.preservation !== 'none');
        setPhase('developing');
        void runConvert(
          analyzed.content,
          analyzed.sourceModules ? { modules: analyzed.sourceModules, ecc: analyzed.ecc } : null,
          analyzed.ecc,
        );
      } catch (caught) {
        if (seq !== analyzeSeq.current) return;
        // 失敗したら「画像から」の状態を解除する。
        // 解除しないと、内容の行に URL を入れても生成が走らなくなる。
        setSource(null);
        setAnalysis(null);
        setModules(null);
        setPhase('error');
        setError(
          caught instanceof ConvertInputError
            ? caught.message
            : '画像を読み込めませんでした。別の画像でお試しください。',
        );
      }
    },
    [api, runConvert],
  );

  /* ---------------------------------------------------------------- */
  /* 中身の行を書き換えたとき（URL・テキストからの生成）                        */
  /* ---------------------------------------------------------------- */

  /**
   * 入力の時点で source を確定させます。
   * 生成用の effect の中で source を変えると、effect が自分の依存を書き換えて
   * 二重に走ってしまうためです。
   */
  const applyText = useCallback((value: string) => {
    analyzeSeq.current += 1; // 解析中だった結果は捨てる
    setContent(value);
    setSource(value.trim().length > 0 ? 'text' : null);
  }, []);

  useEffect(() => {
    if (source === 'image') return undefined; // 画像から読み取った内容はそのまま

    const text = content.trim();
    if (text.length === 0) {
      convertSeq.current += 1;
      setModules(null);
      setResult(null);
      setAnalysis(null);
      // 読み取り失敗の表示は消さない（内容が空なのは失敗直後の正常な状態）
      if (phaseRef.current !== 'error') {
        setError(null);
        setPhase('idle');
      }
      return undefined;
    }

    const timer = window.setTimeout(() => {
      try {
        const generated = encodeQr(text, 'M');
        setModules(generated.modules);
        setDotsPreserved(false);
        setError(null);
        setPhase((current) => (current === 'ready' ? 'ready' : 'developing'));
        void runConvert(text, null, 'M');
      } catch (caught) {
        setError(
          caught instanceof QrCapacityError
            ? '内容が長すぎて QR に収まりません。文字数を減らしてください。'
            : '生成できませんでした。',
        );
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [content, source, runConvert]);

  /* ---------------------------------------------------------------- */
  /* ペースト：画像なら読み取り、文字列なら中身の行へ                         */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const data = event.clipboardData;
      if (!data) return;

      const imageFile =
        Array.from(data.files).find((file) => file.type.startsWith('image/')) ??
        Array.from(data.items)
          .find((item) => item.kind === 'file' && item.type.startsWith('image/'))
          ?.getAsFile() ??
        null;
      if (imageFile) {
        event.preventDefault();
        if (phaseRef.current !== 'reading') void handleFile(imageFile);
        return;
      }

      const text = data.getData('text').trim();
      if (text && document.activeElement !== contentRef.current) {
        event.preventDefault();
        applyText(text);
        contentRef.current?.focus();
      }
    };
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, [handleFile, applyText]);

  /**
   * 演出の完了待ちは animationend で行いますが、
   * タブが非表示のときやアニメーションが抑制された環境ではイベントが来ないことがあります。
   * 「受け取る」が出ないまま止まらないよう、時間でも先に進めます。
   */
  useEffect(() => {
    if (phase !== 'developing') return undefined;
    const timer = window.setTimeout(() => {
      setPhase((current) => (current === 'developing' ? 'ready' : current));
    }, 1700);
    return () => window.clearTimeout(timer);
  }, [phase]);

  // ページ全体へのドロップでブラウザが画像を開いてしまうのを防ぐ
  useEffect(() => {
    const prevent = (event: Event) => event.preventDefault();
    window.addEventListener('dragover', prevent);
    window.addEventListener('drop', prevent);
    return () => {
      window.removeEventListener('dragover', prevent);
      window.removeEventListener('drop', prevent);
    };
  }, []);

  /* ---------------------------------------------------------------- */
  /* 操作                                                               */
  /* ---------------------------------------------------------------- */

  const openPicker = () => {
    if (phase === 'reading') return;
    fileInputRef.current?.click();
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (phase === 'reading') return;
    const file = Array.from(event.dataTransfer.files).find((f) => f.type.startsWith('image/'));
    if (file) {
      void handleFile(file);
    } else if (event.dataTransfer.files.length > 0) {
      setPhase('error');
      setError('画像ファイル（JPG・PNG・WebP）を置いてください。');
    }
  };

  const handleDownload = async () => {
    let ready = result;
    if (!ready) {
      setDownloading(true);
      try {
        ready = await api.convert({
          ...FIXED_OPTIONS,
          content: content.trim(),
          ecc: analysis?.ecc ?? 'M',
          source:
            source === 'image' && analysis?.sourceModules
              ? { modules: analysis.sourceModules, ecc: analysis.ecc }
              : null,
        });
        setResult(ready);
      } catch (caught) {
        setError(caught instanceof ConvertInputError ? caught.message : '変換に失敗しました。');
        return;
      } finally {
        setDownloading(false);
      }
    }
    const url = URL.createObjectURL(ready.blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = ready.fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleReset = () => {
    convertSeq.current += 1;
    analyzeSeq.current += 1;
    setPhase('idle');
    setSource(null);
    setAnalysis(null);
    setContent('');
    setModules(null);
    setDotsPreserved(false);
    setResult(null);
    setError(null);
  };

  const handleSample = async () => {
    try {
      const file = await makeSampleFile();
      await handleFile(file);
    } catch {
      setPhase('error');
      setError('サンプルを用意できませんでした。');
    }
  };

  // 端末が確定するまでは端末に依存しない文言を出す（静的HTMLとの食い違いを避ける）
  const hint =
    coarsePointer === null
      ? 'QR画像を置く'
      : coarsePointer
        ? 'タップして画像を選ぶ'
        : `${isMac ? '⌘V' : 'Ctrl+V'} または ドロップ`;

  const status =
    phase === 'reading'
      ? '読み取っています'
      : phase === 'ready'
        ? '変換できました。受け取るボタンでPDFを保存できます'
        : '';

  return (
    <section aria-labelledby="v2-heading" className="relative overflow-hidden bg-paper">
      <div
        aria-hidden="true"
        className="grid-paper grid-paper-fade pointer-events-none absolute inset-0 opacity-70"
      />

      <div className="relative mx-auto w-full max-w-2xl px-5 pb-16 pt-12 sm:px-8 md:pb-24 md:pt-16">
        <h1
          id="v2-heading"
          className="text-center text-[1.375rem] font-bold leading-snug tracking-japanese text-ink sm:text-2xl md:text-[1.75rem]"
        >
          QR画像を置くだけで、印刷用のK100ベクターに。
        </h1>

        <div className="mt-8 md:mt-10">
          <Stage
            phase={phase}
            hint={hint}
            beforeSrc={source === 'image' ? (analysis?.symbolPreview ?? null) : null}
            modules={modules}
            errorMessage={error}
            dragging={dragging}
            onActivate={openPicker}
            onDragOver={(event) => {
              event.preventDefault();
              if (phase !== 'reading') setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onAnimationEnd={() =>
              setPhase((current) => (current === 'developing' ? 'ready' : current))
            }
          />
          {phase === 'idle' && (
            <div className="mt-1 flex justify-end">
              <button
                type="button"
                onClick={handleSample}
                className="-mr-2 inline-flex min-h-11 items-center px-2 font-mono text-2xs text-sumi-500 underline-offset-4 hover:text-ink hover:underline"
              >
                試してみる →
              </button>
            </div>
          )}
        </div>

        <div className={phase === 'idle' ? 'mt-1' : 'mt-5'}>
          <ContentLine
            value={content}
            onChange={applyText}
            inputRef={contentRef}
            disabled={phase === 'reading'}
            invalid={Boolean(error) && phase !== 'error'}
          />
          {error && phase !== 'error' && (
            <p role="alert" className="mt-2 text-xs leading-5 text-shu">
              {error}
            </p>
          )}
        </div>

        <ResultActions
          visible={phase === 'ready'}
          dotsPreserved={dotsPreserved}
          fromImage={analysis !== null}
          preservation={analysis?.preservation ?? null}
          downloading={downloading}
          onDownload={handleDownload}
          onReset={handleReset}
          analysis={analysis}
          result={result}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          tabIndex={-1}
          aria-hidden="true"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleFile(file);
            event.target.value = '';
          }}
        />
        <p className="sr-only" aria-live="polite">
          {status}
        </p>
      </div>
    </section>
  );
}
