import { Droplet, Layers, ScanLine } from 'lucide-react';

import { Section } from '@/components/ui/Section';
import { FEATURES } from '@/lib/content/sections';

const ICONS = {
  scan: ScanLine,
  droplet: Droplet,
  layers: Layers,
} as const;

export function Features() {
  return (
    <Section
      id="features"
      index="04"
      eyebrow="FEATURES"
      title="特長"
      lead="機能を増やすより、印刷データとして正しいことを優先しています。"
    >
      <ul className="grid gap-px border border-sumi-200 bg-sumi-200 md:grid-cols-3">
        {FEATURES.map((feature) => {
          const Icon = ICONS[feature.icon];
          return (
            <li key={feature.no} className="bg-paper p-6 md:p-7">
              <div className="flex items-center justify-between">
                <Icon size={22} aria-hidden="true" className="text-ink" />
                <span className="spec-label">{feature.no}</span>
              </div>
              <h3 className="mt-5 text-base font-bold tracking-japanese text-ink md:text-lg">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-sumi-600">{feature.body}</p>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
