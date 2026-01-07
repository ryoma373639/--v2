// みえるん簿 - サブスク追加画面

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { format, addMonths, addWeeks, addYears } from 'date-fns';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { Card, Button, CategoryBadge } from '../components';
import { useSubscriptionStore } from '../stores/subscriptionStore';
import {
  Subscription,
  BillingCycle,
  CategoryType,
  SUBSCRIPTION_PRESETS,
  DEFAULT_CATEGORIES,
} from '../types';

const billingCycleOptions: { value: BillingCycle; label: string }[] = [
  { value: 'weekly', label: '週額' },
  { value: 'monthly', label: '月額' },
  { value: 'yearly', label: '年額' },
];

export const AddSubscriptionScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const editSubscription = route.params?.subscription as Subscription | undefined;

  const { addSubscription, updateSubscription } = useSubscriptionStore();

  const [name, setName] = useState(editSubscription?.name || '');
  const [amount, setAmount] = useState(
    editSubscription?.amount?.toString() || ''
  );
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(
    editSubscription?.billingCycle || 'monthly'
  );
  const [category, setCategory] = useState<CategoryType>(
    editSubscription?.category || 'subscription'
  );
  const [description, setDescription] = useState(
    editSubscription?.description || ''
  );
  const [icon, setIcon] = useState(editSubscription?.icon || '📱');
  const [startDate] = useState(
    editSubscription?.startDate || format(new Date(), 'yyyy-MM-dd')
  );
  const [showPresets, setShowPresets] = useState(!editSubscription);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const calculateNextBillingDate = (start: string, cycle: BillingCycle) => {
    const date = new Date(start);
    switch (cycle) {
      case 'weekly':
        return format(addWeeks(date, 1), 'yyyy-MM-dd');
      case 'monthly':
        return format(addMonths(date, 1), 'yyyy-MM-dd');
      case 'yearly':
        return format(addYears(date, 1), 'yyyy-MM-dd');
    }
  };

  const handlePresetSelect = (preset: (typeof SUBSCRIPTION_PRESETS)[0]) => {
    setName(preset.name);
    setIcon(preset.icon);
    if (preset.defaultAmount) {
      setAmount(preset.defaultAmount.toString());
    }
    setBillingCycle(preset.billingCycle);
    setCategory(preset.category);
    setShowPresets(false);
  };

  const handleSave = () => {
    if (!name || !amount) return;

    const subscriptionData = {
      name,
      amount: parseInt(amount, 10),
      billingCycle,
      category,
      startDate,
      nextBillingDate: calculateNextBillingDate(startDate, billingCycle),
      description: description || undefined,
      icon,
      isActive: true,
      isPaused: false,
    };

    if (editSubscription) {
      updateSubscription(editSubscription.id, subscriptionData);
    } else {
      addSubscription(subscriptionData);
    }

    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* プリセット選択 */}
          {showPresets && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>人気のサービス</Text>
              <View style={styles.presetGrid}>
                {SUBSCRIPTION_PRESETS.map((preset, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.presetCard}
                    onPress={() => handlePresetSelect(preset)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.presetIcon}>{preset.icon}</Text>
                    <Text style={styles.presetName}>{preset.name}</Text>
                    {preset.defaultAmount && (
                      <Text style={styles.presetAmount}>
                        ¥{preset.defaultAmount.toLocaleString()}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={styles.customButton}
                onPress={() => setShowPresets(false)}
              >
                <Text style={styles.customButtonText}>
                  カスタムで追加する →
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 入力フォーム */}
          {!showPresets && (
            <>
              {/* アイコン選択 */}
              <View style={styles.iconSection}>
                <TouchableOpacity style={styles.iconButton}>
                  <Text style={styles.selectedIcon}>{icon}</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.nameInput}
                  placeholder="サービス名"
                  placeholderTextColor={colors.textLight}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              {/* 金額入力 */}
              <Card style={styles.inputCard}>
                <Text style={styles.inputLabel}>金額</Text>
                <View style={styles.amountInputContainer}>
                  <Text style={styles.currencySymbol}>¥</Text>
                  <TextInput
                    style={styles.amountInput}
                    placeholder="0"
                    placeholderTextColor={colors.textLight}
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                  />
                </View>
              </Card>

              {/* 請求サイクル */}
              <Card style={styles.inputCard}>
                <Text style={styles.inputLabel}>請求サイクル</Text>
                <View style={styles.cycleOptions}>
                  {billingCycleOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.cycleOption,
                        billingCycle === option.value &&
                          styles.cycleOptionActive,
                      ]}
                      onPress={() => setBillingCycle(option.value)}
                    >
                      <Text
                        style={[
                          styles.cycleOptionText,
                          billingCycle === option.value &&
                            styles.cycleOptionTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Card>

              {/* カテゴリ選択 */}
              <Card style={styles.inputCard}>
                <Text style={styles.inputLabel}>カテゴリ</Text>
                <TouchableOpacity
                  style={styles.categorySelector}
                  onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                >
                  <CategoryBadge category={category} />
                  <Text style={styles.chevron}>▼</Text>
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
                        <CategoryBadge category={cat.type} size="sm" />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </Card>

              {/* メモ */}
              <Card style={styles.inputCard}>
                <Text style={styles.inputLabel}>メモ（任意）</Text>
                <TextInput
                  style={styles.memoInput}
                  placeholder="メモを入力..."
                  placeholderTextColor={colors.textLight}
                  multiline
                  numberOfLines={3}
                  value={description}
                  onChangeText={setDescription}
                />
              </Card>

              {/* プリセットに戻る */}
              {!editSubscription && (
                <TouchableOpacity
                  style={styles.backToPresets}
                  onPress={() => setShowPresets(true)}
                >
                  <Text style={styles.backToPresetsText}>
                    ← プリセットから選ぶ
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </ScrollView>

        {/* 保存ボタン */}
        {!showPresets && (
          <View style={styles.footer}>
            <Button
              title={editSubscription ? '更新する' : '追加する'}
              onPress={handleSave}
              disabled={!name || !amount}
              size="lg"
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 120,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  presetCard: {
    width: '30%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  presetIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  presetName: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '500',
    textAlign: 'center',
  },
  presetAmount: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  customButton: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  customButtonText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  iconSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  iconButton: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIcon: {
    fontSize: 32,
  },
  nameInput: {
    flex: 1,
    ...typography.h2,
    color: colors.textPrimary,
  },
  inputCard: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    ...typography.h2,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  amountInput: {
    flex: 1,
    ...typography.h2,
    color: colors.textPrimary,
  },
  cycleOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cycleOption: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
  },
  cycleOptionActive: {
    backgroundColor: colors.primary,
  },
  cycleOptionText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  cycleOptionTextActive: {
    color: colors.textPrimary,
  },
  categorySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chevron: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  categoryPicker: {
    marginTop: spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryOption: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundSecondary,
  },
  categoryOptionActive: {
    backgroundColor: colors.primaryLight,
  },
  memoInput: {
    ...typography.body,
    color: colors.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  backToPresets: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  backToPresetsText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
