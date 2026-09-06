import { internalHref, SITE } from '@/lib/content/site';

/**
 * 本サイトのヘッダー。ロゴと「無料」だけ。
 * ナビゲーションは置かない（ファーストビューで説明を読ませない方針に合わせる）。
 * 旧デザイン（/v1/）は従来の Header をそのまま使います。
 */
export function SiteHeader() {
  return (
    <header className="border-b border-sumi-200 bg-paper">
      <div className="mx-auto flex h-14 w-full max-w-content items-center justify-between px-5 sm:px-8 md:h-16">
        <a
          href={internalHref('/')}
          className="flex items-baseline gap-2 text-[0.9375rem] font-bold tracking-japanese text-ink"
        >
          <span aria-hidden="true" className="grid grid-cols-2 gap-[2px]">
            <span className="block h-[5px] w-[5px] bg-k100" />
            <span className="block h-[5px] w-[5px] bg-k100" />
            <span className="block h-[5px] w-[5px] bg-k100" />
            <span className="block h-[5px] w-[5px] bg-sumi-300" />
          </span>
          {SITE.name}
        </a>
        <span className="border border-sumi-300 px-2 py-0.5 font-mono text-2xs text-sumi-600">
          無料
        </span>
      </div>
    </header>
  );
}
