/** 各セクションの本文データ。文言はここに集約しています。 */

export interface FeatureItem {
  no: string;
  title: string;
  body: string;
  icon: 'scan' | 'droplet' | 'layers';
}

export const FEATURES: FeatureItem[] = [
  {
    no: '01',
    title: '低解像度QR対応',
    body: '小さく粗い支給QR画像を解析し、正方形セル単位で再構築します。にじんだ輪郭をなぞるのではなく、モジュールの並びとして読み直します。',
    icon: 'scan',
  },
  {
    no: '02',
    title: 'K100で安心',
    body: '印刷時の版ズレや見当ズレを避けるため、QRの黒をK100で出力します。4色すべてが乗った黒に比べ、細い白地の抜けが安定します。',
    icon: 'droplet',
  },
  {
    no: '03',
    title: 'Illustrator実務にそのまま',
    body: 'PDF・SVGとして配置、編集、再利用しやすい形式で出力します。矩形パスだけで構成しているため、拡大・縮小しても輪郭が崩れません。',
    icon: 'layers',
  },
];

export interface ProblemItem {
  problem: string;
  solution: string;
  solutionNote: string;
}

export const PROBLEMS: ProblemItem[] = [
  {
    problem: '支給されたQRが小さい',
    solution: 'QR専用解析',
    solutionNote: 'QRの構造を前提に読み直すため、一般的な画像トレースより輪郭が安定します。',
  },
  {
    problem: 'RGB画像のまま渡される',
    solution: 'K100変換',
    solutionNote: 'PDFの黒をCMYK 0 / 0 / 0 / 100で書き出します。',
  },
  {
    problem: 'Illustratorの画像トレースが面倒',
    solution: 'ベクター出力',
    solutionNote: 'アップロードして形式を選ぶだけ。パス数も最小限にまとめます。',
  },
  {
    problem: '再生成するとドット配置が変わる',
    solution: 'ドット配置をできるだけ維持',
    solutionNote: '読み取れたモジュール配置をそのまま正方形として書き出します。',
  },
  {
    problem: '100枚のQRを一括で処理したい',
    solution: '一括変換プラン',
    solutionNote: 'CSV・ZIPでまとめて投入し、ファイル名を保ったまま書き出す想定で準備中です。',
  },
];

export interface StepItem {
  no: string;
  title: string;
  body: string;
  icon: 'upload' | 'search' | 'sliders' | 'download';
}

export const STEPS: StepItem[] = [
  {
    no: '1',
    title: 'QR画像をアップロード',
    body: 'JPG・PNG・PDFに対応。ドラッグ&ドロップでもファイル選択でも構いません。',
    icon: 'upload',
  },
  {
    no: '2',
    title: '自動解析',
    body: '読み取り内容とセル数を表示します。違っていればその場で直せます。',
    icon: 'search',
  },
  {
    no: '3',
    title: '出力形式を選択',
    body: 'PDF・SVG・PNGと仕上がりサイズ、K100の有無を選びます。',
    icon: 'sliders',
  },
  {
    no: '4',
    title: 'ダウンロード',
    body: 'そのままIllustratorに配置できます。印刷前に必ず実データでテストしてください。',
    icon: 'download',
  },
];

export interface PricingPlan {
  name: string;
  price: string;
  priceNote: string;
  status: string;
  emphasis: boolean;
  features: string[];
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    name: '無料',
    price: '0円',
    priceNote: '登録不要',
    status: '公開中',
    emphasis: true,
    features: ['1件ずつ変換', '名刺サイズ程度まで', 'PDF / SVG / PNG', '履歴保存なし'],
  },
  {
    name: '一括変換',
    price: '準備中',
    priceNote: '料金未定',
    status: '検討中',
    emphasis: false,
    features: ['100枚単位', 'CSVまたはZIPアップロード', 'ファイル名維持', 'ZIP一括ダウンロード'],
  },
  {
    name: 'プロ向け',
    price: '月額3,000円程度',
    priceNote: '予定・正式決定ではありません',
    status: '検討中',
    emphasis: false,
    features: ['大きなサイズ', '一括処理', '履歴保存', '再ダウンロード', '内容比較', '優先サポート'],
  },
];

export const AUDIENCE = [
  { title: '印刷会社', body: '支給データの手直し時間を減らし、入稿前の確認を短くします。' },
  { title: 'DTPオペレーター', body: '画像トレースやパス整形の手作業を挟まずに配置できます。' },
  { title: 'デザイナー', body: 'ラフの段階から実寸のQRを置いて、余白設計を詰められます。' },
  { title: '販促担当者', body: 'POPやチラシ用のQRを、印刷所に渡せる形で用意できます。' },
];

export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQS: FaqItem[] = [
  {
    question: 'K100とは何ですか',
    answer:
      'CMYK印刷で、黒（K）だけを100%使って表現する黒のことです。シアン・マゼンタ・イエローを使わないため版ズレの影響を受けにくく、QRのような細かい白黒のパターンでは輪郭が安定します。当サービスのPDF出力は、この K100（CMYK 0 / 0 / 0 / 100）を既定にしています。',
  },
  {
    question: 'RGBのQRでは問題がありますか',
    answer:
      'RGBは画面用の色の指定方法です。印刷用データに変換する際、RGBの黒はCMYKの4色すべてが混ざった黒（リッチブラック）に変換されることがあり、版ズレが出ると細部がにじみます。またRGB画像のままだと入稿時に印刷所から差し戻しになる場合があります。',
  },
  {
    question: '元のドット配置を完全に維持できますか',
    answer:
      '完全な維持をお約束することはできません。元画像の解像度、圧縮によるノイズ、印刷物のスキャンかどうかによって、読み取れる精度は変わります。当サービスは読み取れたモジュール（QRを構成する正方形のセル）の配置をできるだけそのまま書き出す方針ですが、元画像の状態によります。変換後は必ず内容を確認し、印刷前に実データでテストしてください。',
  },
  {
    question: 'Illustratorで編集できますか',
    answer:
      'できます。PDF・SVGはいずれもベクター（拡大しても輪郭が保たれるデータ形式）で、矩形のパスだけで構成しています。Illustratorで開く、または配置してリンク画像として扱う、どちらの運用にも対応します。パスは行単位でまとめているため、アンカーポイントの数も抑えられます。',
  },
  {
    question: '低解像度でも必ず変換できますか',
    answer:
      '必ず変換できるとは言えません。極端に小さい画像、強い圧縮ノイズ、印刷網点が出ているスキャン画像などでは、モジュールの境界が判別できないことがあります。解析結果の画面に読み取り内容を表示しますので、違っている場合はその場で修正して出力できます。',
  },
  {
    question: 'QRコードの内容も確認できますか',
    answer:
      '確認できます。解析後に読み取り内容を画面に表示し、変換時には出力データを再度エンコードしてモジュール配置が一致するかを照合します（内容一致チェック）。ただし最終的な読み取りは、実際に印刷したものをスマートフォンで確認してください。',
  },
  {
    question: '100枚まとめて変換できますか',
    answer:
      '一括変換は準備中です。CSVまたはZIPでまとめてアップロードし、ファイル名を保ったままZIPで受け取れる形を想定しています。料金を含めて検討中のため、必要な運用があればお問い合わせからお知らせください。',
  },
  {
    question: 'アップロードしたデータは保存されますか',
    answer:
      '現在のバージョンは、読み取りから変換までをすべてブラウザ内で行っており、画像がサーバーへ送信されることはありません。今後サーバー処理を導入する際は、変換後に一定時間で自動削除する運用とし、内容を本ページとプライバシーポリシーに明記します。',
  },
];
