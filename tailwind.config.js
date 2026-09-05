/**
 * ココデザイン 印刷用QRコード変換ツール
 * デザイントークンの定義。意図は DESIGN.md を参照してください。
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    // 角丸は控えめに固定する（装飾より情報設計を優先するため）
    borderRadius: {
      none: '0',
      sm: '2px',
      DEFAULT: '2px',
      md: '3px',
      lg: '4px',
      full: '9999px',
    },
    extend: {
      colors: {
        // 基調
        paper: '#FFFFFF',
        ink: '#111111', // 本文（K100 に近い黒）
        k100: '#000000', // QR の黒。印刷での K100 を意味する
        // グレースケール
        sumi: {
          50: '#FAFAF9',
          100: '#F4F4F2',
          200: '#E9E9E5',
          300: '#D8D8D3',
          400: '#ACACA6',
          500: '#6E6E69',
          600: '#57574F',
          700: '#3A3A35',
        },
        // 補助色（面積は最小限に使う）
        shu: '#B4482F', // 落ち着いた朱色：注意・強調
        aomidori: '#2C6B62', // 青緑：確認済み・成功
        kinari: '#F2E7BE', // 淡い黄：補足のハイライト
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Hiragino Kaku Gothic ProN"',
          '"Hiragino Sans"',
          '"Noto Sans JP"',
          '"BIZ UDPGothic"',
          '"Yu Gothic Medium"',
          '"Yu Gothic"',
          'Meiryo',
          'system-ui',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Consolas',
          '"Courier New"',
          'monospace',
        ],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1.5' }],
      },
      letterSpacing: {
        japanese: '0.02em',
      },
      maxWidth: {
        content: '68rem',
      },
      boxShadow: {
        // 影は「浮き」ではなく「面の境界」を示す目的だけに使う
        edge: '0 1px 0 0 #E9E9E5',
        panel: '0 1px 2px 0 rgba(17,17,17,0.06)',
      },
      keyframes: {
        'module-in': {
          '0%': { opacity: '0', transform: 'scale(0.6)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'bar-move': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(300%)' },
        },
        // v2：粗い画像の上を、鮮明なベクターが左から右へ置き換えていく
        'wipe-in': {
          '0%': { clipPath: 'inset(0 100% 0 0)' },
          '100%': { clipPath: 'inset(0 0 0 0)' },
        },
        'scan-line': {
          '0%': { left: '0%', opacity: '1' },
          '85%': { opacity: '1' },
          '100%': { left: '100%', opacity: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'rise-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'module-in': 'module-in 240ms ease-out both',
        'bar-move': 'bar-move 1.1s linear infinite',
        'wipe-in': 'wipe-in 1.3s cubic-bezier(0.4, 0, 0.2, 1) 200ms both',
        'scan-line': 'scan-line 1.3s cubic-bezier(0.4, 0, 0.2, 1) 200ms both',
        'fade-in': 'fade-in 360ms ease-out both',
        'rise-in': 'rise-in 360ms ease-out both',
      },
    },
  },
  plugins: [],
};
