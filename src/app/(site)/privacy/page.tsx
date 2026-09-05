import type { Metadata } from 'next';

import { Clause, PageShell } from '@/components/ui/PageShell';
import { absoluteUrl, SITE } from '@/lib/content/site';

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
      updatedAt="2026年8月3日"
    >
      <Clause heading="アップロードした画像の扱い">
        <p>
          現在公開している版では、画像の解析と変換処理をすべて利用者のブラウザ内で実行しています。
          アップロードされた画像がサーバーへ送信されることはありません。
        </p>
        <p>
          今後、サーバー側での処理を導入する場合は、送信されたデータを変換完了後に自動削除する運用とし、
          保存期間を含めた具体的な内容を本ページに明記したうえで公開します。
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
          サイトの改善のためにアクセス状況を計測する場合があります。その際も、個人を特定する情報は取得しません。
        </p>
      </Clause>

      <Clause heading="お問い合わせ先">
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
