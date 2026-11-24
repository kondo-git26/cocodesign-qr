import type { Metadata } from 'next';

import { Dot, GuideSection, GuideShell } from '@/components/guide/GuideParts';
import { BleedExample } from '@/components/print/BleedExample';
import { absoluteUrl, internalHref, PRINT_HELP, SITE } from '@/lib/content/site';

const TITLE = '塗り足しとは？3mm足す理由と、サイズ別の早見表（A4・A5・名刺）';
const DESCRIPTION =
  '印刷の「塗り足し（裁ち落とし）」とは何か、なぜ3mm必要かを図で説明します。A4・A5・B5・名刺・ハガキの塗り足し込みの大きさ（mm・画素）の早見表つき。Canva や AI で作った画像に、塗り足しを無料で付けるツールもあります。';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl('/print/nuritashi/') },
};

/**
 * 仕上がり＋上下左右3mm。画素は 350dpi で計算し、切り上げ。
 * （350dpi は多くのネット印刷が勧める細かさ。例：プリントパックは「350ppiが標準」）
 */
const SIZES = [
  { name: '名刺', trim: '91 × 55', bleed: '97 × 61', px: '1,337 × 841' },
  { name: 'ハガキ', trim: '100 × 148', bleed: '106 × 154', px: '1,461 × 2,123' },
  { name: 'A6', trim: '105 × 148', bleed: '111 × 154', px: '1,530 × 2,123' },
  { name: 'A5', trim: '148 × 210', bleed: '154 × 216', px: '2,123 × 2,977' },
  { name: 'B5', trim: '182 × 257', bleed: '188 × 263', px: '2,591 × 3,625' },
  { name: 'A4', trim: '210 × 297', bleed: '216 × 303', px: '2,977 × 4,176' },
  { name: 'B4', trim: '257 × 364', bleed: '263 × 370', px: '3,625 × 5,099' },
  { name: 'A3', trim: '297 × 420', bleed: '303 × 426', px: '4,176 × 5,871' },
];

const FAQ = [
  {
    q: '塗り足しと裁ち落としは、同じものですか？',
    a: '同じものを指します。印刷会社によって「塗り足し」「裁ち落とし」「ヌリタシ」と呼び方が違います。',
  },
  {
    q: '塗り足しは何mm必要ですか？',
    a: '多くのネット印刷では、上下左右それぞれ3mmです。印刷会社や印刷物によって違うことがあるので、出す先の入稿ガイドも確かめてください。',
  },
  {
    q: '白い背景のチラシにも、塗り足しは要りますか？',
    a: 'ふちまで白いだけなら、少しずれて切られても目立たないので、困ることは少ないです。ただ、印刷会社によっては白でも仕上がりより大きいデータを求めます。入稿ガイドに合わせてください。',
  },
  {
    q: '仕上がりの大きさで作ってしまいました。作り直しですか？',
    a: '作り直さなくても、ふちを3mm足せば済むことが多いです。ふちが単色や模様なら、無料のツールで足せます。ふちに人や文字がかかっている絵は、こちらで描き足します（1面3,300円）。',
  },
];

const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
};

export default function NuritashiPage() {
  return (
    <GuideShell
      label="印刷の基本"
      title={
        <>
          <span className="inline-block">塗り足しとは？</span>
          <span className="inline-block">3mm足す理由と、</span>
          <span className="inline-block">サイズ別の早見表</span>
        </>
      }
      lead={
        <p>
          ネット印刷に出したら「塗り足しが足りません」と言われた。そんなときに読むページです。
          塗り足しが何か、どのくらいの大きさで作ればいいかを、図と表でまとめました。
        </p>
      }
      updatedAt="2026年11月24日"
    >
      <GuideSection id="what" heading="塗り足しは、切るときのずれに備える「のりしろ」">
        <p>
          印刷会社は、大きな紙にまとめて刷ってから、決まった大きさに切ります。切る刃は、どうしても少しずれます。
          色や写真をちょうど仕上がりの線までしか置いていないと、ずれたところに紙の白いすじが出てしまいます。
        </p>
        <p>
          そこで、色や写真を仕上がりの線より<strong className="font-bold text-ink">3mm外まで</strong>伸ばしておきます。
          これが「塗り足し」です。「裁ち落とし」「ヌリタシ」と呼ぶ印刷会社もあります。
        </p>
        <BleedExample />
      </GuideSection>

      <GuideSection id="sizes" heading="塗り足し込みの大きさ 早見表">
        <p>
          上下左右に3mmずつ足すので、たても横も<strong className="font-bold text-ink">6mm大きく</strong>作ります。
          画像で作るときの画素数は、きれいに刷れる細かさ（350dpi）で計算しています。
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b-2 border-ink">
                <th scope="col" className="py-2 pr-3 font-bold text-ink">大きさ</th>
                <th scope="col" className="py-2 pr-3 font-bold text-ink">仕上がり（mm）</th>
                <th scope="col" className="py-2 pr-3 font-bold text-ink">塗り足し込み（mm）</th>
                <th scope="col" className="py-2 font-bold text-ink">画像なら（画素）</th>
              </tr>
            </thead>
            <tbody>
              {SIZES.map((row) => (
                <tr key={row.name} className="border-b border-sumi-200">
                  <th scope="row" className="py-2 pr-3 font-bold text-ink">{row.name}</th>
                  <td className="py-2 pr-3 font-mono text-sumi-700">{row.trim}</td>
                  <td className="py-2 pr-3 font-mono font-bold text-ink">{row.bleed}</td>
                  <td className="py-2 font-mono text-sumi-700">{row.px}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm leading-7 text-sumi-600">
          たて置きの数字です。よこ置きなら入れ替えてください。画素数は 350dpi のときの目安で、少し大きくても問題ありません。
        </p>
      </GuideSection>

      <GuideSection id="text" heading="文字は、仕上がりから3mm内側に">
        <p>
          ずれは外側だけでなく、内側にも起きます。大事な文字やロゴを仕上がりの線ぎりぎりに置くと、切れてしまうことがあります。
          文字は仕上がりの線から<strong className="font-bold text-ink">3mm以上内側</strong>に置くのが安心です。
        </p>
        <p>
          つまり、ふちの近くは「外へ3mmは伸ばす」「内へ3mmは文字を置かない」の2つです。
        </p>
      </GuideSection>

      <GuideSection id="how" heading="作ったアプリ別：塗り足しの付け方">
        <ul className="space-y-3">
          <li className="flex gap-2.5">
            <Dot />
            <span>
              <strong className="font-bold text-ink">Illustrator・InDesign</strong>：
              新しく作るときに裁ち落としを3mmにして、背景を赤い線まで伸ばします。PDFに書き出すときは「裁ち落とし」と「トンボ」を付けます。
            </span>
          </li>
          <li className="flex gap-2.5">
            <Dot />
            <span>
              <strong className="font-bold text-ink">Canva</strong>：
              塗り足しを表示する設定をオンにすると、ふちに足す場所が出ます。背景をそこまで広げてから、印刷用のPDFで書き出します。
              出す印刷会社が Canva 向けの手順を出していることも多いので、それに合わせてください。
            </span>
          </li>
          <li className="flex gap-2.5">
            <Dot />
            <span>
              <strong className="font-bold text-ink">Word・PowerPoint・画像だけ</strong>：
              塗り足しを付ける機能がありません。仕上がりの大きさで画像（PNG・JPEG）に書き出してから、
              <a href={internalHref('/print/')} className="font-bold text-ink underline underline-offset-4">
                無料の塗り足しツール
              </a>
              で3mm足すのが早いです（ツールのPDFにはトンボが付きません。トンボが要る印刷会社では、こちらで付けます）。
            </span>
          </li>
          <li className="flex gap-2.5">
            <Dot />
            <span>
              <strong className="font-bold text-ink">ChatGPT など AI で作った画像</strong>：
              AI の画像は、長い辺が1,500画素前後のことが多く、上の表で見ると、きれいに刷れるのは名刺くらいの大きさまでです。
              大きく刷るときは、先に大きくしてから塗り足しを付けます。
            </span>
          </li>
        </ul>
      </GuideSection>

      <GuideSection id="printers" heading="印刷会社ごとの決まり">
        <p>
          塗り足しの幅は多くの印刷会社で3mmですが、トンボの要る・要らない、PDFの作り方などは会社ごとに違います。
        </p>
        <ul className="space-y-2">
          <li className="flex gap-2.5">
            <Dot />
            <a href={internalHref('/print/printpac/')} className="font-bold text-ink underline underline-offset-4">
              プリントパックにPDFで入稿するとき、止まりやすいところ
            </a>
          </li>
        </ul>
      </GuideSection>

      <GuideSection id="faq" heading="よくある質問">
        <dl className="space-y-5">
          {FAQ.map((item) => (
            <div key={item.q}>
              <dt className="font-bold text-ink">{item.q}</dt>
              <dd className="mt-1">{item.a}</dd>
            </div>
          ))}
        </dl>
        <p className="text-sm leading-7 text-sumi-600">
          このページは、{SITE.name}（{PRINT_HELP.name}）が書いています。
        </p>
      </GuideSection>

      <script
        type="application/ld+json"
        // 構造化データ。文字列は自前で定義した定数のみです。
        dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
      />
    </GuideShell>
  );
}
