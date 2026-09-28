import type { Metadata } from 'next';
import { Mail } from 'lucide-react';

import { Clause, PageShell } from '@/components/ui/PageShell';
import { absoluteUrl, AGENCY, BULK, internalHref, SITE } from '@/lib/content/site';

export const metadata: Metadata = {
  title: 'お問い合わせ',
  description: `${SITE.name}の印刷用QRコード変換ツールと、有料の${AGENCY.name}・${BULK.name}のお問い合わせ窓口です。内容に合わせてお受けできるかをお返しします。`,
  alternates: { canonical: absoluteUrl('/contact/') },
};

const TOPICS = [
  '変換代行のお申し込み',
  'CSVからの一括作成のお申し込み',
  'PDF・Illustrator・InDesignで支給されたデータのご相談',
  '仕上がりサイズ・余白・出力形式のご指定',
  '不具合の報告・改善のご要望',
];

export default function ContactPage() {
  return (
    <PageShell
      title="お問い合わせ"
      lead="有料サービスのお申し込みと、機能のご要望や実務での使いにくい点を受け付けています。無料の変換ツールで扱えなかった支給データも、こちらからご相談ください。"
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

      <Clause heading="変換代行をご依頼の場合">
        <p>
          料金は1件あたり{AGENCY.price}（税込）です。次の5つをメールでお送りください。
        </p>
        <ul className="space-y-2">
          {[
            '支給データ（QRコードの画像、またはQRコードが入ったPDF・Illustrator・InDesignのファイル）',
            '仕上がりサイズ（例：15mm角）',
            '余白のセル数（ご指定がなければ4セルで書き出します）',
            '出力形式（PDF・SVG・PNG・EPSなど）',
            'ご希望の納期',
          ].map((item) => (
            <li key={item} className="flex gap-2.5">
              <span aria-hidden="true" className="mt-2.5 h-1 w-1 shrink-0 bg-sumi-400" />
              {item}
            </li>
          ))}
        </ul>
        <p>
          内容を確認して、お受けできるかどうかを原則1営業日以内にお返しします。
          お受けできる場合にかぎり、お支払いのご案内をお送りします。お断りする場合、費用は発生しません。
          ご入金の確認後、原則として翌営業日までにメールで納品します。
        </p>
        <p>
          支払方法とキャンセルの条件は
          <a href={internalHref('/tokushoho/')} className="text-ink underline underline-offset-4">
            特定商取引法に基づく表記
          </a>
          に記載しています。
        </p>
      </Clause>

      <Clause heading="CSVからの一括作成をご依頼の場合">
        <p>
          料金は{BULK.rowsSmall}が{BULK.priceSmall}（税込）、{BULK.rowsLarge}が{BULK.priceLarge}（税込）です。
          {BULK.overNote}
        </p>
        <ul className="space-y-2">
          {[
            'CSVファイル（文字コードはUTF-8、1行につき1つのQRコードを作成します）',
            'QRコードの内容が入っている列（例：B列のURL）',
            '納品ファイル名に使う列（例：A列の店舗名）',
            '仕上がりサイズと余白のセル数',
            'ご希望の納期',
          ].map((item) => (
            <li key={item} className="flex gap-2.5">
              <span aria-hidden="true" className="mt-2.5 h-1 w-1 shrink-0 bg-sumi-400" />
              {item}
            </li>
          ))}
        </ul>
        <p>
          1行につきPDFを1つ作成し、ZIPにまとめてお送りします。
          CSVに記載された内容をそのままQRコードにしますので、飛び先の正しさは事前にご確認ください。
        </p>
      </Clause>

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
          有料サービスでお預かりしたデータとCSVは、納品から14日を過ぎたのちに削除します。お断りした場合はその時点で削除します。
          不具合の検証のためにお預かりしたデータは、確認完了後に削除します。
        </p>
      </Clause>
    </PageShell>
  );
}
