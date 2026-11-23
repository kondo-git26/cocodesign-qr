import type { ReactNode } from 'react';

import { Footer } from '@/components/layout/Footer';
import { SiteHeader } from '@/components/layout/SiteHeader';

/**
 * 本サイト（トップ・ネット印刷おたすけ・QRコード変換・規約・お問い合わせ）の共通レイアウト。
 *
 * ヘッダーはロゴと、2つの入口へのリンクだけに絞っています。
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
