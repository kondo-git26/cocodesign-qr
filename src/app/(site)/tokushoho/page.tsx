import type { Metadata } from 'next';

import { Clause, PageShell } from '@/components/ui/PageShell';
import { absoluteUrl, AGENCY, BULK, BUSINESS, internalHref, PRINT_HELP, SITE } from '@/lib/content/site';

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
      lead={`${SITE.name}が提供する有料サービス「${AGENCY.name}」「${BULK.name}」および「${PRINT_HELP.name}」についての表記です。無料でお使いいただけるツールは、この表記の対象外です。`}
      updatedAt="2026年11月22日"
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
        <p className="pt-2">
          <strong className="font-bold text-ink">{PRINT_HELP.name}</strong>
          <br />
          {PRINT_HELP.bleedName}　{PRINT_HELP.bleedPrice}（{PRINT_HELP.bleedUnit}）
          {PRINT_HELP.bleedTiers.map((tier) => (
            <span key={tier.name} className="block pl-4">
              {tier.name}：{tier.price}（{tier.body}）
            </span>
          ))}
          <br />
          {PRINT_HELP.orderName}　{PRINT_HELP.orderPrice}（{PRINT_HELP.orderUnit}）
        </p>
        <p>
          「{PRINT_HELP.bleedName}」は、印刷物の片面を1面として数えます。どちらの金額になるかは、データを見て作業に入る前にお伝えします。
          「{PRINT_HELP.orderName}」は、印刷会社への1回の注文を1注文として数えます。
          データの直しが多く 3,300円を超える場合は、作業に入る前に金額をお伝えし、ご了承をいただいてから進めます。
          印刷代は含みません。印刷代は、お客様から印刷会社へ直接お支払いください。
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
          銀行振込でお支払いいただきます。当社から請求書（PDF）をメールでお送りしますので、
          請求書に記載の口座へお振込みください。クレジットカードでのお支払いは準備中です。
        </p>
        <p>
          {AGENCY.name}・{BULK.name}：お受けできることをお返ししたあと、作業に入る前にお振込みをお願いしています。
        </p>
        <p>
          {PRINT_HELP.name}：納品のときに請求書をお送りします。請求書の日付から7日以内にお振込みください。
        </p>
      </Clause>

      <Clause heading="お申し込みからお届けまで">
        <ol className="space-y-2">
          {[
            'お問い合わせから、支給データまたはCSVファイルと、ご希望のサイズ・余白・形式・納期をお送りいただきます。',
            '内容を確認し、お受けできるかどうかを原則1営業日以内にお返しします。',
            'お受けできる場合にかぎり、請求書（PDF）をお送りします。',
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
        <p className="pt-2">
          {PRINT_HELP.name}は、メールでデータと仕上がりの大きさをお送りいただき、
          お受けできるかどうかと金額を原則1営業日以内にお返しします。
          「{PRINT_HELP.bleedName}」は、お受けしてから2営業日以内をめやすにメールで納品します。
          「{PRINT_HELP.orderName}」は、ご相談のうえ決めた日時に行います。
          いずれも、お返しできる日はお受けするときにお伝えします。
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
        <p>
          {PRINT_HELP.name}では、印刷代のお預かり・立て替え、印刷会社のサイトのIDやパスワードのお預かりはしていません。
          印刷会社の入稿の決まりに合わせてデータを整えるところまでが範囲で、印刷の色の出方を保証するものではありません。
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
          {PRINT_HELP.name}は、当社が作業に入る前であれば、費用なしでキャンセルできます。
          作業に入ったあとのキャンセルは、そこまでの作業分をご相談のうえご請求する場合があります。
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
