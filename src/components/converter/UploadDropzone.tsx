'use client';

import { FileUp, X } from 'lucide-react';
import { useId, useState, type DragEvent } from 'react';

import {
  ACCEPTED_EXTENSIONS,
  ACCEPTED_MIME_TYPES,
  MAX_UPLOAD_BYTES,
} from '@/lib/convert';

interface UploadDropzoneProps {
  file: File | null;
  onSelect: (file: File) => void;
  onClear: () => void;
  onReject: (message: string) => void;
  disabled?: boolean;
}

function isAccepted(file: File): boolean {
  if ((ACCEPTED_MIME_TYPES as readonly string[]).includes(file.type)) return true;
  const lower = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((extension) => lower.endsWith(extension));
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function UploadDropzone({
  file,
  onSelect,
  onClear,
  onReject,
  disabled = false,
}: UploadDropzoneProps) {
  const inputId = useId();
  const [dragging, setDragging] = useState(false);

  const accept = (candidate: File | undefined) => {
    if (!candidate) return;
    if (!isAccepted(candidate)) {
      onReject('JPG・PNG・PDFのいずれかを選択してください。');
      return;
    }
    if (candidate.size > MAX_UPLOAD_BYTES) {
      onReject('ファイルサイズが10MBを超えています。');
      return;
    }
    onSelect(candidate);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (disabled) return;
    accept(event.dataTransfer.files[0]);
  };

  if (file) {
    return (
      <div className="flex items-center justify-between gap-4 border border-sumi-300 bg-sumi-50 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">{file.name}</p>
          <p className="mt-0.5 font-mono text-2xs text-sumi-500">
            {formatBytes(file.size)} / {file.type || '形式不明'}
          </p>
        </div>
        <button
          type="button"
          onClick={onClear}
          disabled={disabled}
          aria-label="選択したファイルを取り消す"
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-sm border border-sumi-300 bg-paper px-3 text-xs text-sumi-600 transition-colors hover:border-ink hover:text-ink disabled:opacity-40"
        >
          <X size={14} aria-hidden="true" />
          取り消す
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={[
        'relative border border-dashed px-6 py-10 text-center transition-colors sm:py-14',
        dragging ? 'border-shu bg-kinari/30' : 'border-sumi-300 bg-sumi-50',
        disabled ? 'opacity-50' : '',
      ].join(' ')}
    >
      <FileUp size={28} aria-hidden="true" className="mx-auto text-sumi-400" />
      <p className="mt-4 text-base font-medium text-ink">QR画像をここにドロップ</p>
      <p className="mt-1 text-sm text-sumi-500">または</p>

      <label
        htmlFor={inputId}
        className="mt-3 inline-flex h-11 cursor-pointer items-center rounded-sm border border-ink bg-ink px-5 text-sm font-medium text-paper transition-colors hover:bg-sumi-700"
      >
        ファイルを選択
      </label>
      <input
        id={inputId}
        type="file"
        accept={[...ACCEPTED_MIME_TYPES, ...ACCEPTED_EXTENSIONS].join(',')}
        disabled={disabled}
        aria-label="変換するQR画像ファイル"
        className="sr-only"
        onChange={(event) => {
          accept(event.target.files?.[0]);
          // 同じファイルを選び直せるようにする
          event.target.value = '';
        }}
      />

      <p className="mt-4 font-mono text-2xs text-sumi-500">JPG / PNG / PDF対応・10MBまで</p>
    </div>
  );
}
