// みえるん簿 - 支出ストア

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { Expense, CategoryType } from '../types';

interface ExpenseState {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  getExpensesByMonth: (month: string) => Expense[];
  getExpensesByCategory: (category: CategoryType) => Expense[];
  getTotalByMonth: (month: string) => number;
  getTotalByCategory: (month: string, category: CategoryType) => number;
}

export const useExpenseStore = create<ExpenseState>()(
  persist(
    (set, get) => ({
      expenses: [],

      addExpense: (expenseData) => {
        const now = new Date().toISOString();
        const newExpense: Expense = {
          ...expenseData,
          id: uuidv4(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          expenses: [...state.expenses, newExpense],
        }));
      },

      updateExpense: (id, expenseData) => {
        set((state) => ({
          expenses: state.expenses.map((expense) =>
            expense.id === id
              ? { ...expense, ...expenseData, updatedAt: new Date().toISOString() }
              : expense
          ),
        }));
      },

      deleteExpense: (id) => {
        set((state) => ({
          expenses: state.expenses.filter((expense) => expense.id !== id),
        }));
      },

      getExpensesByMonth: (month) => {
        return get().expenses.filter((expense) =>
          expense.date.startsWith(month)
        );
      },

      getExpensesByCategory: (category) => {
        return get().expenses.filter((expense) => expense.category === category);
      },

      getTotalByMonth: (month) => {
        return get()
          .expenses.filter((expense) => expense.date.startsWith(month))
          .reduce((sum, expense) => sum + expense.amount, 0);
      },

      getTotalByCategory: (month, category) => {
        return get()
          .expenses.filter(
            (expense) =>
              expense.date.startsWith(month) && expense.category === category
          )
          .reduce((sum, expense) => sum + expense.amount, 0);
      },
    }),
    {
      name: 'mierunbo-expenses',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
