import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { Footer } from '@/components/layout/Footer';
import { V2Header } from '@/components/v2/V2Header';
import { absoluteUrl } from '@/lib/content/site';

/** 試作版のため検索エンジンには載せない */
export const metadata: Metadata = {
  title: '印刷用QRコード変換（試作 v2）',
  robots: { index: false, follow: false },
  alternates: { canonical: absoluteUrl('/v2/') },
};

export default function V2Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <V2Header />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
