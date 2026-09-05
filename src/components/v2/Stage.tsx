'use client';

import type { DragEvent } from 'react';

import { QrModules } from '@/components/ui/QrArtwork';

export type StagePhase = 'idle' | 'reading' | 'developing' | 'ready' | 'error';

interface StageProps {
  phase: StagePhase;
  /** 待機時の案内（例：⌘V または ドロップ） */
  hint: string;
  /** 変換前：元画像から切り出したシンボル部分（data URL）。テキスト入力時は null */
  beforeSrc: string | null;
  /** 変換後：表示するモジュール配置 */
  modules: boolean[][] | null;
  errorMessage: string | null;
  dragging: boolean;
  onActivate: () => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
  onAnimationEnd: () => void;
}

/**
 * 置く場所であり、結果が現れる場所。
 * 文字で状態を説明せず、粗い画像が左から右へ鮮明になる動きで伝えます。
 *
 * 外枠は role を持たないただの領域にして、操作は中の本物の button に任せています。
 * 外枠を role="button" にすると、中の画像やエラー文がボタンの名前に吸収されて
 * 支援技術から読めなくなるためです。
 */
export function Stage({
  phase,
  hint,
  beforeSrc,
  modules,
  errorMessage,
  dragging,
  onActivate,
  onDragOver,
  onDragLeave,
  onDrop,
  onAnimationEnd,
}: StageProps) {
  const showResult = (phase === 'developing' || phase === 'ready') && modules !== null;
  const afterAnimation =
    phase === 'developing' ? (beforeSrc ? 'animate-wipe-in' : 'animate-fade-in') : '';

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={[
        'relative flex min-h-[300px] items-center justify-center rounded-sm border transition-colors sm:min-h-[360px]',
        dragging
          ? 'border-shu bg-kinari/30'
          : phase === 'idle'
            ? 'border-dashed border-sumi-300 bg-sumi-50/70'
            : 'border-sumi-200 bg-paper',
      ].join(' ')}
    >
      {phase === 'idle' && (
        <button
          type="button"
          onClick={onActivate}
          className="absolute inset-0 flex items-center justify-center rounded-sm px-6 text-center text-lg font-medium tracking-japanese text-ink transition-colors hover:bg-sumi-100/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-shu sm:text-xl"
        >
          {hint}
        </button>
      )}

      {phase === 'reading' && (
        <div aria-hidden="true" className="grid grid-cols-2 gap-1.5">
          <span className="block h-4 w-4 animate-pulse bg-k100" />
          <span className="block h-4 w-4 animate-pulse bg-k100 [animation-delay:120ms]" />
          <span className="block h-4 w-4 animate-pulse bg-k100 [animation-delay:240ms]" />
          <span className="block h-4 w-4 animate-pulse bg-sumi-300 [animation-delay:360ms]" />
        </div>
      )}

      {showResult && modules && (
        <div className="relative aspect-square w-[min(64vw,272px)]">
          {beforeSrc && (
            // eslint-disable-next-line @next/next/no-img-element -- 解析時に生成した data URL
            <img
              src={beforeSrc}
              alt="変換前：元画像から切り出したQRコード"
              className="absolute inset-0 h-full w-full"
              draggable={false}
            />
          )}
          <div className={`absolute inset-0 ${afterAnimation}`} onAnimationEnd={onAnimationEnd}>
            <QrModules
              modules={modules}
              quietZone={2}
              className="h-full w-full"
              title="変換後：K100ベクターのQRコード"
            />
          </div>
          {phase === 'developing' && beforeSrc && (
            <div
              aria-hidden="true"
              className="animate-scan-line absolute top-0 h-full w-px bg-shu"
            />
          )}
        </div>
      )}

      {phase === 'error' && (
        <div className="px-6 text-center">
          <p role="alert" className="text-sm leading-6 text-shu">
            {errorMessage}
          </p>
          <button
            type="button"
            onClick={onActivate}
            className="mt-4 inline-flex min-h-11 items-center rounded-sm border border-sumi-300 bg-paper px-4 text-sm text-ink transition-colors hover:border-ink"
          >
            別の画像を選ぶ
          </button>
        </div>
      )}
    </div>
  );
}
