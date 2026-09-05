'use client';

import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { internalHref, NAV_LINKS, SITE } from '@/lib/content/site';

export function Header() {
  const [open, setOpen] = useState(false);

  // メニューを開いている間は背面のスクロールを止める
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Esc で閉じる
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-sumi-200 bg-paper/95 backdrop-blur-[2px]">
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

        <nav aria-label="メインナビゲーション" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="inline-flex h-9 items-center px-3 text-sm text-sumi-600 transition-colors hover:text-ink"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="ml-2">
              <a
                href="#convert"
                className="inline-flex h-9 items-center rounded-sm border border-ink bg-ink px-4 text-sm font-medium text-paper transition-colors hover:bg-sumi-700"
              >
                無料で試す
              </a>
            </li>
          </ul>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'メニューを閉じる' : 'メニューを開く'}
          className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-sumi-300 text-ink md:hidden"
        >
          {open ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
        </button>
      </div>

      <div
        id="mobile-nav"
        hidden={!open}
        className="border-t border-sumi-200 bg-paper md:hidden"
      >
        <nav aria-label="メインナビゲーション（モバイル）">
          <ul className="mx-auto w-full max-w-content px-5 py-2 sm:px-8">
            {NAV_LINKS.map((link) => (
              <li key={link.href} className="border-b border-sumi-200 last:border-b-0">
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex h-12 items-center text-sm text-ink"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="py-3">
              <a
                href="#convert"
                onClick={() => setOpen(false)}
                className="flex h-12 items-center justify-center rounded-sm border border-ink bg-ink text-sm font-medium text-paper"
              >
                無料で試す
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
