import { ANALYTICS } from '@/lib/content/site';

/**
 * Google アナリティクス（GA4）。測定ID が空のあいだは何も出しません。
 * <head> に置きます（サーチコンソールの「Google アナリティクスで所有者を確認」は、head にあるタグを見るため）。
 * 本番（cocodesign.pro）以外、たとえば手元の確認では送りません。
 * 送るのはページの表示とスクロールなどだけです。ツールに置いた画像やファイル名は送りません
 * （GA4 の管理画面で「ファイルのダウンロード」「フォームの操作」の自動計測を切っています。イベントを足すときも中身は送らない）。
 */
export function Analytics() {
  const id = ANALYTICS.ga4Id;
  if (!id) return null;
  return (
    <>
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${id}`} />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());if(location.hostname==='cocodesign.pro'){gtag('config','${id}');}`,
        }}
      />
    </>
  );
}
