import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { absoluteUrl } from '@/lib/content/site';

/**
 * 旧デザイン（/v1/）用のレイアウト。
 *
 * ファーストビューと変換フォームを分けていた頃の構成を、比較用にそのまま残しています。
 * ナビゲーション付きの従来ヘッダーを使うため、本サイト側とはレイアウトを分けています。
 * 検索結果には出しません。
 */
export const metadata: Metadata = {
  title: '旧デザイン（v1）',
  robots: { index: false, follow: false },
  alternates: { canonical: absoluteUrl('/v1/') },
};

export default function V1Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
