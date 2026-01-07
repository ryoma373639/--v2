// みえるん簿 - 予算ストア

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { Budget, CategoryType, DEFAULT_CATEGORIES } from '../types';
import { format } from 'date-fns';

interface BudgetState {
  budgets: Budget[];
  currentBudget: Budget | null;
  setBudget: (month: string, totalBudget: number, categoryBudgets?: { [key in CategoryType]?: number }) => void;
  setCategoryBudget: (month: string, category: CategoryType, amount: number) => void;
  getBudget: (month: string) => Budget | null;
  getCurrentMonthBudget: () => Budget | null;
  initializeDefaultBudget: () => void;
}

const createDefaultBudget = (month: string): Budget => {
  const categoryBudgets: { [key in CategoryType]?: number } = {};
  DEFAULT_CATEGORIES.forEach((cat) => {
    categoryBudgets[cat.type] = cat.budget;
  });

  return {
    id: uuidv4(),
    month,
    totalBudget: DEFAULT_CATEGORIES.reduce((sum, cat) => sum + cat.budget, 0),
    categoryBudgets,
  };
};

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set, get) => ({
      budgets: [],
      currentBudget: null,

      setBudget: (month, totalBudget, categoryBudgets) => {
        const existingBudget = get().budgets.find((b) => b.month === month);

        if (existingBudget) {
          set((state) => ({
            budgets: state.budgets.map((b) =>
              b.month === month
                ? {
                    ...b,
                    totalBudget,
                    categoryBudgets: categoryBudgets || b.categoryBudgets,
                  }
                : b
            ),
          }));
        } else {
          const newBudget: Budget = {
            id: uuidv4(),
            month,
            totalBudget,
            categoryBudgets: categoryBudgets || {},
          };
          set((state) => ({
            budgets: [...state.budgets, newBudget],
          }));
        }
      },

      setCategoryBudget: (month, category, amount) => {
        const existingBudget = get().budgets.find((b) => b.month === month);

        if (existingBudget) {
          set((state) => ({
            budgets: state.budgets.map((b) =>
              b.month === month
                ? {
                    ...b,
                    categoryBudgets: {
                      ...b.categoryBudgets,
                      [category]: amount,
                    },
                  }
                : b
            ),
          }));
        } else {
          const newBudget = createDefaultBudget(month);
          newBudget.categoryBudgets[category] = amount;
          set((state) => ({
            budgets: [...state.budgets, newBudget],
          }));
        }
      },

      getBudget: (month) => {
        return get().budgets.find((b) => b.month === month) || null;
      },

      getCurrentMonthBudget: () => {
        const currentMonth = format(new Date(), 'yyyy-MM');
        return get().getBudget(currentMonth);
      },

      initializeDefaultBudget: () => {
        const currentMonth = format(new Date(), 'yyyy-MM');
        const existing = get().budgets.find((b) => b.month === currentMonth);

        if (!existing) {
          const defaultBudget = createDefaultBudget(currentMonth);
          set((state) => ({
            budgets: [...state.budgets, defaultBudget],
            currentBudget: defaultBudget,
          }));
        }
      },
    }),
    {
      name: 'mierunbo-budgets',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
