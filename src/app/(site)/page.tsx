import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';

import { CutFigure } from '@/components/print/BleedExample';
import { ButtonLink } from '@/components/ui/Button';
import { ConsultBox } from '@/components/ui/ConsultBox';
import { QrLowRes, QrVector } from '@/components/ui/QrArtwork';
import {
  absoluteUrl,
  internalHref,
  PRINT_HELP,
  SAMPLE_QR_CONTENT,
  SITE,
} from '@/lib/content/site';

export const metadata: Metadata = {
  alternates: { canonical: absoluteUrl('/') },
};

/** 値段の1行。品名は左、値段は右に揃える（お品書きの形） */
function PriceRow({ name, price, unit }: { name: string; price: string; unit: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-sumi-200 py-2.5">
      <dt className="text-base text-ink">{name}</dt>
      <dd className="shrink-0 text-right">
        <span className="text-lg font-bold text-ink">{price}</span>
        <span className="ml-2 text-xs text-sumi-600">{unit}</span>
      </dd>
    </div>
  );
}

/**
 * トップページ。入口を2つ置きます。主役は「ネット印刷おたすけ」です。
 *
 * 2026-11-24 まではここが QRコード変換そのものでした（いまは /qr/）。
 * 一般の方向けの「ネット印刷おたすけ」を始めて、1ページに相手が2人いる状態になったため、
 * トップは「何をしている所か」と「どちらへ進むか」だけを見せる入口に変えています。
 *
 * - おたすけ：絵・説明・値段・ボタンをしっかり出す
 * - QRコード変換：プロ向けの短い案内（小さな絵・無料・ボタン）。有料の値段は /qr/ に任せる
 * - スマホでは、サービス名を絵より先に出す（絵のあとに名前が来ると、何の絵か分からないため）
 */
export default function HomePage() {
  return (
    <div className="border-t border-sumi-200 bg-paper">
      <div className="mx-auto w-full max-w-5xl px-5 pb-16 pt-10 sm:px-8 md:pb-24 md:pt-16">
        <h1 className="text-2xl font-bold leading-snug tracking-japanese text-ink md:text-4xl md:leading-snug">
          <span className="inline-block">印刷に出すデータの、</span>
          <span className="inline-block">困ったところを直します。</span>
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-sumi-700">
          チラシや名刺をネット印刷に出す方と、仕事でQRコードを印刷物に入れる方へ。
        </p>

        {/* 入口 1（主役）：ネット印刷おたすけ。一般の方向け */}
        <section
          aria-labelledby="door-print"
          className="mt-8 grid gap-x-12 gap-y-5 border-t-2 border-ink pt-6 md:mt-12 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:pt-10"
        >
          <div className="md:col-start-2 md:row-start-1">
            <p className="text-sm text-sumi-600">チラシや名刺を、ネット印刷に出す方へ</p>
            <h2
              id="door-print"
              className="mt-1 text-2xl font-bold tracking-japanese text-ink md:text-3xl"
            >
              {PRINT_HELP.name}
            </h2>
            <p className="mt-3 text-base leading-8 text-sumi-700">
              「塗り足しが足りません」「データに不備があります」と言われて止まったら、足りないところを直して、印刷会社へ送れる形にしてお返しします。
            </p>
          </div>

          <a
            href={internalHref('/print/')}
            aria-hidden="true"
            tabIndex={-1}
            className="block self-start bg-sumi-50 px-4 pb-4 pt-1 sm:px-6 md:col-start-1 md:row-span-2 md:row-start-1"
          >
            <span className="mx-auto grid max-w-[20rem] grid-cols-2 gap-2 md:max-w-none">
              <span className="block">
                <CutFigure id="door-nobleed" bleed={false} />
                <span className="block text-center text-sm font-bold text-shu">ふちに白いすじ</span>
              </span>
              <span className="block">
                <CutFigure id="door-bleed" bleed />
                <span className="block text-center text-sm font-bold text-ink">
                  ふちまで色が付く
                </span>
              </span>
            </span>
          </a>

          <div className="md:col-start-2 md:row-start-2">
            <dl className="border-t border-sumi-200">
              <PriceRow name={PRINT_HELP.bleedName} price={PRINT_HELP.bleedPrice} unit="1面・税込" />
              <PriceRow name={PRINT_HELP.orderName} price={PRINT_HELP.orderPrice} unit="1注文・税込" />
              <PriceRow name="自分で塗り足しを付けるツール" price="0円" unit="登録なし" />
            </dl>
            <ButtonLink href={internalHref('/print/')} size="lg" className="mt-5 w-full sm:w-auto">
              {PRINT_HELP.name}を見る
              <ArrowRight size={18} aria-hidden="true" />
            </ButtonLink>
          </div>
        </section>

        {/* 入口 2（短く）：QRコード変換。印刷の仕事をしている方向け。有料の値段は /qr/ に任せる */}
        <section
          aria-labelledby="door-qr"
          className="mt-12 grid items-center gap-x-8 gap-y-4 border-t border-sumi-300 pt-6 md:mt-16 md:grid-cols-[auto_minmax(0,1fr)_auto] md:pt-8"
        >
          <div className="md:col-start-2 md:row-start-1">
            <p className="text-sm text-sumi-600">印刷会社・DTP・デザイナーの方へ</p>
            <h2 id="door-qr" className="mt-1 text-lg font-bold tracking-japanese text-ink md:text-xl">
              {SITE.serviceName}
            </h2>
            <p className="mt-2 text-sm leading-7 text-sumi-700">
              小さくてぼやけたQRコードを、印刷でくっきり出るPDF（K100のベクター）に変えます。無料・登録なし。
            </p>
          </div>

          <a
            href={internalHref('/qr/')}
            aria-hidden="true"
            tabIndex={-1}
            className="flex w-fit items-center gap-2.5 bg-sumi-50 p-3 md:col-start-1 md:row-start-1"
          >
            <span className="block w-16 border border-sumi-300 bg-paper p-1">
              <QrLowRes
                content={SAMPLE_QR_CONTENT}
                pixelsPerModule={1.5}
                className="block h-auto w-full"
                alt=""
              />
            </span>
            <ArrowRight size={16} className="shrink-0 text-sumi-500" />
            <span className="block w-16 border border-sumi-300 bg-paper p-1">
              <QrVector content={SAMPLE_QR_CONTENT} quietZone={2} className="block h-auto w-full" />
            </span>
          </a>

          <ButtonLink
            href={internalHref('/qr/')}
            variant="secondary"
            className="w-full sm:w-auto md:col-start-3 md:row-start-1"
          >
            QRコードを変換する
            <ArrowRight size={16} aria-hidden="true" />
          </ButtonLink>
        </section>

        {/* どちらか分からない人のための出口。誰が返事をするかも、ここにまとめる */}
        <section
          aria-labelledby="ask-heading"
          className="mt-12 grid gap-5 border-t border-sumi-300 pt-6 md:mt-16 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-12 md:pt-8"
        >
          <div>
            <h2 id="ask-heading" className="text-lg font-bold tracking-japanese text-ink">
              どちらか分からないときは、メールでどうぞ
            </h2>
            <p className="mt-3 text-base leading-8 text-sumi-700">
              データと、何に困っているかを送ってください。頼めることかどうかから、お返事します。
            </p>
          </div>
          <ConsultBox subject="ココデザインへの相談" />
        </section>
      </div>
    </div>
  );
}
