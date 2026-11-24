/** サイト全体で使う定数とテキスト */

/**
 * サブディレクトリで公開する場合のパス（例：GitHub Pages のプロジェクトページ）。
 * 末尾スラッシュなし、先頭スラッシュあり。ルート直下で公開するなら空文字。
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** 公開URL（BASE_PATH を含む絶対URL・末尾スラッシュなし） */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cocodesign.pro'
).replace(/\/+$/, '');

/**
 * サイト内の絶対パスへのリンクを作ります。
 * 素の <a href="/contact/"> は basePath が付かないため、必ずこれを通します。
 * ページ内アンカー（#convert など）には不要です。
 */
export function internalHref(path: string): string {
  return `${BASE_PATH}${path}`;
}

/** メタデータ用の絶対URL */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path}`;
}

export const SITE = {
  name: 'ココデザイン',
  serviceName: '印刷用QRコード変換',
  title: '印刷用QRコード変換｜K100ベクターPDF',
  description:
    'クライアント支給の低解像度のQRコードを、元のドット配置をできるだけ維持したまま解析し、印刷用のK100ベクターPDFへ変換します。無料・登録不要。できたQRコードを入稿データに入れる作業と、CSVからの一括作成は有料でお受けします。',
  /** QRコード変換（プロ向け）の一言。2026-11-24 にフッターからは外しました（一般の方に意味が通らないため） */
  tagline: '毎日の5分を30秒に。',
  contactEmail: 'info@cocodesign.pro',
} as const;

/**
 * トップページ（2つの入口）の題と説明。
 * SITE.title / SITE.description は QRコード変換のページ（/qr/）で使います。
 */
export const HOME = {
  title: 'ネット印刷のデータ直しと、印刷用QRコード変換',
  description:
    'チラシや名刺をネット印刷に出すときの「塗り足しが足りません」を直す「ネット印刷おたすけ」（1面1,100円から）と、ぼやけたQRコードを印刷用のPDFに変える無料の変換ツール。名古屋・大須で印刷データを作っている合同会社大須メディアクォータが運営しています。',
} as const;

/**
 * 販売業者の情報。特定商取引法に基づく表記と利用規約で使います。
 * 登記上の商号・所在地をそのまま記載します（Stripe の審査は登記と一致している必要があります）。
 */
export const BUSINESS = {
  company: '合同会社大須メディアクォータ',
  manager: '近藤揮郎',
  postalCode: '460-0011',
  address: '愛知県名古屋市中区大須4-2-7',
  tel: '052-249-9984',
} as const;

/**
 * 有料：K100のQRコードを、お客様の入稿データに入れる作業。価格を変えるときはここだけ直します。
 * 2026-11-24 近藤さん：QRの無料変換は集客のページ。有料は「大量に作る」と「データにどう入れ込むか」。
 * それまでの「QRコード変換代行 5,500円（1件）」はやめた。値段は塗り足しと同じ2段。
 */
export const AGENCY = {
  name: 'QRコードをデータに入れる',
  price: '1,100円から',
  priceNote: '1データあたり・税込',
  tiers: [
    { name: '置くだけのもの', price: '1,100円', body: '決まった位置に、K100のQRコードを置きます' },
    {
      name: '差し替え・置き場所を考えるもの',
      price: '3,300円',
      body: '今あるQRコードとの差し替え、ページの多いもの、デザインに合わせて置き場所を考えるもの',
    },
  ],
} as const;

/** 有料で提供するCSVからの一括作成。価格を変えるときはここだけ直します。 */
export const BULK = {
  name: 'CSVからのQRコード一括作成',
  priceSmall: '2,200円',
  priceLarge: '3,300円',
  rowsSmall: '50行以内',
  rowsLarge: '100行以内',
  overNote: '101行以上は行数に応じて別途お見積もりします。',
} as const;

/**
 * 一般の方向けの「ネット印刷おたすけ」。価格を変えるときはここだけ直します。
 * 価格は仮（2026-11-03 決定）。3件ほど受けてから見直します。
 */
/** アクセス解析。ga4Id が空のあいだは、解析のスクリプトを読み込まない（プライバシーポリシーの記載もそれに合わせて切り替わる） */
export const ANALYTICS = {
  /** GA4 アカウント「ココデザイン」（kondow@gmail.com）・ストリーム cocodesign.pro。2026-11-24 作成 */
  ga4Id: 'G-R6DCX2NE3N',
} as const;

export const PRINT_HELP = {
  name: 'ネット印刷おたすけ',
  bleedName: '塗り足しを付ける',
  bleedPrice: '1,100円から',
  bleedUnit: '1面あたり・税込',
  /**
   * 塗り足しは3段（2026-11-24 近藤さん）：ツールで完了するもの＝セルフ無料／当方で作業 1,100円／
   * ツールだけで対応できないもの 3,300円。有料の2つのどちらかは作業の前にお伝えする
   */
  bleedTiers: [
    {
      name: 'ツールで足せるもの',
      price: '1,100円',
      body: '無料ツールで足せる絵を、こちらで作業してお返しします',
    },
    {
      name: 'ツールだけでは足せないもの',
      price: '3,300円',
      body: 'ふちに人・文字・写真がかかっていて、手で描き足したり並べ直したりする絵',
    },
  ],
  orderName: '入稿のお手伝い',
  orderPrice: '3,300円から',
  orderUnit: '1注文あたり・税込',
} as const;

export const NAV_LINKS = [
  { href: '#features', label: '特長' },
  { href: '#howto', label: '使い方' },
  { href: '#pricing', label: '料金' },
  { href: '#faq', label: 'FAQ' },
  { href: internalHref('/contact/'), label: 'お問い合わせ' },
] as const;

/** ヘッダーに出す2つの入口 */
export const HEADER_LINKS = [
  { href: internalHref('/print/'), label: 'ネット印刷おたすけ' },
  { href: internalHref('/qr/'), label: 'QRコード変換' },
] as const;

export const FOOTER_LINKS = [
  { href: internalHref('/print/'), label: 'ネット印刷おたすけ' },
  { href: internalHref('/qr/'), label: 'QRコード変換' },
  { href: internalHref('/terms/'), label: '利用規約' },
  { href: internalHref('/tokushoho/'), label: '特定商取引法に基づく表記' },
  { href: internalHref('/privacy/'), label: 'プライバシーポリシー' },
  { href: internalHref('/contact/'), label: 'お問い合わせ' },
] as const;

/** ヒーローの Before / After に使うダミーQR（実際に読み取れます） */
export const SAMPLE_QR_CONTENT = 'https://cocodesign.jp/tools/qr-print';
