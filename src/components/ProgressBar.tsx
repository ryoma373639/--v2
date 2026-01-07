// みえるん簿 - プログレスバーコンポーネント

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, borderRadius, spacing, fontSizes } from '../theme';

interface ProgressBarProps {
  progress: number; // 0-100
  color?: string;
  backgroundColor?: string;
  height?: number;
  showLabel?: boolean;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = colors.primary,
  backgroundColor = colors.backgroundSecondary,
  height = 8,
  showLabel = false,
  label,
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const isOverBudget = progress > 100;
  const barColor = isOverBudget ? colors.error : color;

  return (
    <View style={styles.container}>
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          <Text
            style={[
              styles.percentage,
              isOverBudget && styles.percentageOver,
            ]}
          >
            {Math.round(progress)}%
          </Text>
        </View>
      )}
      <View
        style={[
          styles.track,
          { backgroundColor, height, borderRadius: height / 2 },
        ]}
      >
        <View
          style={[
            styles.fill,
            {
              backgroundColor: barColor,
              width: `${clampedProgress}%`,
              height,
              borderRadius: height / 2,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  percentage: {
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  percentageOver: {
    color: colors.error,
  },
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
