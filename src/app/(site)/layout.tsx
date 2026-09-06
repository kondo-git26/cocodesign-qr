import type { ReactNode } from 'react';

import { Footer } from '@/components/layout/Footer';
import { SiteHeader } from '@/components/layout/SiteHeader';

/**
 * 本サイト（トップ・規約・お問い合わせ）の共通レイアウト。
 *
 * ヘッダーはロゴと「無料」だけに絞っています。
 * ファーストビューで説明を読ませない方針に合わせ、ナビゲーションは置きません。
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
