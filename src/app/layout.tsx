import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import { absoluteUrl, HOME, SITE, SITE_URL } from '@/lib/content/site';

import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE.name}｜${HOME.title}`,
    template: `%s｜${SITE.name}`,
  },
  description: HOME.description,
  applicationName: SITE.name,
  keywords: [
    'ネット印刷',
    '塗り足し',
    '入稿データ',
    '印刷用QRコード',
    'QRコード ベクター',
    'K100',
    'CMYK',
    'QR PDF 変換',
    'QR SVG 変換',
    'Illustrator QRコード',
    'DTP',
    '低解像度 QR',
  ],
  authors: [{ name: SITE.name }],
  creator: SITE.name,
  publisher: SITE.name,
  alternates: {
    canonical: absoluteUrl('/'),
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    siteName: SITE.name,
    title: `${SITE.name}｜${HOME.title}`,
    description: HOME.description,
    url: SITE_URL,
    images: [
      {
        url: absoluteUrl('/ogp.png'),
        width: 1200,
        height: 630,
        alt: `${SITE.name} ${SITE.serviceName}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE.name}｜${HOME.title}`,
    description: HOME.description,
    images: [absoluteUrl('/ogp.png')],
  },
  robots: {
    index: true,
    follow: true,
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-paper font-sans text-ink">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:border focus:border-ink focus:bg-paper focus:px-4 focus:py-2 focus:text-sm"
        >
          本文へスキップ
        </a>
        {children}
      </body>
    </html>
  );
}
