// みえるん簿 - 型定義

// カテゴリ
export type CategoryType =
  | 'food'
  | 'transport'
  | 'utilities'
  | 'entertainment'
  | 'shopping'
  | 'subscription'
  | 'communication'
  | 'health'
  | 'other';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  icon: string;
  budget: number;
}

// 支出
export interface Expense {
  id: string;
  amount: number;
  category: CategoryType;
  description: string;
  date: string; // ISO string
  receiptImage?: string;
  isRecurring: boolean;
  createdAt: string;
  updatedAt: string;
}

// サブスクリプション
export type BillingCycle = 'weekly' | 'monthly' | 'yearly';

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingCycle: BillingCycle;
  category: CategoryType;
  startDate: string;
  nextBillingDate: string;
  description?: string;
  icon?: string;
  color?: string;
  isActive: boolean;
  isPaused: boolean;
  createdAt: string;
  updatedAt: string;
}

// 予算
export interface Budget {
  id: string;
  month: string; // YYYY-MM format
  totalBudget: number;
  categoryBudgets: {
    [key in CategoryType]?: number;
  };
}

// 統計
export interface MonthlyStats {
  month: string;
  totalExpenses: number;
  totalSubscriptions: number;
  byCategory: {
    [key in CategoryType]?: number;
  };
  budgetUsage: number; // percentage
}

// サブスクプリセット
export interface SubscriptionPreset {
  name: string;
  icon: string;
  defaultAmount?: number;
  billingCycle: BillingCycle;
  category: CategoryType;
}

// 人気のサブスクプリセット
export const SUBSCRIPTION_PRESETS: SubscriptionPreset[] = [
  { name: 'Netflix', icon: '🎬', defaultAmount: 1490, billingCycle: 'monthly', category: 'subscription' },
  { name: 'Amazon Prime', icon: '📦', defaultAmount: 600, billingCycle: 'monthly', category: 'subscription' },
  { name: 'Spotify', icon: '🎵', defaultAmount: 980, billingCycle: 'monthly', category: 'subscription' },
  { name: 'Apple Music', icon: '🍎', defaultAmount: 1080, billingCycle: 'monthly', category: 'subscription' },
  { name: 'YouTube Premium', icon: '▶️', defaultAmount: 1280, billingCycle: 'monthly', category: 'subscription' },
  { name: 'Disney+', icon: '🏰', defaultAmount: 990, billingCycle: 'monthly', category: 'subscription' },
  { name: 'Adobe CC', icon: '🎨', defaultAmount: 6480, billingCycle: 'monthly', category: 'subscription' },
  { name: 'Microsoft 365', icon: '💼', defaultAmount: 1284, billingCycle: 'monthly', category: 'subscription' },
  { name: 'iCloud+', icon: '☁️', defaultAmount: 130, billingCycle: 'monthly', category: 'subscription' },
  { name: 'Nintendo Online', icon: '🎮', defaultAmount: 306, billingCycle: 'monthly', category: 'subscription' },
];

// デフォルトカテゴリ
export const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: '食費', type: 'food', icon: '🍽️', budget: 50000 },
  { id: '2', name: '交通費', type: 'transport', icon: '🚃', budget: 15000 },
  { id: '3', name: '光熱費', type: 'utilities', icon: '💡', budget: 15000 },
  { id: '4', name: '娯楽', type: 'entertainment', icon: '🎮', budget: 20000 },
  { id: '5', name: '買い物', type: 'shopping', icon: '🛍️', budget: 30000 },
  { id: '6', name: 'サブスク', type: 'subscription', icon: '📱', budget: 10000 },
  { id: '7', name: '通信費', type: 'communication', icon: '📶', budget: 10000 },
  { id: '8', name: '医療', type: 'health', icon: '🏥', budget: 10000 },
  { id: '9', name: 'その他', type: 'other', icon: '📝', budget: 20000 },
];
