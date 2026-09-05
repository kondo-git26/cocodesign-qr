# ココデザイン｜印刷用QRコード変換

低解像度・RGBのQRコード画像を、印刷実務で使える **K100 のベクターデータ（PDF / SVG）** へ変換するサービスのWebサイトです。
印刷会社・DTPオペレーター・デザイナーを対象にしています。

- ページタイトル：印刷用QRコード変換｜K100ベクターPDF・SVG生成
- 技術構成：Next.js（App Router）/ TypeScript / Tailwind CSS / 静的書き出し
- デザインの意図：[DESIGN.md](./DESIGN.md)

---

## 1. ローカルでの起動手順

Node.js 18.18 以上（推奨 20 以上）が必要です。

```bash
npm install
```

```bash
npm run dev
```

起動後 <http://localhost:3000> を開きます。

### そのほかのコマンド

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発サーバーを起動 |
| `npm run build` | 本番ビルド。`out/` に静的ファイルを書き出します |
| `npm run start` | ビルド結果をローカルで確認（`next start`） |
| `npm run typecheck` | TypeScript の型チェックのみ実行 |

`next.config.mjs` で `output: 'export'` を指定しているため、`npm run build` の成果物 `out/` は
そのまま任意の静的ホスティングへ置けます。

---

## 2. 公開先

| URL | 内容 |
| --- | --- |
| **<https://kondo-git26.github.io/cocodesign-qr/>** | 現行版 |
| **<https://kondo-git26.github.io/cocodesign-qr/v2/>** | 試作 v2（ファーストビューと変換を一体化。`noindex`） |

GitHub Pages（リポジトリ <https://github.com/kondo-git26/cocodesign-qr>）で公開しています。
`main` にソース、`gh-pages` にビルド済みサイトを置く構成です。

### 更新のしかた

サブディレクトリ配信のため、ビルド時に `NEXT_PUBLIC_BASE_PATH` が必要です。

```bash
NEXT_PUBLIC_BASE_PATH=/cocodesign-qr NEXT_PUBLIC_SITE_URL=https://kondo-git26.github.io/cocodesign-qr npm run build
```

そのうえで `out/` の中身を `gh-pages` ブランチへ push します（`.nojekyll` を必ず含めること。
これが無いと `_next/` ディレクトリが Jekyll に無視されて CSS・JS が 404 になります）。

### ルート直下で公開する場合

独自ドメインや Netlify などルート直下で公開するときは `NEXT_PUBLIC_BASE_PATH` を付けずにビルドします。
`basePath` が空になり、内部リンクもそのまま動きます。

> **Netlify について**：以前 <https://cocodesign-qr.netlify.app/> でも公開していましたが、
> 無料プランのクレジットを使い切ったため本番デプロイが停止しています。
> 設定（`netlify.toml`）は残してあるので、クレジット回復後はそのまま使えます。

---

## 3. Vercelでの公開手順

### A. GitHub連携で公開する

1. このディレクトリをGitリポジトリとしてGitHubへプッシュします。
2. [Vercel](https://vercel.com/new) でリポジトリをインポートします。
3. 設定はすべて自動検出されます（Framework: Next.js）。変更は不要です。
4. Environment Variables に `NEXT_PUBLIC_SITE_URL`（公開URL）を追加します。OGPやcanonicalの絶対URLに使われます。
5. **Deploy** を押します。以降は `main` ブランチへのプッシュで自動デプロイされます。

### B. CLIで公開する

```bash
npx vercel --prod
```

---

## 4. 使用している依存関係

必要最小限に絞っています。UIライブラリは使っていません。

### 本番依存

| パッケージ | 用途 |
| --- | --- |
| `next` | フレームワーク（App Router / 静的書き出し） |
| `react` / `react-dom` | UI |
| `lucide-react` | アイコン。使用分だけがバンドルされます |
| `jsqr` | 画像からのQR **読み取り**（位置検出とデコード）。依存ゼロ・MIT |

### 開発依存

| パッケージ | 用途 |
| --- | --- |
| `typescript` | 型 |
| `@types/node` / `@types/react` / `@types/react-dom` | 型定義 |
| `tailwindcss` | スタイル |
| `postcss` / `autoprefixer` | Tailwind のビルド |

**QRコードの生成は自前実装**です（`src/lib/qr/encoder.ts`）。読み取りだけ jsQR に任せ、
「元のドット配置をそのまま取り出す」処理はこちらで実装しています（後述）。
日本語フォントはシステムフォントのみで、Webフォントは読み込みません。

---

## 5. 動作の中身（何が本物で、何がまだか）

**変換に関わる処理はすべてブラウザ内で完結**します。画像がサーバーへ送られることはありません。

### 本物として動いているもの

| 機能 | 実装場所 |
| --- | --- |
| 画像からのQR読み取り（位置検出・デコード） | `src/lib/qr/decode.ts`（jsQR） |
| **元のドット配置の復元**（後述） | `src/lib/qr/decode.ts` |
| QR生成（数字・英数字・バイトモード / 型番1〜15 / 誤り訂正 L・M・Q・H） | `src/lib/qr/encoder.ts` |
| **PDF出力（K100 = DeviceCMYK 0/0/0/100 のベクター）** | `src/lib/qr/render.ts` |
| SVG出力 / PNG出力（600dpi相当） | `src/lib/qr/render.ts` |
| 内容一致チェック（出力配置を描き直して再読み取りし、内容を照合） | `src/lib/convert/localApi.ts` |
| 変換前ビジュアル（元画像からシンボル部分だけを射影補正で切り出し） | `src/lib/qr/decode.ts` `cropSymbol` |

### まだ対応していないもの

| 機能 | 現状 |
| --- | --- |
| PDFファイルの入力 | 未対応。QR部分をJPG/PNGに書き出してもらうメッセージを出します |
| 一括変換（100枚単位） | 未実装。料金セクションで「検討中」と表示 |
| 登録・ログイン（SVG/PNGの取り出し、履歴） | 未実装。v2 では「登録後に受け取れます」と表示のみ |
| 型番16以上（81セル角以上）の元配置復元 | 読み取りはできますが、配置の確定は行わず再生成になります |

### 「元のドット配置を維持」の実現方法

支給QRを再生成すると、マスクや誤り訂正レベルが変わってドットの並びが変わります。これを避けるため：

1. jsQR で読み取り、シンボル四隅の座標と型番を得る
2. 四隅から射影変換を求め、元画像の各セル中心の輝度を直接サンプリングして二値化する
3. 読み取った内容を「モード × 誤り訂正レベル × マスク」の全候補（最大96通り）で再エンコードし、
   サンプリング結果に最も近い候補を探す
4. 十分近い候補があれば、それが元の配置そのもの（誤差ゼロ）として採用する。
   低解像度でサンプリングに数セルの誤りがあっても、正しい候補との距離は小さく、
   誤った候補との距離は大きいため、明確に区別できます
5. 候補が見つからなければ、サンプリング結果そのもの（近似）か、内容からの再生成に切り替え、
   画面の「ドット配置」ラベルでその違いを示します

検証：1.3〜6px/セルの低解像度・JPEG劣化・回転・ぼかしを含む192枚のテスト画像で、
読み取れた168枚すべてについて「最も近い候補 = 真の配置」となり、誤判定は0件でした。

---

## 6. 本物のQR変換APIへの差し替え方

画面側は `ConverterApi` インターフェースにしか依存していません。

```
src/lib/convert/
├── types.ts     … インターフェースと型（画面が依存するのはここだけ）
├── localApi.ts  … 既定。ブラウザ内で完結する実装
├── httpApi.ts   … サーバーAPIを呼ぶ実装
└── index.ts     … 環境変数を見てどちらかを返す
```

サーバー処理（PDF入力、一括変換、履歴など）が必要になったら、環境変数を設定するだけで切り替わります。
**画面側のコード変更は不要です。**

```bash
NEXT_PUBLIC_CONVERT_API_BASE=https://api.example.com/qr
```

#### `POST {base}/analyze`

- リクエスト：`multipart/form-data`、フィールド名 `file`
- レスポンス：`AnalyzeResult`（JSON）

```jsonc
{
  "content": "https://example.com/",
  "imageWidth": 240,
  "imageHeight": 240,
  "pxPerModule": 3.4,             // 元画像でのセルあたり画素数
  "cells": 29,
  "version": 3,
  "ecc": "M",                      // 確定できなければ null
  "preservation": "exact",         // exact | approximate | none
  "mismatchCells": 2,
  "sourceModules": [[true, false, ...], ...],   // 元配置。none なら null
  "symbolPreview": "data:image/png;base64,...", // 変換前ビジュアル。省略可
  "notes": []
}
```

#### `POST {base}/convert`

- リクエスト：`application/json`、ボディは `ConvertOptions`（`source` に元配置を含む）
- レスポンス：変換済みファイルのバイナリ

| ヘッダ | 内容 |
| --- | --- |
| `Content-Type` | `application/pdf` / `image/svg+xml` / `image/png` |
| `Content-Disposition` | `attachment; filename="..."` |
| `X-Qr-Modules` | モジュール配置（`0101...` を1行ずつ、改行区切り）※省略可 |
| `X-Qr-Version` / `X-Qr-Ecc` | 型番・誤り訂正レベル |
| `X-Qr-Dots-Preserved` | `true` / `false` |
| `X-Qr-Content-Verified` | `true` / `false`（未実施なら送らない） |
| `X-Qr-Checks` | `CheckItem[]` をJSON文字列化したもの |

---

## 7. ディレクトリ構成

```
src/
├── app/
│   ├── layout.tsx            … メタデータ（title / description / OGP）、html/body
│   ├── (site)/               … 現行版：Header + Footer 付きレイアウト
│   │   ├── page.tsx          … トップ（/）
│   │   ├── contact/ terms/ privacy/
│   │   └── layout.tsx
│   ├── (v2)/v2/              … 試作 v2：最小ヘッダーのレイアウト（/v2/）
│   ├── globals.css / icon.svg / robots.ts / sitemap.ts
├── components/
│   ├── layout/               … Header（モバイルメニュー）、Footer
│   ├── sections/             … 現行版の各セクション（v2 でも FV 以下で再利用）
│   ├── converter/            … 現行版の変換フォームの部品
│   ├── v2/                   … v2 のファーストビュー
│   │   ├── DropStage.tsx     … 状態管理（置く / 貼る / 打つ → 読み取り → 受け取る）
│   │   ├── Stage.tsx         … 置く場所であり結果が現れる場所（ワイプ演出）
│   │   ├── ContentLine.tsx   … 「QRの中身」の1行（表示 兼 入力）
│   │   ├── ResultActions.tsx … ラベル・受け取るボタン・詳細
│   │   ├── V2Header.tsx / sampleFile.ts
│   └── ui/                   … Section / Button / QR描画 / ページ共通枠
└── lib/
    ├── qr/                   … encoder / decode / render / png
    ├── convert/              … 変換サービスの境界（local / http）
    └── content/              … 文言データ
```

文言はすべて `src/lib/content/` と各コンポーネント内の定数に集めています。

---

## 8. アクセシビリティ・パフォーマンスについて

- 「本文へスキップ」リンクを設置
- FAQ・詳細は `details` / `summary`（JavaScriptなしで開閉、キーボード対応）
- v2 のドロップ領域は、外枠ではなく中の本物の `<button>` で操作します（外枠を `role="button"` にすると
  中の画像やエラー文が支援技術から読めなくなるため）。状態変化は `aria-live` で通知します
- ボタン・フォーム部品に `aria-label` / `aria-describedby` / `role="alert"` を設定
- フォーカスリングを明示（朱色・2px）、`prefers-reduced-motion` に対応
- 文字色は白地で 4.5:1 以上を確保（`sumi-500` = #6E6E69 で 5.13:1）
- 小さなテキストリンクもタップ領域を 44px 以上に確保
- Webフォントを読み込まない（日本語はシステムフォント）
- ヒーローのQRはビルド時に生成した静的SVG・PNG。QR読み取りのライブラリ（約50KB）はクライアント側のみ

---

## 9. 注意事項（表現方針）

このサイトでは、次の表現を使いません。

> 完全再現／100％保証／必ず読み取れる／どんな画像でも変換可能／世界初／AIがすべて自動で解決

代わりに次の表現を使っています。

> できるだけ維持／元画像の状態によります／変換後に必ず確認してください／印刷前にテストしてください

料金についても「予定」「検討中」と明記し、確定した価格として表示していません。
