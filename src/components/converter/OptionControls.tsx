'use client';

import { useId } from 'react';

import {
  ECC_LABELS,
  OUTPUT_FORMAT_LABELS,
  type EccLevel,
  type OutputFormat,
} from '@/lib/convert';

/* ------------------------------------------------------------------ */
/* 出力形式                                                             */
/* ------------------------------------------------------------------ */

const FORMATS: OutputFormat[] = ['pdf', 'svg', 'png'];

export function FormatSelect({
  value,
  onChange,
  disabled,
}: {
  value: OutputFormat;
  onChange: (value: OutputFormat) => void;
  disabled?: boolean;
}) {
  const name = useId();

  return (
    <fieldset disabled={disabled}>
      <legend className="spec-label mb-2">出力形式</legend>
      <div className="grid grid-cols-3 gap-2">
        {FORMATS.map((format) => {
          const selected = value === format;
          return (
            <label
              key={format}
              className={[
                'flex cursor-pointer flex-col rounded-sm border px-3 py-2.5 transition-colors',
                selected
                  ? 'border-ink bg-ink text-paper'
                  : 'border-sumi-300 bg-paper text-ink hover:border-sumi-400',
                disabled ? 'cursor-not-allowed opacity-50' : '',
              ].join(' ')}
            >
              <input
                type="radio"
                name={name}
                value={format}
                checked={selected}
                onChange={() => onChange(format)}
                className="sr-only"
              />
              <span className="font-mono text-sm font-medium">
                {OUTPUT_FORMAT_LABELS[format].label}
              </span>
              <span
                className={`mt-0.5 text-2xs leading-4 ${selected ? 'text-sumi-200' : 'text-sumi-500'}`}
              >
                {OUTPUT_FORMAT_LABELS[format].note}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/* ------------------------------------------------------------------ */
/* トグル                                                               */
/* ------------------------------------------------------------------ */

export function ToggleRow({
  label,
  note,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  note: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  const id = useId();

  return (
    <div className="flex items-start gap-3 border-b border-sumi-200 py-3 last:border-b-0">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-black"
      />
      <label htmlFor={id} className="min-w-0 cursor-pointer">
        <span className="block text-sm font-medium text-ink">{label}</span>
        <span className="mt-0.5 block text-2xs leading-5 text-sumi-500">{note}</span>
      </label>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* サイズ・誤り訂正レベル                                                 */
/* ------------------------------------------------------------------ */

const SIZE_OPTIONS = [15, 20, 25, 30];
const ECC_OPTIONS: EccLevel[] = ['L', 'M', 'Q', 'H'];

const SELECT_CLASS =
  'h-10 w-full rounded-sm border border-sumi-300 bg-paper px-3 text-sm text-ink transition-colors ' +
  'hover:border-sumi-400 disabled:cursor-not-allowed disabled:opacity-50';

export function SizeSelect({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="spec-label mb-2 block">
        仕上がりサイズ
      </label>
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        className={SELECT_CLASS}
      >
        {SIZE_OPTIONS.map((size) => (
          <option key={size} value={size}>
            {size}mm 角
          </option>
        ))}
      </select>
      <p className="mt-1.5 text-2xs leading-5 text-sumi-500">
        無料プランは30mm角（名刺サイズ程度）までです。
      </p>
    </div>
  );
}

export function EccSelect({
  value,
  onChange,
  disabled,
}: {
  value: EccLevel;
  onChange: (value: EccLevel) => void;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="spec-label mb-2 block">
        誤り訂正レベル
      </label>
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value as EccLevel)}
        className={SELECT_CLASS}
      >
        {ECC_OPTIONS.map((level) => (
          <option key={level} value={level}>
            {ECC_LABELS[level]}
          </option>
        ))}
      </select>
      <p className="mt-1.5 text-2xs leading-5 text-sumi-500">
        汚れや欠けにどこまで耐えるかの指定です。印刷物はMまたはQを推奨します。
      </p>
    </div>
  );
}
