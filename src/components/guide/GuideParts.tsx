import type { ReactNode } from 'react';

import { ButtonLink } from '@/components/ui/Button';
import { ConsultBox } from '@/components/ui/ConsultBox';
import { internalHref, PRINT_HELP } from '@/lib/content/site';

/**
 * 説明ページ（検索から来る人向け）の共通の部品。
 * 流れ：困りごとに答える → 無料ツール → ツールで足りなければ有料のおたすけ。
 * （2026-11-24 近藤さん「ニーズを中心にしたサイト構成」「WEB集客が必要」）
 */

export function GuideShell({
  label,
  title,
  lead,
  updatedAt,
  children,
}: {
  label: string;
  title: ReactNode;
  lead: ReactNode;
  updatedAt: string;
  children: ReactNode;
}) {
  return (
    <article className="border-t border-sumi-200 bg-paper">
      <div className="mx-auto w-full max-w-3xl px-5 py-14 sm:px-8 md:py-20">
        <nav aria-label="パンくず" className="mb-6 font-mono text-2xs text-sumi-500">
          <a href={internalHref('/')} className="underline-offset-4 hover:text-ink hover:underline">
            トップ
          </a>
          <span aria-hidden="true"> / </span>
          <a href={internalHref('/print/')} className="underline-offset-4 hover:text-ink hover:underline">
            {PRINT_HELP.name}
          </a>
        </nav>
        <p className="spec-label">{label}</p>
        <h1 className="mt-3 text-2xl font-bold leading-snug tracking-japanese text-ink md:text-3xl">{title}</h1>
        <div className="mt-5 text-base leading-8 text-sumi-700">{lead}</div>
        <p className="mt-3 font-mono text-2xs text-sumi-500">最終更新：{updatedAt}</p>
        <div className="mt-10 space-y-12">{children}</div>
        <HelpFooter />
      </div>
    </article>
  );
}

/** 見出しつきのかたまり */
export function GuideSection({ id, heading, children }: { id: string; heading: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="border-t-2 border-ink pt-6">
      <h2 id={id} className="text-xl font-bold tracking-japanese text-ink">
        {heading}
      </h2>
      <div className="mt-4 space-y-4 text-base leading-8 text-sumi-700">{children}</div>
    </section>
  );
}

export function Dot() {
  return <span aria-hidden="true" className="mt-3 h-1 w-1 shrink-0 bg-sumi-400" />;
}

/** ページの下：自分でやる（無料ツール）か、頼む（有料）か */
function HelpFooter() {
  return (
    <section aria-labelledby="help-heading" className="mt-16 border-t-2 border-ink pt-6">
      <h2 id="help-heading" className="text-xl font-bold tracking-japanese text-ink">
        それでも止まったら
      </h2>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="border border-sumi-300 p-5 sm:p-6">
          <p className="spec-label">無料・登録なし</p>
          <h3 className="mt-2 text-base font-bold tracking-japanese text-ink">自分で塗り足し3mmを付ける</h3>
          <p className="mt-3 text-sm leading-7 text-sumi-700">
            仕上がりの大きさで作った画像（PNG・JPEG）に、ふちから3mm足してPDFでお返しします。画像は外に送られません。
          </p>
          <ButtonLink href={internalHref('/print/')} variant="secondary" className="mt-4">
            無料ツールを使う
          </ButtonLink>
        </div>
        <div className="border border-sumi-300 p-5 sm:p-6">
          <p className="spec-label">有料・税込</p>
          <h3 className="mt-2 text-base font-bold tracking-japanese text-ink">こちらで直す</h3>
          <ul className="mt-3 space-y-1.5 text-sm leading-7 text-sumi-700">
            <li>
              {PRINT_HELP.bleedName}：1面{PRINT_HELP.bleedPrice}
            </li>
            <li>
              {PRINT_HELP.orderName}：1注文{PRINT_HELP.orderPrice}
            </li>
          </ul>
          <p className="mt-2 text-sm leading-7 text-sumi-600">
            PDFのデータ、ふちに人や文字がかかる絵、印刷会社から「不備あり」と言われたデータもお受けします。
          </p>
          <a href={internalHref('/print/#start-heading')} className="mt-3 inline-block text-sm font-bold text-ink underline underline-offset-4">
            値段と頼み方を見る
          </a>
        </div>
      </div>
      <ConsultBox subject={`${PRINT_HELP.name}の相談`} className="mt-6" />
    </section>
  );
}
