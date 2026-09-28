import type { Metadata } from 'next';

import { Clause, PageShell } from '@/components/ui/PageShell';
import { absoluteUrl, AGENCY, BULK, BUSINESS, internalHref, SITE } from '@/lib/content/site';

export const metadata: Metadata = {
  title: '利用規約',
  description: `${SITE.name}の印刷用QRコード変換ツールの利用規約です。`,
  alternates: { canonical: absoluteUrl('/terms/') },
  robots: { index: false, follow: true },
};

export default function TermsPage() {
  return (
    <PageShell
      title="利用規約"
      lead={`${BUSINESS.company}（以下「当社」）が提供する${SITE.name}の印刷用QRコード変換ツール、${AGENCY.name}および${BULK.name}（以下あわせて「本サービス」）の利用条件を定めます。`}
      updatedAt="2026年9月29日"
    >
      <Clause heading="第1条（適用）">
        <p>
          本規約は、本サービスの利用に関する一切の関係に適用されます。本サービスを利用した時点で、本規約に同意したものとみなします。
        </p>
      </Clause>

      <Clause heading="第2条（提供内容）">
        <p>
          本サービスは、QRコードの画像ファイルまたはテキストをもとに、印刷用のPDFを生成する機能を無料で提供します。
          無料で受け取れるのは、仕上がり20mm角・余白4セルのPDF（黒はCMYK 0 / 0 / 0 / 100）です。
        </p>
        <p>
          あわせて、無料の変換ツールで扱えない支給データについての{AGENCY.name}と、
          CSVに記載された内容から複数のQRコードをまとめて作成する{BULK.name}を、有料でお受けします。
          条件は第5条および
          <a href={internalHref('/tokushoho/')} className="text-ink underline underline-offset-4">
            特定商取引法に基づく表記
          </a>
          に定めます。
        </p>
        <p>機能・仕様・料金は予告なく変更される場合があります。</p>
      </Clause>

      <Clause heading="第3条（生成データの確認義務）">
        <p>
          本サービスが生成したデータの内容および読み取り可否は、利用者ご自身で確認してください。
          元画像の状態によっては、ドット配置を完全に再現できない場合があります。
          印刷物として使用する前に、必ず実データでの読み取りテストを実施してください。
        </p>
      </Clause>

      <Clause heading="第4条（禁止事項）">
        <ul className="space-y-2">
          {[
            '法令または公序良俗に違反する行為',
            '第三者の権利を侵害する内容のQRコードを生成する行為',
            '本サービスの運営を妨害する行為、過度な負荷をかける行為',
            '本サービスを複製・改変して再配布する行為',
          ].map((item) => (
            <li key={item} className="flex gap-2.5">
              <span aria-hidden="true" className="mt-2.5 h-1 w-1 shrink-0 bg-sumi-400" />
              {item}
            </li>
          ))}
        </ul>
      </Clause>

      <Clause heading="第5条（有料サービス）">
        <p>
          無料の変換ツールで扱えない支給データについて、当社は{AGENCY.name}を有料でお受けします。
          料金は1件あたり{AGENCY.price}（税込）です。
        </p>
        <p>
          お申し込みをいただいたのち、当社が内容を確認し、お受けできるかどうかをお返しします。
          お受けできる場合にかぎり、お支払いのご案内をお送りします。
          お支払いを確認した時点で契約が成立し、当社は作業を開始します。
        </p>
        <p>
          納品はメールで行います。デジタルデータの提供のため、納品後のキャンセル・返金はお受けできません。
          お支払いのあと作業に入る前にお申し出があった場合、および{AGENCY.name}において支給データから内容を復元できず
          納品できなかった場合は、お支払いいただいた全額をお返しします。
        </p>
        <p>
          QRコードの中身を決めること、デザインの制作および修正は、本サービスに含まれません。
          {BULK.name}では、CSVに記載された内容をそのままQRコードにします。内容の正しさは利用者が確認するものとします。
        </p>
      </Clause>

      <Clause heading="第6条（免責）">
        <p>
          本サービスの利用によって生じた損害について、当社は責任を負いかねます。
          生成データを印刷・配布した結果生じた損害についても同様とします。
        </p>
        <p>
          また、本サービスの提供の中断、停止、終了、および内容の変更によって利用者に生じた損害についても、責任を負いかねます。
        </p>
      </Clause>

      <Clause heading="第7条（知的財産）">
        <p>
          生成されたQRコードデータの利用権は利用者に帰属します。本サービス自体の権利は当社に帰属します。
        </p>
      </Clause>

      <Clause heading="第8条（規約の変更）">
        <p>
          本規約は必要に応じて変更することがあります。変更後の規約は、本ページに掲載した時点から効力を持ちます。
        </p>
      </Clause>
    </PageShell>
  );
}
