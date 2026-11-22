'use client';

import { Download, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type DragEvent } from 'react';

import { Button } from '@/components/ui/Button';
import {
  BLEED_MM,
  BleedInputError,
  PAPER_SIZES,
  loadImage,
  makeBleed,
  orientPaper,
  toPdfBlob,
  toPngBlob,
  type BleedMode,
  type BleedResult,
} from '@/lib/bleed/bleed';

const MAX_UPLOAD_BYTES = 30 * 1024 * 1024;

const MODES: { id: BleedMode; label: string; note: string }[] = [
  { id: 'extend', label: 'ふちを伸ばす', note: 'べた塗りや、ふちが単色の絵に向いています' },
  { id: 'mirror', label: '鏡面で折り返す', note: 'ふちの内側を鏡のように写して足します。写真や模様の絵に向いています' },
];

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * 無料の塗り足しツール（試作）。
 * 画像を置く → 仕上がりサイズを選ぶ → 3mm 足した画像を確認 → PDF / PNG で受け取る。
 * 画像はブラウザの外に出ません。
 */
export function BleedTool() {
  const [file, setFile] = useState<File | null>(null);
  const [image, setImage] = useState<ImageBitmap | null>(null);
  const [paperId, setPaperId] = useState('a5');
  const [custom, setCustom] = useState({ w: '100', h: '100' });
  const [mode, setMode] = useState<BleedMode>('extend');
  const [result, setResult] = useState<BleedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState<'pdf' | 'png' | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);

  /** 仕上がりサイズ（画像の向きに合わせる） */
  const sizeMm = (() => {
    if (!image) return null;
    if (paperId === 'custom') {
      const w = Number(custom.w);
      const h = Number(custom.h);
      return w > 0 && h > 0 ? { widthMm: w, heightMm: h } : null;
    }
    const paper = PAPER_SIZES.find((p) => p.id === paperId);
    return paper ? orientPaper(paper, image.width, image.height) : null;
  })();

  const accept = useCallback(async (f: File) => {
    setError(null);
    if (f.size > MAX_UPLOAD_BYTES) {
      setError('ファイルが大きすぎます（30MBまで）。');
      return;
    }
    if (!/^image\/(png|jpeg|webp)$/.test(f.type)) {
      setError('PNG か JPEG の画像を置いてください。PDF は今は扱えません。');
      return;
    }
    try {
      const bitmap = await loadImage(f);
      setFile(f);
      setImage(bitmap);
    } catch (e) {
      setError(e instanceof BleedInputError ? e.message : '画像を読めませんでした。');
    }
  }, []);

  // 画像・サイズ・方式が変わるたびに作り直す
  useEffect(() => {
    if (!image || !sizeMm) {
      setResult(null);
      return;
    }
    try {
      setResult(makeBleed(image, { ...sizeMm, bleedMm: BLEED_MM, mode }));
      setError(null);
    } catch (e) {
      setResult(null);
      setError(e instanceof BleedInputError ? e.message : '塗り足しを付けられませんでした。');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image, mode, paperId, custom.w, custom.h]);

  // 画面の確認用に縮小して描き、仕上がり線を重ねる
  useEffect(() => {
    const target = previewRef.current;
    if (!target || !result) return;
    const maxSide = 560;
    const scale = Math.min(1, maxSide / Math.max(result.canvas.width, result.canvas.height));
    const w = Math.round(result.canvas.width * scale);
    const h = Math.round(result.canvas.height * scale);
    target.width = w;
    target.height = h;
    const ctx = target.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(result.canvas, 0, 0, w, h);
    // 塗り足し部分を少し暗くして、仕上がりの範囲が分かるようにする
    const b = result.bleedPx * scale;
    ctx.fillStyle = 'rgba(17,17,17,0.35)';
    ctx.fillRect(0, 0, w, b);
    ctx.fillRect(0, h - b, w, b);
    ctx.fillRect(0, b, b, h - b * 2);
    ctx.fillRect(w - b, b, b, h - b * 2);
    ctx.strokeStyle = '#B4482F';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 4]);
    ctx.strokeRect(b + 0.5, b + 0.5, w - b * 2 - 1, h - b * 2 - 1);
  }, [result]);

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    const f = event.dataTransfer.files?.[0];
    if (f) void accept(f);
  };

  const baseName = file ? file.name.replace(/\.[^.]+$/, '') : 'nurikomi';

  const save = async (kind: 'pdf' | 'png') => {
    if (!result) return;
    setBusy(kind);
    try {
      if (kind === 'pdf') {
        download(await toPdfBlob(result), `${baseName}_塗り足し3mm.pdf`);
      } else {
        download(await toPngBlob(result.canvas), `${baseName}_塗り足し3mm.png`);
      }
    } catch (e) {
      setError(e instanceof BleedInputError ? e.message : '書き出しに失敗しました。');
    } finally {
      setBusy(null);
    }
  };

  const lowRes = result && result.sourceDpi < 150;
  const midRes = result && !lowRes && result.sourceDpi < 280;

  return (
    <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-6">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`flex min-h-[9rem] flex-col items-center justify-center gap-3 rounded-sm border border-dashed px-5 py-8 text-center ${
            dragging ? 'border-shu bg-kinari/40' : 'border-sumi-300 bg-sumi-50'
          }`}
        >
          <p className="text-sm text-sumi-600">
            {file ? `${file.name}（${image?.width}×${image?.height}px）` : '仕上がりサイズでつくった画像をここへ置いてください'}
          </p>
          <Button variant="secondary" onClick={() => inputRef.current?.click()}>
            {file ? '別の画像にする' : '画像を選ぶ'}
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void accept(f);
              e.target.value = '';
            }}
          />
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-bold text-ink">1. 仕上がりサイズ</legend>
          <p className="text-xs leading-6 text-sumi-600">
            塗り足しを足す前の、切ったあとの大きさです。画像の向きに合わせて縦横を入れ替えます。
          </p>
          <select
            value={paperId}
            onChange={(e) => setPaperId(e.target.value)}
            className="h-10 w-full rounded-sm border border-sumi-300 bg-paper px-3 text-sm"
          >
            {PAPER_SIZES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
            <option value="custom">自分で入れる（mm）</option>
          </select>
          {paperId === 'custom' && (
            <div className="flex items-center gap-2 text-sm">
              <input
                inputMode="decimal"
                value={custom.w}
                onChange={(e) => setCustom({ ...custom, w: e.target.value })}
                className="h-10 w-24 rounded-sm border border-sumi-300 px-3"
                aria-label="幅（mm）"
              />
              <span>×</span>
              <input
                inputMode="decimal"
                value={custom.h}
                onChange={(e) => setCustom({ ...custom, h: e.target.value })}
                className="h-10 w-24 rounded-sm border border-sumi-300 px-3"
                aria-label="高さ（mm）"
              />
              <span className="text-sumi-600">mm</span>
            </div>
          )}
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="text-sm font-bold text-ink">2. 足し方</legend>
          <div className="space-y-2">
            {MODES.map((m) => (
              <label
                key={m.id}
                className={`flex cursor-pointer items-start gap-3 rounded-sm border px-3 py-3 ${
                  mode === m.id ? 'border-ink bg-sumi-50' : 'border-sumi-300'
                }`}
              >
                <input
                  type="radio"
                  name="mode"
                  checked={mode === m.id}
                  onChange={() => setMode(m.id)}
                  className="mt-1"
                />
                <span>
                  <span className="block text-sm font-medium text-ink">{m.label}</span>
                  <span className="block text-xs leading-6 text-sumi-600">{m.note}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="space-y-4">
        <p className="text-sm font-bold text-ink">3. 確認して受け取る</p>
        {!result ? (
          <p className="rounded-sm bg-sumi-50 px-4 py-10 text-center text-sm text-sumi-500">
            画像を置くと、ここに塗り足しを付けた絵が出ます。
          </p>
        ) : (
          <>
            <div className="rounded-sm bg-sumi-100 p-3">
              <canvas ref={previewRef} className="mx-auto block h-auto max-w-full" />
            </div>
            <p className="text-xs leading-6 text-sumi-600">
              暗い帯が足した {BLEED_MM}mm、朱色の点線が仕上がり線（ここで切られます）。
              サイズは {result.options.widthMm}×{result.options.heightMm}mm に {BLEED_MM}mm ずつ足して{' '}
              {result.options.widthMm + BLEED_MM * 2}×{result.options.heightMm + BLEED_MM * 2}mm です。
            </p>
            {result.cropped && (
              <p className="rounded-sm border border-shu px-3 py-2 text-xs leading-6 text-shu">
                画像の縦横の比率が選んだサイズと違うため、はみ出した分を中央を残して切っています。サイズを選び直すか、元の画像を作り直してください。
              </p>
            )}
            {lowRes && (
              <p className="rounded-sm border border-shu px-3 py-2 text-xs leading-6 text-shu">
                画像の細かさが足りません（このサイズだと約{Math.round(result.sourceDpi)}dpi）。印刷すると粗くなります。大きい画像で作り直すことをおすすめします。
              </p>
            )}
            {midRes && (
              <p className="rounded-sm bg-kinari/50 px-3 py-2 text-xs leading-6 text-sumi-700">
                画像の細かさは約{Math.round(result.sourceDpi)}dpiです。多くの印刷会社は350dpi前後を勧めています。
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              <Button size="lg" onClick={() => save('pdf')} disabled={busy !== null}>
                {busy === 'pdf' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                PDFで受け取る
              </Button>
              <Button size="lg" variant="secondary" onClick={() => save('png')} disabled={busy !== null}>
                {busy === 'png' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                PNGで受け取る
              </Button>
            </div>
            <p className="text-xs leading-6 text-sumi-500">
              PDFには仕上がり線の情報が入っています。色はRGBのままです（CMYKへは変換しません）。
            </p>
          </>
        )}
        {error && (
          <p role="alert" className="text-sm text-shu">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
