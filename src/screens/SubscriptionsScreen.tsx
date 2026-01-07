// みえるん簿 - サブスク一覧画面

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Modal,
} from 'react-native';
import { format, differenceInDays } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { Card, AmountDisplay, Button, CategoryBadge } from '../components';
import { useSubscriptionStore } from '../stores/subscriptionStore';
import { Subscription, BillingCycle } from '../types';

type FilterType = 'all' | 'active' | 'paused';
type SortType = 'amount' | 'nextBilling' | 'name';

const billingCycleLabels: Record<BillingCycle, string> = {
  weekly: '週額',
  monthly: '月額',
  yearly: '年額',
};

export const SubscriptionsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('nextBilling');
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);

  const {
    subscriptions,
    getMonthlyTotal,
    getYearlyTotal,
    togglePause,
    cancelSubscription,
    deleteSubscription,
  } = useSubscriptionStore();

  const monthlyTotal = getMonthlyTotal();
  const yearlyTotal = getYearlyTotal();

  // フィルタリング＆ソート
  const filteredSubscriptions = useMemo(() => {
    let result = [...subscriptions];

    // フィルター
    switch (filter) {
      case 'active':
        result = result.filter((s) => s.isActive && !s.isPaused);
        break;
      case 'paused':
        result = result.filter((s) => s.isPaused || !s.isActive);
        break;
    }

    // ソート
    switch (sortBy) {
      case 'amount':
        result.sort((a, b) => b.amount - a.amount);
        break;
      case 'nextBilling':
        result.sort(
          (a, b) =>
            new Date(a.nextBillingDate).getTime() -
            new Date(b.nextBillingDate).getTime()
        );
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return result;
  }, [subscriptions, filter, sortBy]);

  const getDaysUntilBilling = (date: string) => {
    return differenceInDays(new Date(date), new Date());
  };

  const renderSubscriptionCard = (subscription: Subscription) => {
    const daysUntil = getDaysUntilBilling(subscription.nextBillingDate);
    const isUrgent = daysUntil <= 3 && daysUntil >= 0;

    return (
      <TouchableOpacity
        key={subscription.id}
        onPress={() => setSelectedSubscription(subscription)}
        activeOpacity={0.7}
      >
        <Card
          style={[
            styles.subscriptionCard,
            subscription.isPaused && styles.pausedCard,
            !subscription.isActive && styles.cancelledCard,
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.subscriptionIcon}>
                {subscription.icon || '📱'}
              </Text>
              <View>
                <Text style={styles.subscriptionName}>{subscription.name}</Text>
                <Text style={styles.billingCycle}>
                  {billingCycleLabels[subscription.billingCycle]}
                </Text>
              </View>
            </View>
            <View style={styles.amountContainer}>
              <AmountDisplay amount={subscription.amount} size="lg" />
              {subscription.isPaused && (
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>停止中</Text>
                </View>
              )}
              {!subscription.isActive && (
                <View style={[styles.statusBadge, styles.cancelledBadge]}>
                  <Text style={styles.statusText}>解約済</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.nextBillingContainer}>
              <Text style={styles.nextBillingLabel}>次回更新</Text>
              <Text
                style={[
                  styles.nextBillingDate,
                  isUrgent && styles.urgentDate,
                ]}
              >
                {format(new Date(subscription.nextBillingDate), 'M月d日', {
                  locale: ja,
                })}
                {daysUntil >= 0 && (
                  <Text style={styles.daysUntil}>
                    {' '}
                    ({daysUntil === 0 ? '今日' : `${daysUntil}日後`})
                  </Text>
                )}
              </Text>
            </View>
            <CategoryBadge
              category={subscription.category}
              size="sm"
              showLabel={false}
            />
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* サマリーカード */}
        <Card style={styles.summaryCard} variant="elevated">
          <Text style={styles.summaryTitle}>サブスク合計</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>月額</Text>
              <AmountDisplay amount={monthlyTotal} size="lg" />
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>年額換算</Text>
              <AmountDisplay amount={yearlyTotal} size="lg" />
            </View>
          </View>
          <View style={styles.summaryFooter}>
            <Text style={styles.contractCount}>
              {subscriptions.filter((s) => s.isActive).length}件 契約中
            </Text>
          </View>
        </Card>

        {/* フィルター・ソート */}
        <View style={styles.filterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {(['all', 'active', 'paused'] as FilterType[]).map((f) => (
              <TouchableOpacity
                key={f}
                style={[
                  styles.filterButton,
                  filter === f && styles.filterButtonActive,
                ]}
                onPress={() => setFilter(f)}
              >
                <Text
                  style={[
                    styles.filterText,
                    filter === f && styles.filterTextActive,
                  ]}
                >
                  {f === 'all' ? 'すべて' : f === 'active' ? '有効' : '停止中'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* サブスク一覧 */}
        <View style={styles.listContainer}>
          {filteredSubscriptions.length > 0 ? (
            filteredSubscriptions.map(renderSubscriptionCard)
          ) : (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>📱</Text>
              <Text style={styles.emptyTitle}>サブスクがありません</Text>
              <Text style={styles.emptyDescription}>
                下のボタンから追加しましょう
              </Text>
            </Card>
          )}
        </View>
      </ScrollView>

      {/* 追加ボタン */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddSubscription')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* 詳細モーダル */}
      <Modal
        visible={!!selectedSubscription}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedSubscription(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedSubscription && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalIcon}>
                    {selectedSubscription.icon || '📱'}
                  </Text>
                  <Text style={styles.modalTitle}>
                    {selectedSubscription.name}
                  </Text>
                  <AmountDisplay
                    amount={selectedSubscription.amount}
                    size="xl"
                  />
                  <Text style={styles.modalBillingCycle}>
                    {billingCycleLabels[selectedSubscription.billingCycle]}
                  </Text>
                </View>

                <View style={styles.modalInfo}>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoLabel}>開始日</Text>
                    <Text style={styles.modalInfoValue}>
                      {format(
                        new Date(selectedSubscription.startDate),
                        'yyyy年M月d日',
                        { locale: ja }
                      )}
                    </Text>
                  </View>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoLabel}>次回更新</Text>
                    <Text style={styles.modalInfoValue}>
                      {format(
                        new Date(selectedSubscription.nextBillingDate),
                        'yyyy年M月d日',
                        { locale: ja }
                      )}
                    </Text>
                  </View>
                  {selectedSubscription.description && (
                    <View style={styles.modalInfoRow}>
                      <Text style={styles.modalInfoLabel}>メモ</Text>
                      <Text style={styles.modalInfoValue}>
                        {selectedSubscription.description}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.modalActions}>
                  <Button
                    title={
                      selectedSubscription.isPaused ? '再開する' : '一時停止'
                    }
                    variant="outline"
                    onPress={() => {
                      togglePause(selectedSubscription.id);
                      setSelectedSubscription(null);
                    }}
                  />
                  <Button
                    title="編集"
                    variant="primary"
                    onPress={() => {
                      setSelectedSubscription(null);
                      navigation.navigate('AddSubscription', {
                        subscription: selectedSubscription,
                      });
                    }}
                  />
                  {selectedSubscription.isActive && (
                    <Button
                      title="解約"
                      variant="ghost"
                      textStyle={{ color: colors.error }}
                      onPress={() => {
                        cancelSubscription(selectedSubscription.id);
                        setSelectedSubscription(null);
                      }}
                    />
                  )}
                </View>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setSelectedSubscription(null)}
                >
                  <Text style={styles.closeButtonText}>閉じる</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  summaryCard: {
    backgroundColor: colors.categories.subscription,
    marginBottom: spacing.lg,
  },
  summaryTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  summaryFooter: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  contractCount: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  filterContainer: {
    marginBottom: spacing.md,
  },
  filterScroll: {
    gap: spacing.sm,
  },
  filterButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundSecondary,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  listContainer: {
    gap: spacing.sm,
  },
  subscriptionCard: {
    marginBottom: spacing.sm,
  },
  pausedCard: {
    opacity: 0.7,
  },
  cancelledCard: {
    opacity: 0.5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  subscriptionIcon: {
    fontSize: 32,
  },
  subscriptionName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  billingCycle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    backgroundColor: colors.warning,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    marginTop: spacing.xs,
  },
  cancelledBadge: {
    backgroundColor: colors.error,
  },
  statusText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextBillingContainer: {},
  nextBillingLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  nextBillingDate: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  urgentDate: {
    color: colors.error,
  },
  daysUntil: {
    color: colors.textSecondary,
    fontWeight: '400',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  modalBillingCycle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  modalInfo: {
    marginBottom: spacing.lg,
  },
  modalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  modalInfoLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  modalInfoValue: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  modalActions: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  closeButton: {
    alignItems: 'center',
    padding: spacing.md,
  },
  closeButtonText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
