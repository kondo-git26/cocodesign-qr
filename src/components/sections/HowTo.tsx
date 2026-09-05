import { Download, Search, SlidersHorizontal, Upload } from 'lucide-react';

import { Section } from '@/components/ui/Section';
import { STEPS } from '@/lib/content/sections';

const ICONS = {
  upload: Upload,
  search: Search,
  sliders: SlidersHorizontal,
  download: Download,
} as const;

export function HowTo() {
  return (
    <Section
      id="howto"
      index="06"
      eyebrow="HOW TO USE"
      title="使い方"
      lead="4ステップで終わります。説明を読まなくても操作できることを目指しています。"
    >
      <ol className="grid gap-px border border-sumi-200 bg-sumi-200 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step) => {
          const Icon = ICONS[step.icon];
          return (
            <li key={step.no} className="relative bg-paper p-6">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-2xl font-bold leading-none text-ink">
                  {step.no}
                </span>
                <span aria-hidden="true" className="h-px flex-1 bg-sumi-200" />
                <Icon size={18} aria-hidden="true" className="text-sumi-400" />
              </div>
              <h3 className="mt-5 text-sm font-bold tracking-japanese text-ink">{step.title}</h3>
              <p className="mt-2 text-2xs leading-5 text-sumi-500">{step.body}</p>
            </li>
          );
        })}
      </ol>

      <p className="mt-6 text-2xs leading-5 text-sumi-500">
        変換後は必ず内容を確認してください。印刷前のテストをおすすめします。
      </p>
    </Section>
  );
}
