import type { Metadata } from 'next';

import { Clause, PageShell } from '@/components/ui/PageShell';
import { absoluteUrl, AGENCY, BULK, BUSINESS, SITE } from '@/lib/content/site';

export const metadata: Metadata = {
  title: 'プライバシーポリシー',
  description: `${SITE.name}の印刷用QRコード変換ツールにおける、アップロードデータと個人情報の取り扱いについて説明します。`,
  alternates: { canonical: absoluteUrl('/privacy/') },
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return (
    <PageShell
      title="プライバシーポリシー"
      lead="アップロードいただくデータと個人情報の取り扱いについて説明します。"
      updatedAt="2026年9月20日"
    >
      <Clause heading="無料の変換ツールで扱う画像">
        <p>
          無料の変換ツールは、画像の解析と変換処理をすべて利用者のブラウザ内で実行しています。
          アップロードされた画像がサーバーへ送信されることはありません。当社が内容を見ることもできません。
        </p>
        <p>
          今後サーバー側での処理を導入する場合は、保存期間を含めた具体的な内容を本ページに明記したうえで開始します。
        </p>
      </Clause>

      <Clause heading="有料サービスでお預かりするデータ">
        <p>
          有料の{AGENCY.name}および{BULK.name}では、メールで支給データやCSVファイルをお預かりします。
          無料の変換ツールとは異なり、このデータは当社が受け取り、作業のために保存します。
        </p>
        <p>
          CSVに氏名・店舗名・個別のURLなど、個人や取引先を特定できる情報が含まれる場合があります。
          お預かりした情報は、ご依頼いただいた作成作業のためにのみ利用します。
        </p>
        <p>
          お預かりしたデータと納品したデータは、納品から14日を過ぎたのちに削除します。
          お受けできずにお断りした場合は、その時点で削除します。
          作業の目的以外に利用することはなく、ご本人の同意なく第三者へ提供することはありません。
        </p>
      </Clause>

      <Clause heading="生成したデータの扱い">
        <p>
          無料プランでは変換履歴を保存しません。生成されたファイルはダウンロード後、ブラウザを閉じた時点で失われます。
        </p>
      </Clause>

      <Clause heading="お問い合わせでいただく情報">
        <p>
          メールでお問い合わせいただいた場合、返信および内容確認の目的でのみ利用します。
          ご本人の同意なく第三者へ提供することはありません。
        </p>
      </Clause>

      <Clause heading="アクセス解析">
        <p>
          本サイトはアクセス解析を導入していません。外部のスクリプトおよびWebフォントも読み込んでいません。
        </p>
        <p>
          今後導入する場合は、事業者名と取得する情報を本ページに明記したうえで開始します。
        </p>
      </Clause>

      <Clause heading="事業者・お問い合わせ先">
        <p>
          {BUSINESS.company}
          <br />〒{BUSINESS.postalCode}　{BUSINESS.address}
          <br />
          {BUSINESS.tel}
        </p>
        <p>
          本ポリシーに関するご質問は、
          <a
            href={`mailto:${SITE.contactEmail}`}
            className="font-mono text-ink underline underline-offset-4"
          >
            {SITE.contactEmail}
          </a>
          までご連絡ください。
        </p>
      </Clause>
    </PageShell>
  );
}
