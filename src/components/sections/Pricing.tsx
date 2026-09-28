import { Check } from 'lucide-react';

import { ButtonLink } from '@/components/ui/Button';
import { Section } from '@/components/ui/Section';
import { PRICING_PLANS } from '@/lib/content/sections';
import { internalHref } from '@/lib/content/site';

export function Pricing() {
  return (
    <Section
      id="pricing"
      index="08"
      eyebrow="PRICING"
      title="料金"
      lead="無料の変換は登録なしでそのままお使いいただけます。本ツールで扱えない支給データの変換代行と、CSVからの一括作成を有料でお受けします。"
    >
      <ul className="grid gap-px border border-sumi-200 bg-sumi-200 md:grid-cols-3">
        {PRICING_PLANS.map((plan) => (
          <li
            key={plan.name}
            className={`flex flex-col bg-paper p-6 md:p-7 ${plan.emphasis ? 'border-t-2 border-t-ink' : ''}`}
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-bold tracking-japanese text-ink">{plan.name}</h3>
              <span
                className={`shrink-0 border px-2 py-0.5 font-mono text-2xs ${
                  plan.emphasis
                    ? 'border-aomidori text-aomidori'
                    : 'border-sumi-300 text-sumi-500'
                }`}
              >
                {plan.status}
              </span>
            </div>

            <p className="mt-5 text-2xl font-bold tracking-japanese text-ink">{plan.price}</p>
            <p className="mt-1 text-2xs text-sumi-500">{plan.priceNote}</p>

            <ul className="mt-6 flex-1 space-y-2.5 border-t border-sumi-200 pt-5">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-2 text-sm leading-6 text-sumi-600">
                  <Check size={14} aria-hidden="true" className="mt-1.5 shrink-0 text-sumi-400" />
                  {feature}
                </li>
              ))}
            </ul>

            <ButtonLink
              href={plan.emphasis ? '#qr' : internalHref('/contact/')}
              variant={plan.emphasis ? 'primary' : 'secondary'}
              className="mt-6 w-full"
            >
              {plan.ctaLabel}
            </ButtonLink>
          </li>
        ))}
      </ul>

      <div className="mt-6 space-y-2 border border-sumi-200 bg-kinari/40 px-4 py-3 text-2xs leading-5 text-sumi-600">
        <p>
          有料の2つは、先に内容を確認して、お受けできるかをお返しします。
          お受けできる場合にかぎり、お支払いのご案内をお送りします。
          変換代行で読み取れずに納品できない場合は、お支払いいただいた全額をお返しします。
        </p>
        <p>
          支払方法・納品時期・キャンセルの条件は
          <a
            href={internalHref('/tokushoho/')}
            className="text-ink underline underline-offset-4"
          >
            特定商取引法に基づく表記
          </a>
          に記載しています。
        </p>
      </div>
    </Section>
  );
}
