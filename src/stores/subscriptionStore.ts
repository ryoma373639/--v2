// みえるん簿 - サブスクリプションストア

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { addMonths, addWeeks, addYears, format } from 'date-fns';
import { Subscription, BillingCycle } from '../types';

interface SubscriptionState {
  subscriptions: Subscription[];
  addSubscription: (subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSubscription: (id: string, subscription: Partial<Subscription>) => void;
  deleteSubscription: (id: string) => void;
  togglePause: (id: string) => void;
  cancelSubscription: (id: string) => void;
  getActiveSubscriptions: () => Subscription[];
  getMonthlyTotal: () => number;
  getYearlyTotal: () => number;
  getUpcomingRenewals: (days: number) => Subscription[];
}

// 次の請求日を計算
const calculateNextBillingDate = (
  currentDate: string,
  billingCycle: BillingCycle
): string => {
  const date = new Date(currentDate);
  switch (billingCycle) {
    case 'weekly':
      return format(addWeeks(date, 1), 'yyyy-MM-dd');
    case 'monthly':
      return format(addMonths(date, 1), 'yyyy-MM-dd');
    case 'yearly':
      return format(addYears(date, 1), 'yyyy-MM-dd');
    default:
      return format(addMonths(date, 1), 'yyyy-MM-dd');
  }
};

// 月額換算
const toMonthlyAmount = (amount: number, billingCycle: BillingCycle): number => {
  switch (billingCycle) {
    case 'weekly':
      return amount * 4.33; // 週あたり約4.33週
    case 'monthly':
      return amount;
    case 'yearly':
      return amount / 12;
    default:
      return amount;
  }
};

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      subscriptions: [],

      addSubscription: (subscriptionData) => {
        const now = new Date().toISOString();
        const newSubscription: Subscription = {
          ...subscriptionData,
          id: uuidv4(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          subscriptions: [...state.subscriptions, newSubscription],
        }));
      },

      updateSubscription: (id, subscriptionData) => {
        set((state) => ({
          subscriptions: state.subscriptions.map((sub) =>
            sub.id === id
              ? { ...sub, ...subscriptionData, updatedAt: new Date().toISOString() }
              : sub
          ),
        }));
      },

      deleteSubscription: (id) => {
        set((state) => ({
          subscriptions: state.subscriptions.filter((sub) => sub.id !== id),
        }));
      },

      togglePause: (id) => {
        set((state) => ({
          subscriptions: state.subscriptions.map((sub) =>
            sub.id === id
              ? { ...sub, isPaused: !sub.isPaused, updatedAt: new Date().toISOString() }
              : sub
          ),
        }));
      },

      cancelSubscription: (id) => {
        set((state) => ({
          subscriptions: state.subscriptions.map((sub) =>
            sub.id === id
              ? { ...sub, isActive: false, updatedAt: new Date().toISOString() }
              : sub
          ),
        }));
      },

      getActiveSubscriptions: () => {
        return get().subscriptions.filter((sub) => sub.isActive && !sub.isPaused);
      },

      getMonthlyTotal: () => {
        return get()
          .subscriptions.filter((sub) => sub.isActive && !sub.isPaused)
          .reduce((sum, sub) => sum + toMonthlyAmount(sub.amount, sub.billingCycle), 0);
      },

      getYearlyTotal: () => {
        return get().getMonthlyTotal() * 12;
      },

      getUpcomingRenewals: (days) => {
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + days);

        return get()
          .subscriptions.filter((sub) => {
            if (!sub.isActive || sub.isPaused) return false;
            const nextBilling = new Date(sub.nextBillingDate);
            return nextBilling >= today && nextBilling <= futureDate;
          })
          .sort(
            (a, b) =>
              new Date(a.nextBillingDate).getTime() -
              new Date(b.nextBillingDate).getTime()
          );
      },
    }),
    {
      name: 'mierunbo-subscriptions',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
