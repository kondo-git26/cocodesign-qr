import type { Metadata } from 'next';
import { ArrowRight, Mail } from 'lucide-react';

import { CutFigure } from '@/components/print/BleedExample';
import { ButtonLink } from '@/components/ui/Button';
import { QrLowRes, QrVector } from '@/components/ui/QrArtwork';
import {
  absoluteUrl,
  AGENCY,
  BULK,
  BUSINESS,
  internalHref,
  PRINT_HELP,
  SAMPLE_QR_CONTENT,
  SITE,
} from '@/lib/content/site';

export const metadata: Metadata = {
  alternates: { canonical: absoluteUrl('/') },
};

const MAIL_HREF = `mailto:${SITE.contactEmail}?subject=${encodeURIComponent('ココデザインへの相談')}`;

/** 値段の1行。品名は左、値段は右に揃える（お品書きの形） */
function PriceRow({ name, price, unit }: { name: string; price: string; unit: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-sumi-200 py-2.5">
      <dt className="text-sm text-ink">{name}</dt>
      <dd className="shrink-0 text-right">
        <span className="text-base font-bold text-ink">{price}</span>
        <span className="ml-2 text-xs text-sumi-600">{unit}</span>
      </dd>
    </div>
  );
}

/**
 * トップページ。2つの入口だけを置きます。
 *
 * 2026-11-24 まではここが QRコード変換そのものでした（いまは /qr/）。
 * 一般の方向けの「ネット印刷おたすけ」を始めて、1ページに相手が2人いる状態になったため、
 * トップは「何をしている所か」と「どちらへ進むか」だけを見せる入口に変えています。
 * 絵は言葉より先に置く（塗り足しの白いすじ／ぼやけたQRコード）。
 */
export default function HomePage() {
  return (
    <div className="border-t border-sumi-200 bg-paper">
      <div className="mx-auto w-full max-w-5xl px-5 pb-16 pt-12 sm:px-8 md:pb-24 md:pt-16">
        <h1 className="text-2xl font-bold leading-snug tracking-japanese text-ink md:text-4xl md:leading-snug">
          <span className="inline-block">印刷に出すデータの、</span>
          <span className="inline-block">困ったところを直します。</span>
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-sumi-600 md:text-base md:leading-8">
          チラシや名刺をネット印刷に出す方と、仕事でQRコードを印刷物に入れる方へ。
          名古屋・大須で、ガイドブックやリーフレットの印刷データを作っている者がお受けします。
        </p>

        {/* 入口 1：ネット印刷おたすけ（一般の方向け） */}
        <section
          aria-labelledby="door-print"
          className="mt-12 grid gap-6 border-t-2 border-ink pt-8 md:mt-16 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-12 md:pt-10"
        >
          <a
            href={internalHref('/print/')}
            aria-hidden="true"
            tabIndex={-1}
            className="block self-start bg-sumi-50 px-4 pb-4 pt-2 sm:px-6"
          >
            <span className="grid grid-cols-2 gap-2">
              <span className="block">
                <CutFigure id="door-nobleed" bleed={false} />
                <span className="block text-center text-xs font-bold text-shu">
                  ふちに白いすじ
                </span>
              </span>
              <span className="block">
                <CutFigure id="door-bleed" bleed />
                <span className="block text-center text-xs font-bold text-ink">
                  ふちまで色が付く
                </span>
              </span>
            </span>
          </a>
          <div>
            <p className="text-xs text-sumi-600">チラシや名刺を、ネット印刷に出す方へ</p>
            <h2
              id="door-print"
              className="mt-2 text-xl font-bold tracking-japanese text-ink md:text-2xl"
            >
              {PRINT_HELP.name}
            </h2>
            <p className="mt-4 text-sm leading-7 text-sumi-600">
              「塗り足しが足りません」「データに不備があります」と言われて止まったら、足りないところを直して、印刷会社へ送れる形にしてお返しします。
            </p>
            <dl className="mt-5 border-t border-sumi-200">
              <PriceRow name={PRINT_HELP.bleedName} price={PRINT_HELP.bleedPrice} unit="1面・税込" />
              <PriceRow name={PRINT_HELP.orderName} price={PRINT_HELP.orderPrice} unit="1注文・税込" />
              <PriceRow name="自分で塗り足しを付けるツール" price="0円" unit="登録なし" />
            </dl>
            <ButtonLink href={internalHref('/print/')} size="lg" className="mt-6 w-full sm:w-auto">
              {PRINT_HELP.name}を見る
              <ArrowRight size={18} aria-hidden="true" />
            </ButtonLink>
          </div>
        </section>

        {/* 入口 2：QRコード変換（印刷の仕事をしている方向け） */}
        <section
          aria-labelledby="door-qr"
          className="mt-12 grid gap-6 border-t-2 border-ink pt-8 md:mt-16 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-12 md:pt-10"
        >
          <a
            href={internalHref('/qr/')}
            aria-hidden="true"
            tabIndex={-1}
            className="block self-start bg-sumi-50 p-5 sm:p-8"
          >
            <span className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-4">
              <span className="block">
                <span className="block border border-sumi-300 bg-paper p-1.5">
                  <QrLowRes
                    content={SAMPLE_QR_CONTENT}
                    pixelsPerModule={1.5}
                    className="block h-auto w-full"
                    alt=""
                  />
                </span>
                <span className="mt-2 block text-center text-xs font-bold text-shu">
                  支給されたまま
                </span>
              </span>
              <ArrowRight size={18} className="mb-6 text-sumi-500" />
              <span className="block">
                <span className="block border border-sumi-300 bg-paper p-1.5">
                  <QrVector
                    content={SAMPLE_QR_CONTENT}
                    quietZone={2}
                    className="block h-auto w-full"
                  />
                </span>
                <span className="mt-2 block text-center text-xs font-bold text-ink">
                  印刷用のPDF
                </span>
              </span>
            </span>
          </a>
          <div>
            <p className="text-xs text-sumi-600">印刷会社・DTP・デザイナーの方へ</p>
            <h2
              id="door-qr"
              className="mt-2 text-xl font-bold tracking-japanese text-ink md:text-2xl"
            >
              {SITE.serviceName}
            </h2>
            <p className="mt-4 text-sm leading-7 text-sumi-600">
              小さくてぼやけたQRコードを、印刷でくっきり出るデータ（K100のベクターPDF）に変えます。画像を置くだけで、登録は要りません。
            </p>
            <dl className="mt-5 border-t border-sumi-200">
              <PriceRow name="変換ツール（1件ずつ）" price="0円" unit="登録なし" />
              <PriceRow name={AGENCY.name} price={AGENCY.price} unit="1件・税込" />
              <PriceRow name={BULK.name} price={`${BULK.priceSmall}から`} unit="税込" />
            </dl>
            <ButtonLink
              href={internalHref('/qr/')}
              size="lg"
              variant="secondary"
              className="mt-6 w-full sm:w-auto"
            >
              QRコードを変換する
              <ArrowRight size={18} aria-hidden="true" />
            </ButtonLink>
          </div>
        </section>

        {/* どちらか分からない人のための出口 */}
        <section
          aria-labelledby="ask-heading"
          className="mt-12 border-t border-sumi-200 pt-8 md:mt-16 md:flex md:items-end md:justify-between md:gap-10 md:pt-10"
        >
          <div className="max-w-xl">
            <h2 id="ask-heading" className="text-base font-bold tracking-japanese text-ink">
              どちらか分からないときは、メールでどうぞ
            </h2>
            <p className="mt-3 text-sm leading-7 text-sumi-600">
              「これは頼めるのか」だけのご相談でもかまいません。ご相談は無料です。
            </p>
            <p className="mt-4 text-xs leading-6 text-sumi-500">
              運営：{BUSINESS.company}（名古屋市中区大須）
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:text-right">
            <ButtonLink href={MAIL_HREF} variant="secondary" size="lg" className="w-full sm:w-auto">
              <Mail size={18} aria-hidden="true" />
              メールで相談する
            </ButtonLink>
            <p className="mt-3 break-all font-mono text-sm text-ink">{SITE.contactEmail}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
