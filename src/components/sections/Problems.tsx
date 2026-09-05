import { ArrowRight } from 'lucide-react';

import { Section } from '@/components/ui/Section';
import { PROBLEMS } from '@/lib/content/sections';

export function Problems() {
  return (
    <Section
      index="05"
      eyebrow="PROBLEMS"
      title="よくある困りごと"
      lead="現場で実際に起きていることと、それに対する当サービスの答えです。"
      tinted
    >
      <div className="border border-sumi-200 bg-paper">
        <div
          aria-hidden="true"
          className="hidden grid-cols-[1fr_auto_1fr] border-b border-sumi-200 md:grid"
        >
          <p className="spec-label px-5 py-2.5">問題</p>
          <span className="w-10" />
          <p className="spec-label px-5 py-2.5">解決</p>
        </div>

        <ul className="divide-y divide-sumi-200">
          {PROBLEMS.map((item) => (
            <li
              key={item.problem}
              className="grid gap-3 p-5 md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-0 md:p-0"
            >
              <p className="text-sm leading-6 text-sumi-600 md:px-5 md:py-5">{item.problem}</p>

              <span
                aria-hidden="true"
                className="flex w-10 items-center justify-center text-sumi-400 max-md:hidden"
              >
                <ArrowRight size={16} />
              </span>

              <div className="md:border-l md:border-sumi-200 md:px-5 md:py-5">
                <p className="flex items-center gap-2 text-sm font-bold tracking-japanese text-ink">
                  <span aria-hidden="true" className="h-1.5 w-1.5 bg-shu md:hidden" />
                  {item.solution}
                </p>
                <p className="mt-1 text-2xs leading-5 text-sumi-500">{item.solutionNote}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
