/**
 * 「塗り足し」が何かを、絵で見せる見本（ビフォー・アフター）。
 * 左＝塗り足しなし／右＝塗り足し3mmあり。上が入稿データ、下が刃が少しずれて切られたあと。
 * 分かりやすくするため、塗り足しの幅と刃のずれは実際より太く描いています。
 * チラシの中身は架空のものです。
 */

const W = 100; // 仕上がりの幅（絵の中の単位）
const H = 140; // 仕上がりの高さ
const BLEED = 9; // 塗り足しの幅（太めに描く）
const SHIFT = 5; // 刃のずれ（太めに描く）
const PAD = 16; // 図のまわりの余白

const BG = '#1D5C70';
const ACCENT = '#F2C14E';
const TRIM = '#B4482F'; // サイトの朱色（仕上がり線）

/** 架空のチラシ。bleed が true なら、背景を仕上がりの外まで伸ばす */
function Flyer({ id, bleed }: { id: string; bleed: boolean }) {
  const b = bleed ? BLEED : 0;
  const clipId = `${id}-art`;
  return (
    <g>
      <defs>
        <clipPath id={clipId}>
          <rect x={-b} y={-b} width={W + b * 2} height={H + b * 2} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect x={-b} y={-b} width={W + b * 2} height={H + b * 2} fill={BG} />
        <circle cx={86} cy={18} r={30} fill={ACCENT} />
        <rect x={-b} y={112} width={W + b * 2} height={H - 112 + b} fill="#123F4E" />
      </g>
      <g fill="#FFFFFF" fontWeight={700}>
        <text x={12} y={62} fontSize={15}>
          まちかど
        </text>
        <text x={12} y={81} fontSize={15}>
          マルシェ
        </text>
        <text x={12} y={98} fontSize={6.5} fontWeight={400}>
          12.7 日曜 10:00〜15:00
        </text>
        <text x={12} y={128} fontSize={6} fontWeight={400}>
          雨天決行・入場無料
        </text>
      </g>
    </g>
  );
}

/** 入稿データの図。朱色の点線が仕上がり線（ここで切る） */
function DataFigure({ id, bleed }: { id: string; bleed: boolean }) {
  return (
    <svg
      viewBox={`${-PAD} ${-PAD} ${W + PAD * 2} ${H + PAD * 2}`}
      className="h-auto w-full"
      role="img"
      aria-label={bleed ? '仕上がり線の外まで背景が伸びている入稿データ' : '仕上がり線ちょうどで背景が終わっている入稿データ'}
    >
      <Flyer id={id} bleed={bleed} />
      <rect
        x={0}
        y={0}
        width={W}
        height={H}
        fill="none"
        stroke={TRIM}
        strokeWidth={1.2}
        strokeDasharray="4 3"
      />
    </svg>
  );
}

/** 切ったあとの図。刃が右下へ少しずれて切られた場合 */
function CutFigure({ id, bleed }: { id: string; bleed: boolean }) {
  const clipId = `${id}-paper`;
  return (
    <svg
      viewBox={`${-PAD} ${-PAD} ${W + PAD * 2} ${H + PAD * 2}`}
      className="h-auto w-full"
      role="img"
      aria-label={bleed ? '切ったあと、ふちまで色が付いている' : '切ったあと、右と下のふちに白いすじが出ている'}
    >
      <defs>
        <clipPath id={clipId}>
          <rect x={0} y={0} width={W} height={H} />
        </clipPath>
      </defs>
      <rect x={1.5} y={1.5} width={W} height={H} fill="#000000" opacity={0.08} />
      <rect x={0} y={0} width={W} height={H} fill="#FFFFFF" />
      <g clipPath={`url(#${clipId})`}>
        <g transform={`translate(${SHIFT} ${SHIFT})`}>
          <Flyer id={`${id}-in`} bleed={bleed} />
        </g>
      </g>
      <rect x={0} y={0} width={W} height={H} fill="none" stroke="#9A9A9A" strokeWidth={0.6} />
      {!bleed && (
        <g fill="none" stroke={TRIM} strokeWidth={1.4}>
          <rect x={-2} y={-2} width={SHIFT + 4} height={H + 4} rx={2} />
          <rect x={-2} y={-2} width={W + 4} height={SHIFT + 4} rx={2} />
        </g>
      )}
    </svg>
  );
}

const COLUMNS = [
  {
    id: 'nobleed',
    bleed: false,
    title: '塗り足しなし',
    data: '背景が、切るところ（点線）でちょうど終わっています。',
    cut: '刃が少しずれただけで、ふちに白いすじが出ます。',
    tone: 'text-shu',
    verdict: '白いすじが出る',
  },
  {
    id: 'bleed',
    bleed: true,
    title: '塗り足し3mmあり',
    data: '背景を、切るところより3mm外まで伸ばしてあります。',
    cut: '刃が少しずれても、ふちまで色が付いたままです。',
    tone: 'text-ink',
    verdict: 'きれいに仕上がる',
  },
];

export function BleedExample() {
  return (
    <figure>
      <div className="grid gap-px border border-sumi-300 bg-sumi-300 sm:grid-cols-2">
        {COLUMNS.map((col) => (
          <div key={col.id} className="bg-paper p-5 sm:p-6">
            <p className="text-sm font-bold tracking-japanese text-ink">{col.title}</p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="spec-label">入稿データ</p>
                <div className="mt-2 bg-sumi-50">
                  <DataFigure id={`${col.id}-data`} bleed={col.bleed} />
                </div>
                <p className="mt-2 text-xs leading-6 text-sumi-600">{col.data}</p>
              </div>
              <div>
                <p className="spec-label">切ったあと</p>
                <div className="mt-2 bg-sumi-50">
                  <CutFigure id={`${col.id}-cut`} bleed={col.bleed} />
                </div>
                <p className="mt-2 text-xs leading-6 text-sumi-600">{col.cut}</p>
              </div>
            </div>
            <p className={`mt-4 text-sm font-bold ${col.tone}`}>→ {col.verdict}</p>
          </div>
        ))}
      </div>
      <figcaption className="mt-3 text-xs leading-6 text-sumi-500">
        朱色の点線が、印刷会社が紙を切るところです。分かりやすくするため、塗り足しの幅と刃のずれは実際より太く描いています。
      </figcaption>
    </figure>
  );
}
