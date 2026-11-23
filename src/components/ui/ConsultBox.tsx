import { Mail } from 'lucide-react';

import { ButtonLink } from '@/components/ui/Button';
import { BUSINESS, SITE } from '@/lib/content/site';

/**
 * 相談の入口。ボタンのすぐそばに「相談するとどうなるか」と「誰が返事をするか」をまとめます。
 * （2026-11-24：材料がページのあちこちに散らばっていたため、ここに寄せた）
 * 書いてある約束は、特定商取引法に基づく表記と同じ内容です。変えるときは両方を直します。
 */
export function ConsultBox({ subject, className = '' }: { subject: string; className?: string }) {
  const href = `mailto:${SITE.contactEmail}?subject=${encodeURIComponent(subject)}`;
  return (
    <div className={`border border-sumi-300 bg-sumi-50 p-5 sm:p-6 ${className}`}>
      <ButtonLink href={href} size="lg" className="w-full sm:w-auto">
        <Mail size={18} aria-hidden="true" />
        メールで相談する
      </ButtonLink>
      <p className="mt-3 break-all font-mono text-sm text-ink">{SITE.contactEmail}</p>
      <ul className="mt-4 space-y-1.5 border-t border-sumi-300 pt-4 text-sm leading-7 text-sumi-700">
        <li>ご相談は無料です。「これは頼めるのか」だけでもかまいません。</li>
        <li>お受けできるかどうかと金額を、原則1営業日以内にお返事します。</li>
        <li>作業は、金額をお伝えしたあとです。お受けできないときは、費用はかかりません。</li>
      </ul>
      <p className="mt-4 text-sm leading-7 text-sumi-600">
        お返事するのは、{BUSINESS.company}（名古屋市中区大須）です。ふだんは、ガイドブックやリーフレットの印刷データを作っています。
      </p>
    </div>
  );
}
