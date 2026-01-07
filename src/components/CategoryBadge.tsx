// みえるん簿 - カテゴリバッジコンポーネント

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, borderRadius, spacing, fontSizes } from '../theme';
import { CategoryType, DEFAULT_CATEGORIES } from '../types';

interface CategoryBadgeProps {
  category: CategoryType;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  size = 'md',
  showLabel = true,
}) => {
  const categoryInfo = DEFAULT_CATEGORIES.find((c) => c.type === category);
  const categoryColor = colors.categories[category] || colors.categories.other;

  const sizeStyles = {
    sm: { iconSize: 16, padding: spacing.xs },
    md: { iconSize: 24, padding: spacing.sm },
    lg: { iconSize: 32, padding: spacing.md },
  };

  const currentSize = sizeStyles[size];

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: categoryColor,
            padding: currentSize.padding,
          },
        ]}
      >
        <Text style={{ fontSize: currentSize.iconSize }}>
          {categoryInfo?.icon || '📝'}
        </Text>
      </View>
      {showLabel && (
        <Text style={[styles.label, size === 'sm' && styles.labelSmall]}>
          {categoryInfo?.name || 'その他'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconContainer: {
    borderRadius: borderRadius.md,
  },
  label: {
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  labelSmall: {
    fontSize: fontSizes.sm,
  },
});
