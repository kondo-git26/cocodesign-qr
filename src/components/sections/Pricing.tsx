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
      lead="まず無料で試せます。有料プランは内容と価格を検討中で、正式決定ではありません。"
    >
      <ul className="grid gap-px border border-sumi-200 bg-sumi-200 md:grid-cols-3">
        {PRICING_PLANS.map((plan) => (
          <li
            key={plan.name}
            className={`flex flex-col bg-paper p-6 md:p-7 ${plan.emphasis ? 'border-t-2 border-t-ink' : ''}`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold tracking-japanese text-ink">{plan.name}</h3>
              <span
                className={`border px-2 py-0.5 font-mono text-2xs ${
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

            {plan.emphasis ? (
              <ButtonLink href="#convert" variant="primary" className="mt-6 w-full">
                無料で試す
              </ButtonLink>
            ) : (
              <ButtonLink href={internalHref('/contact/')} variant="secondary" className="mt-6 w-full">
                要望を伝える
              </ButtonLink>
            )}
          </li>
        ))}
      </ul>

      <p className="mt-6 border border-sumi-200 bg-kinari/40 px-4 py-3 text-2xs leading-5 text-sumi-600">
        記載の料金はいずれも予定・検討中の内容です。正式決定ではありません。
        必要な運用（枚数、サイズ、納品形式など）があればお問い合わせからお知らせください。
      </p>
    </Section>
  );
}
