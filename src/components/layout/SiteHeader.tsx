import { HEADER_LINKS, internalHref, SITE } from '@/lib/content/site';

/**
 * 本サイトのヘッダー。ロゴと、2つの入口（ネット印刷おたすけ／QRコード変換）だけ。
 * 旧デザイン（/v1/）は従来の Header をそのまま使います。
 */
export function SiteHeader() {
  return (
    <header className="border-b border-sumi-200 bg-paper">
      <div className="mx-auto flex h-14 w-full max-w-content items-center justify-between gap-3 px-5 sm:px-8 md:h-16">
        <a
          href={internalHref('/')}
          className="flex shrink-0 items-baseline gap-2 text-[0.9375rem] font-bold tracking-japanese text-ink"
        >
          <span aria-hidden="true" className="grid grid-cols-2 gap-[2px]">
            <span className="block h-[5px] w-[5px] bg-k100" />
            <span className="block h-[5px] w-[5px] bg-k100" />
            <span className="block h-[5px] w-[5px] bg-k100" />
            <span className="block h-[5px] w-[5px] bg-sumi-300" />
          </span>
          {SITE.name}
        </a>
        <nav aria-label="サービス">
          <ul className="flex items-center gap-x-3 sm:gap-x-6">
            {HEADER_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="inline-flex min-h-11 items-center whitespace-nowrap text-xs text-sumi-600 underline-offset-4 transition-colors hover:text-ink hover:underline sm:text-sm"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
