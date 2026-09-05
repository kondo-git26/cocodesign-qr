import { Plus } from 'lucide-react';

import { Section } from '@/components/ui/Section';
import { FAQS } from '@/lib/content/sections';

/**
 * アコーディオンは details / summary で実装しています。
 * JavaScript なしで開閉でき、キーボード操作とスクリーンリーダーに標準で対応します。
 */
export function Faq() {
  return (
    <Section
      id="faq"
      index="10"
      eyebrow="FAQ"
      title="よくある質問"
      lead="専門用語はそのまま使い、意味を短く添えています。"
    >
      <div className="border-t border-sumi-200">
        {FAQS.map((faq, index) => (
          <details key={faq.question} className="group border-b border-sumi-200">
            <summary className="flex items-start gap-4 py-5 pr-2 transition-colors hover:bg-sumi-50">
              <span className="mt-0.5 font-mono text-2xs text-sumi-400">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="flex-1 text-sm font-medium leading-6 text-ink md:text-[0.9375rem]">
                {faq.question}
              </span>
              <Plus
                size={16}
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-sumi-400 transition-transform duration-200 group-open:rotate-45"
              />
            </summary>
            <div className="pb-6 pl-10 pr-2">
              <p className="text-sm leading-7 text-sumi-600">{faq.answer}</p>
            </div>
          </details>
        ))}
      </div>
    </Section>
  );
}
