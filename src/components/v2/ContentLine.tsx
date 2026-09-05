'use client';

import type { RefObject } from 'react';

/**
 * 「QR の中身」を表す 1 行。
 * 画像を置けば読み取った内容が入り、直接 URL やテキストを入れれば QR が生成される。
 * 読み取り結果の確認欄と入力欄を分けない、というのがこの行の役割です。
 */
export function ContentLine({
  value,
  onChange,
  inputRef,
  disabled,
  invalid,
}: {
  value: string;
  onChange: (value: string) => void;
  inputRef: RefObject<HTMLInputElement | null>;
  disabled?: boolean;
  invalid?: boolean;
}) {
  return (
    <div>
      <label htmlFor="v2-content" className="sr-only">
        QRの内容（URLまたはテキスト）
      </label>
      <input
        id="v2-content"
        ref={inputRef}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="https://"
        maxLength={500}
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        className={[
          'h-12 w-full rounded-none border-0 border-b bg-transparent px-0 font-mono text-base text-ink',
          'placeholder:text-sumi-500 focus:outline-none focus:ring-0 disabled:opacity-50 md:text-lg',
          invalid ? 'border-shu' : 'border-sumi-300 focus:border-ink',
        ].join(' ')}
      />
    </div>
  );
}
