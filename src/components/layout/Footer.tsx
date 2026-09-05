import { FOOTER_LINKS, SITE } from '@/lib/content/site';

export function Footer() {
  return (
    <footer className="border-t border-sumi-200 bg-sumi-50">
      <div className="mx-auto w-full max-w-content px-5 py-12 sm:px-8 md:py-16">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-lg font-bold leading-relaxed tracking-japanese text-ink md:text-xl">
              {SITE.tagline}
            </p>
            <p className="mt-3 flex items-center gap-2 text-sm font-medium text-ink">
              <span aria-hidden="true" className="grid grid-cols-2 gap-[2px]">
                <span className="block h-[5px] w-[5px] bg-k100" />
                <span className="block h-[5px] w-[5px] bg-k100" />
                <span className="block h-[5px] w-[5px] bg-k100" />
                <span className="block h-[5px] w-[5px] bg-sumi-300" />
              </span>
              {SITE.name}
            </p>
          </div>

          <nav aria-label="フッターナビゲーション">
            <ul className="flex flex-wrap gap-x-6 gap-y-3">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-sumi-600 underline-offset-4 transition-colors hover:text-ink hover:underline"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="mt-10 border-t border-sumi-200 pt-6 font-mono text-2xs text-sumi-500">
          © {new Date().getFullYear()} {SITE.name}
        </p>
      </div>
    </footer>
  );
}
