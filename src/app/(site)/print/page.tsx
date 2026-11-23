import type { Metadata } from 'next';
import { Mail } from 'lucide-react';

import { BleedExample } from '@/components/print/BleedExample';
import { BleedTool } from '@/components/print/BleedTool';
import { ButtonLink } from '@/components/ui/Button';
import { ConsultBox } from '@/components/ui/ConsultBox';
import { absoluteUrl, internalHref, PRINT_HELP, SITE } from '@/lib/content/site';

export const metadata: Metadata = {
  title: `${PRINT_HELP.name}｜塗り足し・入稿のお手伝い`,
  description:
    'ネット印刷にチラシや名刺を出すとき、「塗り足しが足りません」と言われて止まった方へ。塗り足し3mmを付ける作業と、印刷会社へデータを送るまでのお手伝いを、1面1,100円からお受けします。自分で付けられる無料のツールもあります。',
  alternates: { canonical: absoluteUrl('/print/') },
};

const MAIL_HREF = `mailto:${SITE.contactEmail}?subject=${encodeURIComponent(`${PRINT_HELP.name}の相談`)}`;

/** 3つのメニュー。価格は site.ts の PRINT_HELP から取ります。 */
type MenuItem = {
  name: string;
  price: string;
  unit: string;
  body: string;
  tiers?: readonly { name: string; price: string; body: string }[];
  foot: string;
};

const MENU: MenuItem[] = [
  {
    name: PRINT_HELP.bleedName,
    price: PRINT_HELP.bleedPrice,
    unit: PRINT_HELP.bleedUnit,
    body: '仕上がりサイズで作ったデータに、塗り足し3mmを付けてお返しします。ふちに人や文字、ぼかしがある絵も、人が見て自然に足します。',
    tiers: PRINT_HELP.bleedTiers,
    foot: 'どちらになるかは、データを見て作業の前にお伝えします。表と裏があるものは2面です。',
  },
  {
    name: PRINT_HELP.orderName,
    price: PRINT_HELP.orderPrice,
    unit: PRINT_HELP.orderUnit,
    body: 'データが印刷会社の決まりに合っているかを確かめて、直します。注文画面でどれを選ぶかも、LINEか画面共有で横についてご案内します。',
    foot: '直すところが多いときは、作業の前に金額をお伝えします。',
  },
  {
    name: '自分で塗り足しを付ける',
    price: '0円',
    unit: '登録なし',
    body: 'このページの下にあるツールで、画像に塗り足し3mmを付けられます。ふちが単色の絵や、模様の絵に向いています。',
    foot: '画像はお使いのブラウザの中だけで処理します。',
  },
];

/** 冒頭に出す、有料の2つ（値段と一言だけ）。くわしい説明は下の MENU に書きます。 */
const PAID = [
  {
    name: PRINT_HELP.bleedName,
    price: PRINT_HELP.bleedPrice,
    unit: '1面・税込',
    short: 'いまのデータに、塗り足し3mmを付けてお返しします。ふちに人や文字がかかっていて描き足しが要る絵は、1面3,300円です。',
  },
  {
    name: PRINT_HELP.orderName,
    price: PRINT_HELP.orderPrice,
    unit: '1注文・税込',
    short: 'データを確かめて直し、注文画面も横についてご案内します。',
  },
];

const SEND_ITEMS = [
  '印刷したいデータ（PDF・画像・Canva やワードから書き出したもの）',
  '仕上がりの大きさ（例：A4、名刺 91×55mm）',
  '頼みたい印刷会社（決まっていれば。まだなら一緒に選びます）',
  'いつまでに要るか',
];

const STEPS = [
  'メールで、左の4つをお送りください。',
  '内容を見て、お受けできるかどうかと金額を、原則1営業日以内にお返しします。お断りする場合、費用はかかりません。',
  '作業をして、できたデータをメールでお返しします。入稿のお手伝いは、ご都合のよい日時に注文画面を一緒に進めます。',
  'お返しするときに請求書（PDF）をお送りします。請求書の日付から7日以内に、銀行振込でお支払いください。',
];

const NOT_DOING = [
  '印刷代をお預かりしたり、立て替えたりはしません。印刷代は、お客様から印刷会社へ直接お支払いください。',
  '印刷会社のサイトのIDやパスワードはお預かりしません。注文画面はお客様ご自身が操作し、こちらは横でご案内します。',
  'チラシや名刺のデザインを新しく作ることは、お受けしていません。',
  '印刷会社の決まりに合わせて整えるところまでが範囲です。色の出方は印刷会社と紙で変わるため、「思ったとおりの色で出る」ことまではお約束できません。',
];

function Dot() {
  return <span aria-hidden="true" className="mt-2.5 h-1 w-1 shrink-0 bg-sumi-400" />;
}

export default function PrintPage() {
  return (
    <article className="border-t border-sumi-200 bg-paper">
      <div className="mx-auto w-full max-w-5xl px-5 py-14 sm:px-8 md:py-20">
        <p className="spec-label">{PRINT_HELP.name}</p>
        <h1 className="mt-3 text-2xl font-bold leading-snug tracking-japanese text-ink md:text-4xl">
          <span className="inline-block">ネット印刷のデータで</span>
          <span className="inline-block">止まったら、</span>
          <br className="hidden sm:block" />
          <span className="inline-block">そこから先を</span>
          <span className="inline-block">手伝います。</span>
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-sumi-700">
          チラシや名刺をネット印刷に出そうとして、「塗り足しが足りません」「データに不備があります」と言われて止まっていませんか。
          足りないところを直して、印刷会社へ送れる形にしてお返しします。
        </p>

        {/* まず「頼める・いくら・どう頼む」。困って来た人が、解説を読み終える前に動けるように */}
        <section
          aria-labelledby="start-heading"
          className="mt-8 grid gap-6 border-t-2 border-ink pt-6 md:mt-10 md:grid-cols-2 md:gap-10 md:pt-8"
        >
          <div>
            <h2 id="start-heading" className="text-base font-bold tracking-japanese text-ink">
              頼めること
            </h2>
            <dl className="mt-3 border-t border-sumi-200">
              {PAID.map((item) => (
                <div key={item.name} className="border-b border-sumi-200 py-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <dt className="whitespace-nowrap text-base font-bold tracking-japanese text-ink">
                      {item.name}
                    </dt>
                    <dd className="shrink-0 text-right">
                      <span className="text-xl font-bold text-ink">{item.price}</span>
                      <span className="ml-2 text-xs text-sumi-600">{item.unit}</span>
                    </dd>
                  </div>
                  <p className="mt-1 text-sm leading-7 text-sumi-700">{item.short}</p>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-sm leading-7 text-sumi-600">
              自分で付けられる
              <a href="#tool-heading" className="text-ink underline underline-offset-4">
                無料のツール
              </a>
              も、このページの下にあります。
            </p>
          </div>
          <ConsultBox subject={`${PRINT_HELP.name}の相談`} className="self-start" />
        </section>

        <section aria-labelledby="what-heading" className="mt-14">
          <h2 id="what-heading" className="text-base font-bold tracking-japanese text-ink">
            「塗り足しが足りません」とは
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-8 text-sumi-700">
            印刷会社は、大きな紙にまとめて刷ってから切ります。切る刃は少しずれることがあるので、色や写真は切るところより3mm外まで伸ばしておく決まりです。これが「塗り足し」です。
          </p>
          <div className="mt-5">
            <BleedExample />
          </div>
        </section>

        <section aria-labelledby="menu-heading" className="mt-14">
          <h2 id="menu-heading" className="text-base font-bold tracking-japanese text-ink">
            お受けすること
          </h2>
          <div className="mt-4 grid gap-px border border-sumi-300 bg-sumi-300 md:grid-cols-3">
            {MENU.map((item) => (
              <div key={item.name} className="flex flex-col bg-paper p-5 sm:p-6">
                <h3 className="text-base font-bold tracking-japanese text-ink">{item.name}</h3>
                <p className="mt-3 flex flex-wrap items-baseline gap-x-2">
                  <span className="text-2xl font-bold text-ink">{item.price}</span>
                  <span className="text-xs text-sumi-600">{item.unit}</span>
                </p>
                <p className="mt-4 text-base leading-8 text-sumi-700">{item.body}</p>
                {item.tiers && (
                  <dl className="mt-4 border-t border-sumi-200">
                    {item.tiers.map((tier) => (
                      <div key={tier.name} className="border-b border-sumi-200 py-2.5">
                        <div className="flex items-baseline justify-between gap-3">
                          <dt className="text-sm font-bold text-ink">{tier.name}</dt>
                          <dd className="shrink-0 text-base font-bold text-ink">{tier.price}</dd>
                        </div>
                        <p className="mt-0.5 text-sm leading-6 text-sumi-600">{tier.body}</p>
                      </div>
                    ))}
                  </dl>
                )}
                <p className="mt-auto pt-4 text-sm leading-7 text-sumi-600">{item.foot}</p>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="order-heading" className="mt-14 grid gap-10 md:grid-cols-2">
          <div>
            <h2 id="order-heading" className="text-base font-bold tracking-japanese text-ink">
              頼み方
            </h2>
            <p className="mt-3 text-base leading-8 text-sumi-700">次の4つを、メールでお送りください。</p>
            <ul className="mt-3 space-y-2 text-base leading-8 text-sumi-700">
              {SEND_ITEMS.map((item) => (
                <li key={item} className="flex gap-2.5">
                  <Dot />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-6 border border-sumi-300 bg-sumi-50 p-5">
              <ButtonLink href={MAIL_HREF} size="lg">
                <Mail size={18} aria-hidden="true" />
                メールで相談する
              </ButtonLink>
              <p className="mt-3 break-all font-mono text-sm text-ink">{SITE.contactEmail}</p>
              <p className="mt-2 text-sm leading-7 text-sumi-600">
                「これは頼めるのか」だけのご相談でもかまいません。ご相談は無料です。
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-base font-bold tracking-japanese text-ink">お返しするまで</h2>
            <ol className="mt-3 space-y-3 text-base leading-8 text-sumi-700">
              {STEPS.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span aria-hidden="true" className="shrink-0 pt-0.5 font-mono text-2xs text-sumi-500">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-sm leading-7 text-sumi-600">
              いつお返しできるかは、お受けするときにお伝えします。塗り足しを付ける作業は、2営業日以内がめやすです。
              お支払い・キャンセルの条件は
              <a href={internalHref('/tokushoho/')} className="text-ink underline underline-offset-4">
                特定商取引法に基づく表記
              </a>
              に記載しています。
            </p>
          </div>
        </section>

        <section aria-labelledby="tool-heading" className="mt-16 border-t border-sumi-200 pt-12">
          <p className="spec-label">無料・登録なし</p>
          <h2 id="tool-heading" className="mt-2 text-xl font-bold tracking-japanese text-ink md:text-2xl">
            自分で塗り足し3mmを付ける
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-sumi-700">
            仕上がりサイズで作った画像を置くと、ふちから3mm足してお返しします。画像はこのブラウザの中だけで処理され、外には送られません。
          </p>
          <p className="mt-3 max-w-2xl text-base leading-8 text-sumi-700">
            いま扱えるのは PNG と JPEG の画像です。PDF のデータや、ふちに人や文字がある絵は、上の「{PRINT_HELP.bleedName}」（{PRINT_HELP.bleedPrice}）でお受けします。
          </p>
          <div className="mt-10">
            <BleedTool />
          </div>
        </section>

        <section aria-labelledby="not-heading" className="mt-16 border-t border-sumi-200 pt-10">
          <h2 id="not-heading" className="text-base font-bold tracking-japanese text-ink">
            お受けしていないこと
          </h2>
          <ul className="mt-4 max-w-3xl space-y-2 text-base leading-8 text-sumi-700">
            {NOT_DOING.map((item) => (
              <li key={item} className="flex gap-2.5">
                <Dot />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm leading-7 text-sumi-600">
            運営：合同会社大須メディアクォータ（名古屋市中区大須）
          </p>
        </section>
      </div>
    </article>
  );
}
