import type { Metadata } from 'next';

import { Audience } from '@/components/sections/Audience';
import { Faq } from '@/components/sections/Faq';
import { Features } from '@/components/sections/Features';
import { HowTo } from '@/components/sections/HowTo';
import { Pricing } from '@/components/sections/Pricing';
import { Problems } from '@/components/sections/Problems';
import { Samples } from '@/components/sections/Samples';
import { DropStage } from '@/components/v2/DropStage';
import { STEPS_DROP } from '@/lib/content/sections';
import { absoluteUrl, SITE } from '@/lib/content/site';

export const metadata: Metadata = {
  title: SITE.title,
  description: SITE.description,
  alternates: { canonical: absoluteUrl('/qr/') },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    siteName: SITE.name,
    title: `${SITE.title}｜${SITE.name}`,
    description: SITE.description,
    url: absoluteUrl('/qr/'),
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
    title: `${SITE.title}｜${SITE.name}`,
    description: SITE.description,
    images: [absoluteUrl('/ogp.png')],
  },
};

const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: `${SITE.serviceName}｜${SITE.name}`,
  applicationCategory: 'DesignApplication',
  operatingSystem: 'Web',
  description: SITE.description,
  url: absoluteUrl('/qr/'),
  inLanguage: 'ja',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'JPY',
    description: '無料プラン（1件ずつ変換 / 登録不要）',
  },
};

/**
 * 印刷用QRコード変換のページ。
 * 2026-11-24 まではトップ（/）にありました。トップを2つの入口のページに変えたため、ここへ移しています。
 * ファーストビューと変換を一体化し、置く場所をひとつだけ置いています。
 * 旧デザイン（分離していた頃）は /v1/ に残しています。
 */
export default function QrPage() {
  return (
    <>
      <DropStage />
      <Features index="01" />
      <Problems index="02" />
      <HowTo
        index="03"
        steps={STEPS_DROP}
        lead="3つで終わります。形式やサイズを選ぶところはありません。"
      />
      <Samples index="04" />
      <Pricing index="05" />
      <Audience index="06" />
      <Faq index="07" />
      <script
        type="application/ld+json"
        // 構造化データ。文字列は自前で定義した定数のみです。
        dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
      />
    </>
  );
}
