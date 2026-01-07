// みえるん簿 - 支出入力画面（スワイプUI）

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { format } from 'date-fns';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { Card, Button, CategoryBadge } from '../components';
import { useExpenseStore } from '../stores/expenseStore';
import { CategoryType, DEFAULT_CATEGORIES } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

export const AddExpenseScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { addExpense } = useExpenseStore();

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<CategoryType>('food');
  const [description, setDescription] = useState('');
  const [date] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  // スワイプアニメーション
  const position = useRef(new Animated.ValueXY()).current;
  const rotation = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: ['-15deg', '0deg', '15deg'],
  });
  const opacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: [0.5, 1, 0.5],
  });

  // 右スワイプインジケーター
  const rightSwipeOpacity = position.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // 左スワイプインジケーター
  const leftSwipeOpacity = position.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy * 0.3 });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          // 右スワイプ → 保存
          handleSwipeRight();
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          // 左スワイプ → キャンセル
          handleSwipeLeft();
        } else {
          // 元に戻す
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const handleSwipeRight = () => {
    if (!amount) {
      Animated.spring(position, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: false,
      }).start();
      return;
    }

    Animated.timing(position, {
      toValue: { x: SCREEN_WIDTH + 100, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      saveExpense();
    });
  };

  const handleSwipeLeft = () => {
    Animated.timing(position, {
      toValue: { x: -SCREEN_WIDTH - 100, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      navigation.goBack();
    });
  };

  const saveExpense = () => {
    addExpense({
      amount: parseInt(amount, 10),
      category,
      description: description || DEFAULT_CATEGORIES.find(c => c.type === category)?.name || '支出',
      date,
      isRecurring: false,
    });
    navigation.goBack();
  };

  const handleNumberPress = (num: string) => {
    if (num === 'delete') {
      setAmount((prev) => prev.slice(0, -1));
    } else if (num === '00') {
      setAmount((prev) => prev + '00');
    } else {
      setAmount((prev) => prev + num);
    }
  };

  const cardStyle = {
    transform: [
      { translateX: position.x },
      { translateY: position.y },
      { rotate: rotation },
    ],
    opacity,
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* スワイプインジケーター */}
      <View style={styles.swipeIndicators}>
        <Animated.View
          style={[styles.indicator, styles.leftIndicator, { opacity: leftSwipeOpacity }]}
        >
          <Text style={styles.indicatorText}>✕ キャンセル</Text>
        </Animated.View>
        <Animated.View
          style={[styles.indicator, styles.rightIndicator, { opacity: rightSwipeOpacity }]}
        >
          <Text style={styles.indicatorText}>✓ 保存</Text>
        </Animated.View>
      </View>

      {/* スワイプカード */}
      <Animated.View
        style={[styles.cardContainer, cardStyle]}
        {...panResponder.panHandlers}
      >
        <Card style={styles.expenseCard} variant="elevated">
          {/* カテゴリ選択 */}
          <TouchableOpacity
            style={styles.categoryButton}
            onPress={() => setShowCategoryPicker(!showCategoryPicker)}
          >
            <CategoryBadge category={category} size="lg" />
            <Text style={styles.changeText}>タップで変更</Text>
          </TouchableOpacity>

          {showCategoryPicker && (
            <View style={styles.categoryPicker}>
              {DEFAULT_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryOption,
                    category === cat.type && styles.categoryOptionActive,
                  ]}
                  onPress={() => {
                    setCategory(cat.type);
                    setShowCategoryPicker(false);
                  }}
                >
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  <Text style={styles.categoryName}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* 金額表示 */}
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>¥</Text>
            <Text style={styles.amountText}>
              {amount ? parseInt(amount, 10).toLocaleString() : '0'}
            </Text>
          </View>

          {/* メモ入力 */}
          <TextInput
            style={styles.descriptionInput}
            placeholder="メモを追加..."
            placeholderTextColor={colors.textLight}
            value={description}
            onChangeText={setDescription}
          />

          {/* 日付表示 */}
          <Text style={styles.dateText}>
            {format(new Date(date), 'yyyy年M月d日')}
          </Text>

          {/* スワイプヒント */}
          <View style={styles.swipeHint}>
            <Text style={styles.swipeHintText}>
              ← キャンセル　　　保存 →
            </Text>
          </View>
        </Card>
      </Animated.View>

      {/* テンキー */}
      <View style={styles.keypad}>
        {[
          ['1', '2', '3'],
          ['4', '5', '6'],
          ['7', '8', '9'],
          ['00', '0', 'delete'],
        ].map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keypadRow}>
            {row.map((num) => (
              <TouchableOpacity
                key={num}
                style={styles.keypadButton}
                onPress={() => handleNumberPress(num)}
                activeOpacity={0.7}
              >
                <Text style={styles.keypadText}>
                  {num === 'delete' ? '⌫' : num}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      {/* 保存ボタン */}
      <View style={styles.footer}>
        <Button
          title="保存"
          onPress={saveExpense}
          disabled={!amount}
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  swipeIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  indicator: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
  },
  leftIndicator: {
    backgroundColor: colors.error + '20',
  },
  rightIndicator: {
    backgroundColor: colors.success + '20',
  },
  indicatorText: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  cardContainer: {
    padding: spacing.md,
  },
  expenseCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    alignItems: 'center',
  },
  categoryButton: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  changeText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  categoryPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
  },
  categoryOption: {
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    minWidth: 70,
  },
  categoryOptionActive: {
    backgroundColor: colors.primaryLight,
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryName: {
    ...typography.caption,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  currencySymbol: {
    fontSize: 24,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  amountText: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  descriptionInput: {
    ...typography.body,
    color: colors.textPrimary,
    textAlign: 'center',
    padding: spacing.md,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.md,
  },
  dateText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  swipeHint: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  swipeHintText: {
    ...typography.caption,
    color: colors.textLight,
  },
  keypad: {
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.sm,
  },
  keypadButton: {
    width: 70,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  keypadText: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  footer: {
    padding: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
