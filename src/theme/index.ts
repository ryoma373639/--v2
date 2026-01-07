// みえるん簿 - テーマエクスポート

export { colors, type CategoryColor } from './colors';
export { fonts, fontSizes, fontWeights, lineHeights, typography } from './typography';
export { spacing, borderRadius, shadows } from './spacing';

export const theme = {
  colors: require('./colors').colors,
  typography: require('./typography').typography,
  spacing: require('./spacing').spacing,
  borderRadius: require('./spacing').borderRadius,
  shadows: require('./spacing').shadows,
};

export default theme;
