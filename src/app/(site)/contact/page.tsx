import type { Metadata } from 'next';
import { Mail } from 'lucide-react';

import { Clause, PageShell } from '@/components/ui/PageShell';
import { absoluteUrl, SITE } from '@/lib/content/site';

export const metadata: Metadata = {
  title: 'お問い合わせ',
  description: `${SITE.name}の印刷用QRコード変換ツールに関するお問い合わせ窓口です。一括変換や大きなサイズの出力など、必要な運用があればお知らせください。`,
  alternates: { canonical: absoluteUrl('/contact/') },
};

const TOPICS = [
  '一括変換（100枚単位）の運用について',
  '名刺サイズより大きい出力について',
  '入稿データの形式に関するご相談',
  '不具合の報告・改善のご要望',
];

export default function ContactPage() {
  return (
    <PageShell
      title="お問い合わせ"
      lead="機能のご要望、実務での使いにくい点、料金プランへのご意見など、なんでもお知らせください。現場の運用に合わせて優先順位を決めています。"
    >
      <section className="border border-sumi-300 bg-sumi-50 p-5 sm:p-6">
        <p className="spec-label mb-2">メール</p>
        <a
          href={`mailto:${SITE.contactEmail}`}
          className="inline-flex items-center gap-2 break-all font-mono text-base font-medium text-ink underline-offset-4 hover:underline"
        >
          <Mail size={18} aria-hidden="true" className="shrink-0" />
          {SITE.contactEmail}
        </a>
        <p className="mt-4 text-2xs leading-5 text-sumi-500">
          営業日の場合、2〜3日以内にご返信します。
          お問い合わせの際に、実際に困っている支給データの状況（サイズ、形式、枚数）を添えていただけると具体的にお答えできます。
        </p>
      </section>

      <Clause heading="よくいただくご相談">
        <ul className="space-y-2">
          {TOPICS.map((topic) => (
            <li key={topic} className="flex gap-2.5">
              <span aria-hidden="true" className="mt-2.5 h-1 w-1 shrink-0 bg-sumi-400" />
              {topic}
            </li>
          ))}
        </ul>
      </Clause>

      <Clause heading="データを送っていただく場合">
        <p>
          QRコードの画像そのものをお送りいただく場合は、内容に個人情報や未公開の情報が含まれていないかをご確認ください。
          検証のためにお預かりしたデータは、確認完了後に削除します。
        </p>
      </Clause>
    </PageShell>
  );
}
