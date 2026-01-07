// みえるん簿 - ホーム画面

import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { Card, AmountDisplay, ProgressBar, CategoryBadge } from '../components';
import { useExpenseStore } from '../stores/expenseStore';
import { useSubscriptionStore } from '../stores/subscriptionStore';
import { useBudgetStore } from '../stores/budgetStore';
import { DEFAULT_CATEGORIES, CategoryType } from '../types';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const currentMonth = format(new Date(), 'yyyy-MM');

  const { expenses, getTotalByMonth, getTotalByCategory } = useExpenseStore();
  const { getMonthlyTotal, getActiveSubscriptions, getUpcomingRenewals } =
    useSubscriptionStore();
  const { getCurrentMonthBudget, initializeDefaultBudget } = useBudgetStore();

  // 予算初期化
  React.useEffect(() => {
    initializeDefaultBudget();
  }, []);

  const budget = getCurrentMonthBudget();
  const totalExpenses = getTotalByMonth(currentMonth);
  const subscriptionTotal = getMonthlyTotal();
  const totalSpending = totalExpenses + subscriptionTotal;
  const budgetRemaining = (budget?.totalBudget || 0) - totalSpending;
  const budgetProgress =
    budget?.totalBudget ? (totalSpending / budget.totalBudget) * 100 : 0;

  const upcomingRenewals = getUpcomingRenewals(7);

  // カテゴリ別支出
  const categoryExpenses = useMemo(() => {
    return DEFAULT_CATEGORIES.map((cat) => ({
      ...cat,
      spent: getTotalByCategory(currentMonth, cat.type),
    }))
      .filter((cat) => cat.spent > 0)
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 5);
  }, [expenses, currentMonth]);

  // 最近の支出
  const recentExpenses = useMemo(() => {
    return [...expenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [expenses]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ヘッダー */}
        <View style={styles.header}>
          <Text style={styles.greeting}>こんにちは!</Text>
          <Text style={styles.date}>
            {format(new Date(), 'yyyy年M月d日 (E)', { locale: ja })}
          </Text>
        </View>

        {/* 今月のサマリー */}
        <Card style={styles.summaryCard} variant="elevated">
          <Text style={styles.sectionTitle}>今月の支出</Text>
          <AmountDisplay amount={totalSpending} size="xl" />
          <View style={styles.budgetInfo}>
            <Text style={styles.budgetLabel}>
              予算: ¥{budget?.totalBudget?.toLocaleString() || 0}
            </Text>
            <Text
              style={[
                styles.remainingLabel,
                budgetRemaining < 0 && styles.overBudget,
              ]}
            >
              残り: ¥{budgetRemaining.toLocaleString()}
            </Text>
          </View>
          <ProgressBar
            progress={budgetProgress}
            color={budgetProgress > 80 ? colors.warning : colors.primary}
            showLabel
            label="予算消化率"
          />
        </Card>

        {/* サブスクサマリー */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Subscriptions')}
          activeOpacity={0.7}
        >
          <Card style={styles.subscriptionCard}>
            <View style={styles.subscriptionHeader}>
              <Text style={styles.sectionTitle}>サブスク</Text>
              <Text style={styles.viewAll}>一覧を見る →</Text>
            </View>
            <View style={styles.subscriptionContent}>
              <View>
                <Text style={styles.subscriptionLabel}>月額合計</Text>
                <AmountDisplay amount={subscriptionTotal} size="lg" />
              </View>
              <View style={styles.subscriptionCount}>
                <Text style={styles.countNumber}>
                  {getActiveSubscriptions().length}
                </Text>
                <Text style={styles.countLabel}>契約中</Text>
              </View>
            </View>
            {upcomingRenewals.length > 0 && (
              <View style={styles.upcomingRenewals}>
                <Text style={styles.upcomingLabel}>
                  📅 {upcomingRenewals.length}件の更新が近づいています
                </Text>
              </View>
            )}
          </Card>
        </TouchableOpacity>

        {/* カテゴリ別支出 */}
        {categoryExpenses.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>カテゴリ別支出</Text>
            {categoryExpenses.map((cat) => (
              <Card key={cat.id} style={styles.categoryCard}>
                <View style={styles.categoryRow}>
                  <CategoryBadge category={cat.type as CategoryType} size="sm" />
                  <AmountDisplay amount={cat.spent} size="md" />
                </View>
                <ProgressBar
                  progress={(cat.spent / cat.budget) * 100}
                  height={6}
                  color={colors.categories[cat.type as CategoryType]}
                />
              </Card>
            ))}
          </View>
        )}

        {/* 最近の支出 */}
        {recentExpenses.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>最近の支出</Text>
            {recentExpenses.map((expense) => (
              <Card key={expense.id} style={styles.expenseCard}>
                <View style={styles.expenseRow}>
                  <View style={styles.expenseInfo}>
                    <CategoryBadge
                      category={expense.category}
                      size="sm"
                      showLabel={false}
                    />
                    <View>
                      <Text style={styles.expenseDescription}>
                        {expense.description || '支出'}
                      </Text>
                      <Text style={styles.expenseDate}>
                        {format(new Date(expense.date), 'M/d')}
                      </Text>
                    </View>
                  </View>
                  <AmountDisplay amount={expense.amount} size="md" />
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* 空状態 */}
        {expenses.length === 0 && (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyTitle}>支出を記録しましょう</Text>
            <Text style={styles.emptyDescription}>
              下のボタンから支出を追加できます
            </Text>
          </Card>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddExpense')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  header: {
    marginBottom: spacing.lg,
  },
  greeting: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  date: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  summaryCard: {
    backgroundColor: colors.primaryLight,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  budgetInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  budgetLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  remainingLabel: {
    ...typography.bodySmall,
    color: colors.success,
    fontWeight: '600',
  },
  overBudget: {
    color: colors.error,
  },
  subscriptionCard: {
    backgroundColor: colors.categories.subscription,
    marginBottom: spacing.lg,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewAll: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  subscriptionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  subscriptionLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  subscriptionCount: {
    alignItems: 'center',
  },
  countNumber: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  countLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  upcomingRenewals: {
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.warning + '30',
    borderRadius: borderRadius.sm,
  },
  upcomingLabel: {
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
  section: {
    marginBottom: spacing.lg,
  },
  categoryCard: {
    marginBottom: spacing.sm,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  expenseCard: {
    marginBottom: spacing.sm,
  },
  expenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expenseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  expenseDescription: {
    ...typography.body,
    color: colors.textPrimary,
  },
  expenseDate: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyDescription: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  fabIcon: {
    fontSize: 28,
    color: colors.textPrimary,
    fontWeight: '300',
  },
});
