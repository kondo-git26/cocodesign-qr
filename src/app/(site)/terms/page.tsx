import type { Metadata } from 'next';

import { Clause, PageShell } from '@/components/ui/PageShell';
import { absoluteUrl, SITE } from '@/lib/content/site';

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
      lead={`${SITE.name}が提供する印刷用QRコード変換ツール（以下「本サービス」）の利用条件を定めます。`}
      updatedAt="2026年8月3日"
    >
      <Clause heading="第1条（適用）">
        <p>
          本規約は、本サービスの利用に関する一切の関係に適用されます。本サービスを利用した時点で、本規約に同意したものとみなします。
        </p>
      </Clause>

      <Clause heading="第2条（提供内容）">
        <p>
          本サービスは、QRコード画像またはテキストをもとに、PDF・SVG・PNG形式のデータを生成する機能を提供します。
          現在公開しているものは開発中の版であり、機能・仕様・料金は予告なく変更される場合があります。
        </p>
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

      <Clause heading="第5条（免責）">
        <p>
          本サービスの利用によって生じた損害について、当方は責任を負いかねます。
          生成データを印刷・配布した結果生じた損害についても同様とします。
        </p>
        <p>
          また、本サービスの提供の中断、停止、終了、および内容の変更によって利用者に生じた損害についても、責任を負いかねます。
        </p>
      </Clause>

      <Clause heading="第6条（知的財産）">
        <p>
          生成されたQRコードデータの利用権は利用者に帰属します。本サービス自体の権利は当方に帰属します。
        </p>
      </Clause>

      <Clause heading="第7条（規約の変更）">
        <p>
          本規約は必要に応じて変更することがあります。変更後の規約は、本ページに掲載した時点から効力を持ちます。
        </p>
      </Clause>
    </PageShell>
  );
}
