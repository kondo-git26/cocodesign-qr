const TERMS: Array<{ term: string; note: string }> = [
  { term: 'K100', note: 'CMYKの黒（K）だけ100%で刷る黒。版ズレに強い' },
  { term: 'CMYK', note: '印刷で使う4色。シアン・マゼンタ・イエロー・黒' },
  { term: 'RGB', note: '画面用の色指定。印刷にはそのまま使えない' },
  { term: 'ベクター', note: '点と線で形を持つデータ。拡大しても輪郭が保たれる' },
  { term: 'PDF', note: '印刷入稿の標準形式。CMYK指定を保持できる' },
  { term: 'SVG', note: 'Web標準のベクター形式。CMYK指定は持てない' },
  { term: 'PNG', note: '画素の集まり（ラスター）。確認・校正向き' },
  { term: 'Illustrator', note: 'DTPで使う作図ソフト。PDF・SVGを直接扱える' },
  { term: 'ドット配置', note: 'QRを構成する正方形セルの並び。変えると内容が変わる' },
  { term: 'リンク画像', note: '配置したファイルを外部参照する方式。差し替えが利く' },
  { term: '印刷用データ', note: '印刷所に渡せる状態のデータ。CMYK・解像度・書式が整ったもの' },
];

/** 用語は隠さずそのまま使い、意味を一行で添えるための一覧 */
export function Glossary() {
  return (
    <section aria-labelledby="glossary-heading" className="border-t border-sumi-200 bg-paper">
      <div className="mx-auto w-full max-w-content px-5 py-10 sm:px-8 md:py-12">
        <h2 id="glossary-heading" className="spec-label mb-5">
          このページで使う言葉
        </h2>
        <dl className="grid gap-x-8 gap-y-0 sm:grid-cols-2 lg:grid-cols-3">
          {TERMS.map((item) => (
            <div key={item.term} className="flex gap-3 border-b border-sumi-200 py-2.5">
              <dt className="w-[5.5rem] shrink-0 font-mono text-xs font-medium text-ink">
                {item.term}
              </dt>
              <dd className="min-w-0 text-2xs leading-5 text-sumi-500">{item.note}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
