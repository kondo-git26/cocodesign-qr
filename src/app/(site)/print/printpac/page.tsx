import type { Metadata } from 'next';

import { Dot, GuideSection, GuideShell } from '@/components/guide/GuideParts';
import { absoluteUrl, internalHref, PRINT_HELP, SITE } from '@/lib/content/site';

const TITLE = 'プリントパックにPDFで入稿するとき、止まりやすい6つのところ（Canva・Word も）';
const DESCRIPTION =
  'プリントパックへのPDF入稿で「データ不備」になりやすいところ（トンボ・塗り足し3mm・アウトライン・解像度・RGB・文字の位置）を、公式の入稿ガイドをもとに初めての方向けにまとめました。Canva・Word で作ったデータの入稿、入稿の手順も。';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl('/print/printpac/') },
};

/**
 * プリントパック公式の入稿ガイド（2026-11-24 に確かめた）。
 * 決まりが変わることがあるので、ページには「公式で確かめて」と書き、リンクを並べる。
 */
const OFFICIAL = {
  kiso: 'https://www.printpac.co.jp/contents/technicalguide/kiso.html',
  pdfIndex: 'https://www.printpac.co.jp/contents/pdf_creation/index.html',
  pdf3: 'https://www.printpac.co.jp/contents/pdf_creation/pdf3.html',
  canva: 'https://www.printpac.co.jp/contents/pdc/point_c_guide.html',
  draft: 'https://www.printpac.co.jp/contents/application/draft.html',
};

const CHECKS = [
  {
    title: 'トンボ（トリムマーク）が付いていない',
    body: 'プリントパックの案内では、PDF入稿のデータトラブルの約6割がこれです。PDFに保存したら、Acrobat Reader で開いて、四すみにトンボが出ているかを確かめます。',
    src: OFFICIAL.pdfIndex,
  },
  {
    title: '塗り足しが無い（仕上がりと同じ大きさで作った）',
    body: '色や写真は、仕上がりより上下左右3mm外まで伸ばします。A4のチラシをA4の大きさのまま作ると、入稿のやり直しになります。',
    src: OFFICIAL.pdf3,
    more: { href: internalHref('/print/nuritashi/'), label: '塗り足しとは（サイズ別の早見表）' },
  },
  {
    title: '文字がアウトライン化されていない',
    body: 'PDFで入稿するときは、文字をすべてアウトライン化（文字を図形に変える）します。していないと、入稿のやり直しになります。',
    src: OFFICIAL.pdf3,
  },
  {
    title: '画像が粗い',
    body: '写真や絵は 350ppi が標準で、最低でも 250ppi は要ります。ネットから拾った小さな画像や、AI で作った画像を大きく使うと足りないことが多いです。',
    src: OFFICIAL.pdf3,
  },
  {
    title: '色が RGB のまま',
    body: 'RGB のデータも受け付けてもらえますが、印刷会社で CMYK に変換されるので、画面で見た色と変わることがあります。プリントパックは CMYK での入稿を強く勧めています。',
    src: OFFICIAL.kiso,
  },
  {
    title: '文字が端に近すぎる',
    body: '切るときのずれで文字が切れないよう、仕上がりの線から3mm以上内側に置くのがおすすめとされています。',
    src: OFFICIAL.canva,
  },
];

const FAQ = [
  {
    q: 'ココデザインは、プリントパックの会社ですか？',
    a: 'いいえ、関係のない別の会社です。このページは、プリントパックの公式ガイドをもとに、初めての方向けにまとめ直したものです。',
  },
  {
    q: 'スマホから入稿できますか？',
    a: 'プリントパックの Canva 向けの案内では、スマホ・タブレットからは入稿できず、パソコンから入稿するように書かれています。',
  },
  {
    q: 'Word や PowerPoint のファイルのまま入稿できますか？',
    a: '2024年10月23日から、Office で作ったものは PDF 形式でだけ受け付けています。PDFに書き出してから入稿します。Word や PowerPoint には塗り足しを付ける機能が無いので、そこで止まる方が多いです。',
  },
  {
    q: '入稿したあと、データを直せますか？',
    a: '確認用のPDFを見て「このデータで印刷をする」を押すと、そのあとは直せなくなります。押す前に、確認用PDFで端の切れ方や文字の位置をよく見てください。',
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

function SourceLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm text-sumi-600 underline underline-offset-4 hover:text-ink"
    >
      プリントパックの公式ガイド
    </a>
  );
}

export default function PrintpacPage() {
  return (
    <GuideShell
      label="印刷会社ごとの入稿"
      title={
        <>
          <span className="inline-block">プリントパックに</span>
          <span className="inline-block">PDFで入稿するとき、</span>
          <span className="inline-block">止まりやすい6つのところ</span>
        </>
      }
      lead={
        <>
          <p>
            プリントパックの入稿ガイドはくわしい反面、初めての方には言葉がむずかしいところがあります。
            「データ不備」で止まりやすいところを、公式のガイドをもとにまとめ直しました。
          </p>
          <p className="mt-3 text-sm leading-7 text-sumi-600">
            {SITE.name}はプリントパックとは関係のない会社です。決まりは変わることがあるので、入稿の前に必ず公式のガイドも確かめてください。
          </p>
        </>
      }
      updatedAt="2026年11月24日"
    >
      <GuideSection id="checks" heading="入稿の前に見る6つ">
        <ol className="space-y-6">
          {CHECKS.map((item, index) => (
            <li key={item.title} className="flex gap-4">
              <span aria-hidden="true" className="shrink-0 pt-1 font-mono text-sm font-bold text-ink">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="font-bold text-ink">{item.title}</h3>
                <p className="mt-1">{item.body}</p>
                <p className="mt-1 flex flex-wrap gap-x-4">
                  <SourceLink href={item.src} />
                  {item.more && (
                    <a href={item.more.href} className="text-sm font-bold text-ink underline underline-offset-4">
                      {item.more.label}
                    </a>
                  )}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </GuideSection>

      <GuideSection id="canva" heading="Canva で作ったとき">
        <p>
          プリントパックには Canva 向けの公式の手順があります。書き出しは「PDF（印刷）」を選びます。
          チェックを入れる・入れない項目が細かく決まっているので、
          <a href={OFFICIAL.canva} target="_blank" rel="noopener noreferrer" className="font-bold text-ink underline underline-offset-4">
            Canva 向けの公式ガイド
          </a>
          の画面のとおりに進めてください。
        </p>
        <ul className="space-y-2">
          <li className="flex gap-2.5">
            <Dot />
            文字や写真は、仕上がりの線から3mm以上内側に置きます。
          </li>
          <li className="flex gap-2.5">
            <Dot />
            絵文字は使わないように、と案内されています。
          </li>
          <li className="flex gap-2.5">
            <Dot />
            入稿はパソコンからです。スマホ・タブレットからはできません。
          </li>
        </ul>
      </GuideSection>

      <GuideSection id="word" heading="Word・PowerPoint で作ったとき">
        <p>
          2024年10月23日から、Office で作ったものは PDF でだけ受け付けています。PDFに書き出して入稿します。
        </p>
        <p>
          ただ、Word と PowerPoint には塗り足しを付ける機能がありません。背景に色や写真があるチラシは、ここで止まりやすいです。
          仕上がりの大きさで画像に書き出してから、
          <a href={internalHref('/print/')} className="font-bold text-ink underline underline-offset-4">
            無料の塗り足しツール
          </a>
          で3mm足すと、塗り足し付きのPDFになります。
        </p>
        <p>
          ただし、無料ツールのPDFにはトンボが付きません。プリントパックのPDF入稿ではトンボが要るので、
          トンボまで付けたいときは
          <a href={internalHref('/print/#start-heading')} className="font-bold text-ink underline underline-offset-4">
            こちらで直します（{PRINT_HELP.bleedName}・1面{PRINT_HELP.bleedPrice}、トンボ込み）
          </a>
          。
        </p>
      </GuideSection>

      <GuideSection id="flow" heading="入稿の流れ">
        <ol className="space-y-3">
          {[
            '注文してから、マイページで入稿します（ログインが要ります）。',
            'データは1つのファイルにまとめてアップロードします。いくつもあるときは、圧縮して1つにします。3GBまでです。メール添付では受け付けていません。',
            '入稿のときに、画面の上で自動のデータチェック（クイックデータチェック・無料）がかかります。',
            '確認用のPDFを見て、「このデータで印刷をする」を押します。押したあとは直せないので、端と文字の位置をよく見てから押します。',
          ].map((step, index) => (
            <li key={step} className="flex gap-3">
              <span aria-hidden="true" className="shrink-0 pt-0.5 font-mono text-2xs text-sumi-500">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <p>
          <SourceLink href={OFFICIAL.draft} />
        </p>
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
          このページは、{SITE.name}（{PRINT_HELP.name}）が、プリントパックの公式ガイド（2026年11月24日に確認）をもとに書いています。
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
