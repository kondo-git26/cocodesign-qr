/**
 * サブディレクトリ公開（GitHub Pages のプロジェクトページなど）に対応するため、
 * NEXT_PUBLIC_BASE_PATH が設定されていれば basePath として使います。
 * ルート直下で公開する場合（Netlify など）は未設定のままにします。
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 静的書き出し（out/ ディレクトリ）。Vercel / Netlify / GitHub Pages でそのまま公開できます。
  output: 'export',
  // 静的書き出しでは next/image の最適化サーバーが使えないため無効化します。
  images: { unoptimized: true },
  // 静的ホスティング全般で URL が安定します。
  trailingSlash: true,
  reactStrictMode: true,
  ...(basePath ? { basePath } : {}),
};

export default nextConfig;
