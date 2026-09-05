import type { ReactNode } from 'react';

interface SectionProps {
  id?: string;
  /** 通し番号。デザインの骨格を可視化するために使います */
  index?: string;
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  children: ReactNode;
  /** 背景をわずかに沈める（区切りのためだけに使用） */
  tinted?: boolean;
  className?: string;
}

export function Section({
  id,
  index,
  eyebrow,
  title,
  lead,
  children,
  tinted = false,
  className = '',
}: SectionProps) {
  const headingId = id ? `${id}-heading` : undefined;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={`${tinted ? 'bg-sumi-50' : 'bg-paper'} border-t border-sumi-200 ${className}`}
    >
      <div className="mx-auto w-full max-w-content px-5 py-16 sm:px-8 md:py-24">
        <div className="max-w-2xl">
          {(index || eyebrow) && (
            <p className="mb-3 flex items-center gap-3 font-mono text-2xs tracking-widest text-sumi-500">
              {index && <span aria-hidden="true">{index}</span>}
              {index && eyebrow && <span aria-hidden="true" className="h-px w-6 bg-sumi-300" />}
              {eyebrow && <span>{eyebrow}</span>}
            </p>
          )}
          <h2
            id={headingId}
            className="text-2xl font-bold leading-snug tracking-japanese text-ink md:text-3xl"
          >
            {title}
          </h2>
          {lead && <p className="mt-4 text-sm leading-7 text-sumi-600 md:text-base">{lead}</p>}
        </div>
        <div className="mt-10 md:mt-14">{children}</div>
      </div>
    </section>
  );
}
