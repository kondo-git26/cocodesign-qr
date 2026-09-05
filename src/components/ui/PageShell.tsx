import type { ReactNode } from 'react';

import { internalHref } from '@/lib/content/site';

/** 規約・ポリシーなど、本文中心のページの共通レイアウト */
export function PageShell({
  title,
  lead,
  updatedAt,
  children,
}: {
  title: string;
  lead?: string;
  updatedAt?: string;
  children: ReactNode;
}) {
  return (
    <article className="border-t border-sumi-200 bg-paper">
      <div className="mx-auto w-full max-w-3xl px-5 py-14 sm:px-8 md:py-20">
        <nav aria-label="パンくず" className="mb-6">
          <a
            href={internalHref('/')}
            className="font-mono text-2xs text-sumi-500 underline-offset-4 hover:text-ink hover:underline"
          >
            ← トップへ戻る
          </a>
        </nav>

        <h1 className="text-2xl font-bold tracking-japanese text-ink md:text-3xl">{title}</h1>
        {lead && <p className="mt-4 text-sm leading-7 text-sumi-600">{lead}</p>}
        {updatedAt && <p className="mt-3 font-mono text-2xs text-sumi-500">最終更新：{updatedAt}</p>}

        <div className="mt-10 space-y-8">{children}</div>
      </div>
    </article>
  );
}

/** 見出し + 本文のかたまり */
export function Clause({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section className="border-t border-sumi-200 pt-6">
      <h2 className="text-base font-bold tracking-japanese text-ink">{heading}</h2>
      <div className="mt-3 space-y-3 text-sm leading-7 text-sumi-600">{children}</div>
    </section>
  );
}
