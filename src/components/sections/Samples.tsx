import { Check } from 'lucide-react';

import { Section } from '@/components/ui/Section';
import { QrLowRes, QrVector } from '@/components/ui/QrArtwork';
import { encodeQr } from '@/lib/qr/encoder';
import { toModuleRuns } from '@/lib/qr/render';

const SAMPLE_CONTENT = 'https://cocodesign.jp/shop/menu?table=12';

export function Samples() {
  // 表示する数値はすべて実際のサンプルQRから算出しています
  const matrix = encodeQr(SAMPLE_CONTENT, 'M');
  const pathCount = toModuleRuns(matrix).length;

  const checks = [
    { label: 'QR内容一致', detail: '変換前後で同じURLを指しています' },
    { label: 'ドット配置比較', detail: `${matrix.size} × ${matrix.size} セルの並びを維持` },
    { label: 'K100確認', detail: 'PDFの黒は CMYK 0 / 0 / 0 / 100' },
    { label: 'ベクター確認', detail: `矩形パス ${pathCount} 個 / 画像は不使用` },
  ];

  return (
    <Section
      index="07"
      eyebrow="SAMPLE"
      title="変換例"
      lead="同じ内容を指したまま、印刷用データとして扱える形に置き換えます。"
      tinted
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr_minmax(0,20rem)] lg:gap-px lg:border lg:border-sumi-200 lg:bg-sumi-200">
        {/* Before */}
        <figure className="border border-sumi-200 bg-paper p-5 lg:border-0">
          <figcaption className="mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-medium text-sumi-500">
              <span aria-hidden="true" className="h-1.5 w-1.5 bg-sumi-400" />
              Before
            </span>
            <span className="spec-label">JPG / RGB</span>
          </figcaption>
          <div className="mx-auto max-w-[15rem] border border-sumi-200 bg-sumi-50 p-3">
            <QrLowRes
              content={SAMPLE_CONTENT}
              pixelsPerModule={1.5}
              className="h-auto w-full"
              alt="変換前：低解像度のQRコード"
            />
          </div>
          <dl className="mt-4 space-y-1 font-mono text-2xs">
            <div className="flex justify-between gap-2 border-b border-sumi-200 pb-1">
              <dt className="text-sumi-500">形式</dt>
              <dd className="text-ink">ラスター（JPG）</dd>
            </div>
            <div className="flex justify-between gap-2 border-b border-sumi-200 pb-1">
              <dt className="text-sumi-500">カラー</dt>
              <dd className="text-ink">RGB</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-sumi-500">輪郭</dt>
              <dd className="text-ink">にじみあり</dd>
            </div>
          </dl>
        </figure>

        {/* After */}
        <figure className="border border-sumi-200 bg-paper p-5 lg:border-0">
          <figcaption className="mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-medium text-ink">
              <span aria-hidden="true" className="h-1.5 w-1.5 bg-shu" />
              After
            </span>
            <span className="spec-label">PDF / K100</span>
          </figcaption>
          <div className="mx-auto max-w-[15rem] border border-sumi-200 bg-paper p-3">
            <QrVector
              content={SAMPLE_CONTENT}
              quietZone={0}
              className="h-auto w-full"
              title="変換後：K100ベクターのQRコード（読み取り可能なサンプル）"
            />
          </div>
          <dl className="mt-4 space-y-1 font-mono text-2xs">
            <div className="flex justify-between gap-2 border-b border-sumi-200 pb-1">
              <dt className="text-sumi-500">形式</dt>
              <dd className="text-ink">ベクター（PDF / SVG）</dd>
            </div>
            <div className="flex justify-between gap-2 border-b border-sumi-200 pb-1">
              <dt className="text-sumi-500">カラー</dt>
              <dd className="text-ink">K100</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-sumi-500">輪郭</dt>
              <dd className="text-ink">セル境界で直角</dd>
            </div>
          </dl>
        </figure>

        {/* チェック項目 */}
        <div className="border border-sumi-200 bg-paper p-5 lg:border-0">
          <p className="spec-label mb-4">チェック項目</p>
          <ul className="space-y-4">
            {checks.map((item) => (
              <li key={item.label} className="flex gap-2.5">
                <Check size={15} aria-hidden="true" className="mt-0.5 shrink-0 text-aomidori" />
                <div>
                  <p className="text-sm font-medium text-ink">{item.label}</p>
                  <p className="mt-0.5 text-2xs leading-5 text-sumi-500">{item.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mt-6 text-2xs leading-5 text-sumi-500">
        元画像の状態によっては完全に再現できない場合があります。変換後は必ず内容を確認し、印刷前にテストしてください。
      </p>
    </Section>
  );
}
