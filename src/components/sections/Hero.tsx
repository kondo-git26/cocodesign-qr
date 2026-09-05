import { ArrowRight } from 'lucide-react';

import { ButtonLink } from '@/components/ui/Button';
import { QrLowRes, QrVector } from '@/components/ui/QrArtwork';
import { SAMPLE_QR_CONTENT, SITE } from '@/lib/content/site';
import { encodeQr } from '@/lib/qr/encoder';

const BADGES = ['K100', 'ベクターPDF', 'ドット配置を尊重'];

export function Hero() {
  // 表示するセル数は実際のサンプルQRから算出します
  const sample = encodeQr(SAMPLE_QR_CONTENT, 'M');

  return (
    <section aria-labelledby="hero-heading" className="relative overflow-hidden bg-paper">
      <div
        aria-hidden="true"
        className="grid-paper grid-paper-fade pointer-events-none absolute inset-0 opacity-70"
      />

      <div className="relative mx-auto w-full max-w-content px-5 pb-14 pt-12 sm:px-8 md:pb-20 md:pt-20">
        <div className="grid items-start gap-12 md:grid-cols-2 md:gap-10 lg:gap-16">
          {/* 左：コピー */}
          <div>
            <p className="spec-label flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>{SITE.serviceName}</span>
              <span aria-hidden="true" className="h-px w-6 bg-sumi-300" />
              <span>無料・登録不要</span>
            </p>

            <h1
              id="hero-heading"
              className="mt-5 text-[2rem] font-bold leading-[1.3] tracking-japanese text-ink sm:text-[2.5rem] md:text-[2.75rem] md:leading-[1.28]"
            >
              低解像度QRを、
              <br />
              印刷に使える
              <br />
              <span className="relative inline-block">
                <span className="relative z-10">K100ベクター</span>
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-1 z-0 h-3 bg-kinari"
                />
              </span>
              へ。
            </h1>

            <p className="mt-6 max-w-xl text-sm leading-7 text-sumi-600 md:text-base md:leading-8">
              クライアント支給のQR画像を、元のドット配置をできるだけ保ったまま解析。
              K100のPDF・SVG・PNGへ変換します。
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="#convert" size="lg" variant="primary" className="w-full sm:w-auto">
                無料で試す
                <ArrowRight size={16} aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="#howto" size="lg" variant="secondary" className="w-full sm:w-auto">
                使い方を見る
              </ButtonLink>
            </div>

            <dl className="mt-10 grid max-w-md gap-x-6 gap-y-2 border-t border-sumi-200 pt-6 sm:grid-cols-3">
              {[
                { term: 'K100', note: '黒版だけの黒' },
                { term: 'ベクター', note: '拡大しても崩れない' },
                { term: 'PDF / SVG', note: 'Illustratorで編集可' },
              ].map((item) => (
                <div key={item.term}>
                  <dt className="font-mono text-xs font-medium text-ink">{item.term}</dt>
                  <dd className="mt-0.5 text-2xs leading-5 text-sumi-500">{item.note}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* 右：Before / After */}
          <figure className="border border-sumi-200 bg-paper shadow-panel">
            <figcaption className="flex items-center justify-between border-b border-sumi-200 px-4 py-2.5">
              <span className="spec-label">変換前 / 変換後</span>
              <span className="spec-label">
                {sample.size} × {sample.size} cells
              </span>
            </figcaption>

            <div className="grid grid-cols-2 divide-x divide-sumi-200">
              <div className="p-4 sm:p-5">
                <p className="mb-3 flex items-center gap-2 text-xs font-medium text-sumi-500">
                  <span className="inline-block h-1.5 w-1.5 bg-sumi-400" aria-hidden="true" />
                  Before
                </p>
                <div className="aspect-square border border-sumi-200 bg-sumi-50 p-2">
                  <QrLowRes
                    content={SAMPLE_QR_CONTENT}
                    className="h-full w-full"
                    alt="変換前：解像度が足りず輪郭がにじんだQRコード画像"
                  />
                </div>
                <p className="mt-3 text-2xs leading-5 text-sumi-500">
                  粗い低解像度画像。
                  <br />
                  RGB・輪郭がにじむ
                </p>
              </div>

              <div className="bg-paper p-4 sm:p-5">
                <p className="mb-3 flex items-center gap-2 text-xs font-medium text-ink">
                  <span className="inline-block h-1.5 w-1.5 bg-shu" aria-hidden="true" />
                  After
                </p>
                <div className="aspect-square border border-sumi-200 bg-paper p-2">
                  <QrVector
                    content={SAMPLE_QR_CONTENT}
                    quietZone={0}
                    className="h-full w-full"
                    title="変換後：K100のベクターQRコード（読み取り可能なサンプル）"
                  />
                </div>
                <p className="mt-3 text-2xs leading-5 text-sumi-600">
                  シャープなK100ベクター。
                  <br />
                  セル境界が正確
                </p>
              </div>
            </div>

            <ul className="flex flex-wrap gap-2 border-t border-sumi-200 px-4 py-3">
              {BADGES.map((badge) => (
                <li
                  key={badge}
                  className="border border-sumi-300 px-2 py-1 font-mono text-2xs text-sumi-600"
                >
                  {badge}
                </li>
              ))}
            </ul>
          </figure>
        </div>

        <p className="mt-8 max-w-2xl text-2xs leading-5 text-sumi-500 md:mt-10">
          上の2つは実際に読み取れるサンプルQRです。元画像の状態によっては完全に再現できない場合があります。印刷前に必ず実データでテストしてください。
        </p>
      </div>
    </section>
  );
}
