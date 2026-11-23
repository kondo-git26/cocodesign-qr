import { ArrowRight } from 'lucide-react';

import { internalHref, PRINT_HELP } from '@/lib/content/site';

/**
 * トップの一番上に置く、一般の方向けの入口（1行）。
 * トップはデザイナー向けの文体なので、ここだけ別の入口として /print/ へつなぐ。
 */
export function PrintHelpBand() {
  return (
    <div className="border-b border-sumi-200 bg-sumi-50">
      <a
        href={internalHref('/print/')}
        className="group mx-auto flex w-full max-w-content items-center justify-center gap-x-3 gap-y-1 px-5 py-3 text-center text-sm text-ink sm:px-8"
      >
        <span className="flex flex-wrap items-baseline justify-center gap-x-2">
          <span>チラシや名刺をネット印刷に出す方へ。</span>
          <span className="font-bold underline underline-offset-4 group-hover:no-underline">
            {PRINT_HELP.name}
          </span>
          <span className="text-xs text-sumi-600">塗り足し 1面{PRINT_HELP.bleedPrice}から</span>
        </span>
        <ArrowRight size={16} aria-hidden="true" className="shrink-0" />
      </a>
    </div>
  );
}
