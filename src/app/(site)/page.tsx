import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';

import { CutFigure } from '@/components/print/BleedExample';
import { ButtonLink } from '@/components/ui/Button';
import { ConsultBox } from '@/components/ui/ConsultBox';
import {
  absoluteUrl,
  internalHref,
  PRINT_HELP,
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
 * 困りごとの入口（2026-11-24 近藤さん「ニーズを中心にしたサイト構成」）。
 * 検索の多い言葉（塗り足し・Canva で印刷・プリントパック 入稿）から並べています。
 * 材料：観音通テラス/ココデザイン係/検索キーワード_20261124.md
 */
const NEEDS = [
  {
    who: '印刷会社から言われた',
    title: '「塗り足しが足りません」と言われた',
    body: '塗り足しとは何か、どの大きさで作ればいいかを早見表で。',
    href: '/print/nuritashi/',
  },
  {
    who: 'Canva・Word・AI で作った',
    title: '作ったチラシを、印刷に出したい',
    body: 'アプリごとの塗り足しの付け方と、無料で3mm足せるツール。',
    href: '/print/nuritashi/#how',
  },
  {
    who: 'プリントパックに出す',
    title: 'PDFの入稿で止まった',
    body: '「データ不備」になりやすい6つのところを、公式ガイドをもとに。',
    href: '/print/printpac/',
  },
  {
    who: 'チラシや名刺に入れる',
    title: '印刷用のQRコードを作りたい',
    body: 'URLや画像から、印刷でくっきり出るQRコード（K100のPDF）を無料で。データに入れる作業も承ります。',
    href: '/qr/',
  },
] as const;

function NeedCard({ who, title, body, href }: (typeof NEEDS)[number]) {
  return (
    <a
      href={internalHref(href)}
      className="group flex h-full flex-col border border-sumi-300 bg-paper p-5 transition-colors hover:border-ink hover:bg-sumi-50"
    >
      <span className="text-sm text-sumi-600">{who}</span>
      <span className="mt-1 text-lg font-bold leading-snug tracking-japanese text-ink">{title}</span>
      <span className="mt-2 text-sm leading-7 text-sumi-700">{body}</span>
      <span className="mt-auto flex items-center gap-1.5 pt-3 text-sm font-bold text-ink">
        <span className="underline underline-offset-4">読む</span>
        <ArrowRight size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
      </span>
    </a>
  );
}

/**
 * トップページ。まず困りごとの4つ、その下に「こちらで直す（有料）」と相談。主役は「ネット印刷おたすけ」です。
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
          チラシや名刺を、ネット印刷に出したい方へ。どれで困っているかを選んでください。
        </p>

        {/* 困りごとの入口。検索から来た人が、自分の言葉で選べるように */}
        <nav aria-label="困りごとから選ぶ" className="mt-8 md:mt-10">
          <ul className="grid gap-3 sm:grid-cols-2">
            {NEEDS.map((need) => (
              <li key={need.href}>
                <NeedCard {...need} />
              </li>
            ))}
          </ul>
        </nav>

        {/* こちらで直す（有料）：ネット印刷おたすけ。困りごとの入口で解決しなかった人の行き先 */}
        <section
          aria-labelledby="door-print"
          className="mt-12 grid gap-x-12 gap-y-5 border-t-2 border-ink pt-6 md:mt-16 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:pt-10"
        >
          <div className="md:col-start-2 md:row-start-1">
            <p className="text-sm text-sumi-600">自分で直せないときは、こちらで直します</p>
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

        {/* どちらか分からない人のための出口。誰が返事をするかも、ここにまとめる */}
        <section
          aria-labelledby="ask-heading"
          className="mt-12 grid gap-5 border-t border-sumi-300 pt-6 md:mt-16 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-12 md:pt-8"
        >
          <div>
            <h2 id="ask-heading" className="text-lg font-bold tracking-japanese text-ink">
              どれにも当てはまらないときは、メールでどうぞ
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
