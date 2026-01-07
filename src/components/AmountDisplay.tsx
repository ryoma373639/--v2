// みえるん簿 - 金額表示コンポーネント

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../theme';

interface AmountDisplayProps {
  amount: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  showSign?: boolean;
  prefix?: string;
  suffix?: string;
}

export const AmountDisplay: React.FC<AmountDisplayProps> = ({
  amount,
  size = 'md',
  color,
  showSign = false,
  prefix = '¥',
  suffix,
}) => {
  const formattedAmount = Math.abs(amount).toLocaleString('ja-JP');
  const isNegative = amount < 0;
  const sign = showSign ? (isNegative ? '-' : '+') : '';

  const sizeStyles = {
    sm: { fontSize: 14, fontWeight: '500' as const },
    md: { fontSize: 18, fontWeight: '600' as const },
    lg: { fontSize: 24, fontWeight: '700' as const },
    xl: { fontSize: 36, fontWeight: '700' as const },
  };

  const textColor = color || (isNegative ? colors.error : colors.textPrimary);

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.amount,
          sizeStyles[size],
          { color: textColor },
        ]}
      >
        {sign}
        {prefix}
        {formattedAmount}
        {suffix}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  amount: {
    fontVariant: ['tabular-nums'],
  },
});
