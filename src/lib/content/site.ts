/** サイト全体で使う定数とテキスト */

/**
 * サブディレクトリで公開する場合のパス（例：GitHub Pages のプロジェクトページ）。
 * 末尾スラッシュなし、先頭スラッシュあり。ルート直下で公開するなら空文字。
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** 公開URL（BASE_PATH を含む絶対URL・末尾スラッシュなし） */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cocodesign-qr.netlify.app'
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
  title: '印刷用QRコード変換｜K100ベクターPDF・SVG生成',
  description:
    'クライアント支給の低解像度QR画像を、元のドット配置をできるだけ維持したまま解析。印刷用データとして使えるK100のPDF・SVG・PNGへ変換します。印刷会社・DTPオペレーター・デザイナー向け。',
  tagline: '毎日の5分を30秒に。',
  contactEmail: 'info@cocodesign.example.jp',
} as const;

export const NAV_LINKS = [
  { href: '#features', label: '特長' },
  { href: '#howto', label: '使い方' },
  { href: '#pricing', label: '料金' },
  { href: '#faq', label: 'FAQ' },
  { href: internalHref('/contact/'), label: 'お問い合わせ' },
] as const;

export const FOOTER_LINKS = [
  { href: internalHref('/terms/'), label: '利用規約' },
  { href: internalHref('/privacy/'), label: 'プライバシーポリシー' },
  { href: internalHref('/contact/'), label: 'お問い合わせ' },
] as const;

/** ヒーローの Before / After に使うダミーQR（実際に読み取れます） */
export const SAMPLE_QR_CONTENT = 'https://cocodesign.jp/tools/qr-print';
