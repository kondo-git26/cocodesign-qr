import type { Metadata } from 'next';

import { Clause, PageShell } from '@/components/ui/PageShell';
import { absoluteUrl, AGENCY, BULK, BUSINESS, internalHref, SITE } from '@/lib/content/site';

export const metadata: Metadata = {
  title: '特定商取引法に基づく表記',
  description: `${SITE.name}が提供する有料サービスについて、特定商取引法に基づく事業者情報・価格・支払方法・納品時期・キャンセルの条件を記載します。`,
  alternates: { canonical: absoluteUrl('/tokushoho/') },
};

/** 見出しと内容が1対1で並ぶ項目 */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-t border-sumi-200 py-4 sm:grid-cols-[10rem_1fr] sm:gap-4">
      <dt className="spec-label pt-0.5">{label}</dt>
      <dd className="text-sm leading-7 text-sumi-600">{children}</dd>
    </div>
  );
}

export default function TokushohoPage() {
  return (
    <PageShell
      title="特定商取引法に基づく表記"
      lead={`${SITE.name}が提供する有料サービス「${AGENCY.name}」および「${BULK.name}」についての表記です。無料でお使いいただける変換ツールは、この表記の対象外です。`}
      updatedAt="2026年9月29日"
    >
      <dl className="mb-4">
        <Row label="販売業者">{BUSINESS.company}</Row>
        <Row label="サービス名">{SITE.name}</Row>
        <Row label="業務責任者">{BUSINESS.manager}</Row>
        <Row label="所在地">
          〒{BUSINESS.postalCode}
          <br />
          {BUSINESS.address}
        </Row>
        <Row label="電話番号">
          <a href={`tel:${BUSINESS.tel.replace(/-/g, '')}`} className="font-mono text-ink underline underline-offset-4">
            {BUSINESS.tel}
          </a>
          <br />
          お問い合わせはメールでお願いしています。お電話でも受け付けます。
        </Row>
        <Row label="メールアドレス">
          <a
            href={`mailto:${SITE.contactEmail}`}
            className="break-all font-mono text-ink underline underline-offset-4"
          >
            {SITE.contactEmail}
          </a>
        </Row>
      </dl>

      <Clause heading="販売価格">
        <p>
          <strong className="font-bold text-ink">{AGENCY.name}</strong>
          <br />
          {AGENCY.price}（{AGENCY.priceNote}）
        </p>
        <p>
          仕上がりサイズ、余白、出力形式のご指定を含みます。支給データ1件につき1件として数えます。
        </p>
        <p className="pt-2">
          <strong className="font-bold text-ink">{BULK.name}</strong>
          <br />
          {BULK.rowsSmall}　{BULK.priceSmall}（税込）
          <br />
          {BULK.rowsLarge}　{BULK.priceLarge}（税込）
        </p>
        <p>
          {BULK.overNote}
          CSVの1行につきQRコードを1つ作成します。記載された内容をそのままQRコードにしますので、
          内容の正しさはお客様にてご確認ください。
        </p>
      </Clause>

      <Clause heading="商品代金以外に必要な料金">
        <p>
          ありません。納品はメールで行うため、送料は発生しません。
          お支払いの際の振込手数料は、お客様のご負担となります。
        </p>
      </Clause>

      <Clause heading="お支払い方法とお支払い時期">
        <p>
          クレジットカードでお支払いいただきます。当社からお送りするお支払い用のリンクからお手続きください。
          決済は Stripe（ストライプ）を通じて行います。当社がカード番号を受け取ることはありません。
        </p>
        <p>
          お支払いは、お受けできることをお返ししたあと、作業に入る前にお願いしています。
        </p>
      </Clause>

      <Clause heading="お申し込みからお届けまで">
        <ol className="space-y-2">
          {[
            'お問い合わせから、支給データまたはCSVファイルと、ご希望のサイズ・余白・形式・納期をお送りいただきます。',
            '内容を確認し、お受けできるかどうかを原則1営業日以内にお返しします。',
            'お受けできる場合にかぎり、お支払い用のリンクをお送りします。',
            'ご入金を確認したのち、原則として翌営業日までにメールで納品します。一括作成はZIPファイルにまとめてお渡しします。',
          ].map((step, index) => (
            <li key={step} className="flex gap-3">
              <span aria-hidden="true" className="shrink-0 font-mono text-2xs text-sumi-500">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <p>
          支給データの状態や件数によっては、これより日数をいただく場合があります。その場合は事前にお知らせします。
        </p>
      </Clause>

      <Clause heading="お受けできない場合">
        <p>
          QRコードの中身が確認できない場合、第三者の権利を侵害するおそれがある場合、
          ご指定の内容が本サービスの範囲を超える場合は、お受けできません。
          お支払いの前にお断りしますので、費用は発生しません。
        </p>
        <p>
          QRコードの中身を決めること、デザインそのものの制作や修正は、本サービスには含まれません。
        </p>
      </Clause>

      <Clause heading="キャンセル・返金について">
        <p>
          デジタルデータの提供のため、納品後のキャンセル・返金はお受けできません。
        </p>
        <p>
          お支払いのあと作業に入る前であれば、お申し出により全額をお返しします。
          また、変換代行において支給データから内容を復元できず、納品できなかった場合も全額をお返しします。
        </p>
        <p>
          納品したデータに当社の作業による誤りがあった場合は、無償でお直しします。
        </p>
      </Clause>

      <Clause heading="動作環境">
        <p>
          無料の変換ツールは、最新版の Google Chrome・Safari・Microsoft Edge・Firefox でご利用ください。
          納品データは PDF のほか、ご指定に応じて SVG・PNG などの形式でお渡しします。
          一括作成は ZIP ファイルでお渡しします。
        </p>
      </Clause>

      <Clause heading="関連するページ">
        <ul className="space-y-2">
          {[
            { href: internalHref('/terms/'), label: '利用規約' },
            { href: internalHref('/privacy/'), label: 'プライバシーポリシー' },
            { href: internalHref('/contact/'), label: 'お問い合わせ' },
          ].map((link) => (
            <li key={link.href} className="flex gap-2.5">
              <span aria-hidden="true" className="mt-2.5 h-1 w-1 shrink-0 bg-sumi-400" />
              <a href={link.href} className="text-ink underline underline-offset-4">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </Clause>
    </PageShell>
  );
}
