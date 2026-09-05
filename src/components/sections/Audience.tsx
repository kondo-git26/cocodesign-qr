import { Section } from '@/components/ui/Section';
import { AUDIENCE } from '@/lib/content/sections';

export function Audience() {
  return (
    <Section
      index="09"
      eyebrow="FOR"
      title="対象ユーザー"
      lead="日本語DTPと印刷実務の現場を前提に設計しています。"
      tinted
    >
      <ul className="grid gap-px border border-sumi-200 bg-sumi-200 sm:grid-cols-2 lg:grid-cols-4">
        {AUDIENCE.map((item) => (
          <li key={item.title} className="bg-paper p-6">
            <h3 className="text-sm font-bold tracking-japanese text-ink">{item.title}</h3>
            <p className="mt-2 text-2xs leading-5 text-sumi-500">{item.body}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
