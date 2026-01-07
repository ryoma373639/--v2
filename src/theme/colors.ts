// みえるん簿 - パステルカラーテーマ
// 白地ベース + パステルアクセント

export const colors = {
  // ベースカラー
  background: '#FFFFFF',
  backgroundSecondary: '#F8F9FA',
  surface: '#FFFFFF',

  // テキストカラー
  textPrimary: '#2D3436',
  textSecondary: '#636E72',
  textLight: '#B2BEC3',

  // パステルプライマリ（ミントグリーン）
  primary: '#A8E6CF',
  primaryLight: '#DCEDC1',
  primaryDark: '#88D4AB',

  // パステルセカンダリ（ラベンダー）
  secondary: '#DDA0DD',
  secondaryLight: '#E8D5E8',
  secondaryDark: '#C78DC7',

  // パステルアクセント
  accent: '#FFB7B2', // コーラルピンク
  accentLight: '#FFDAC1',

  // カテゴリカラー（パステル）
  categories: {
    food: '#FFB7B2',        // 食費 - コーラルピンク
    transport: '#A8E6CF',   // 交通費 - ミントグリーン
    utilities: '#87CEEB',   // 光熱費 - スカイブルー
    entertainment: '#DDA0DD', // 娯楽 - ラベンダー
    shopping: '#FFDAC1',    // 買い物 - ピーチ
    subscription: '#B5EAD7', // サブスク - セージグリーン
    communication: '#C7CEEA', // 通信費 - パーウィンクル
    health: '#E2F0CB',      // 医療 - ライムグリーン
    other: '#F0E6EF',       // その他 - ライトピンク
  },

  // ステータスカラー
  success: '#A8E6CF',
  warning: '#FFE066',
  error: '#FF8A80',
  info: '#87CEEB',

  // UI要素
  border: '#E9ECEF',
  divider: '#F1F3F4',
  shadow: 'rgba(0, 0, 0, 0.08)',
  overlay: 'rgba(0, 0, 0, 0.5)',

  // グラデーション用
  gradients: {
    primary: ['#A8E6CF', '#DCEDC1'],
    secondary: ['#DDA0DD', '#E8D5E8'],
    accent: ['#FFB7B2', '#FFDAC1'],
  },
};

export type CategoryColor = keyof typeof colors.categories;
