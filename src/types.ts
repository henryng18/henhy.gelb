/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserInfo {
  name: string;
  birthYear: string;
  hometown: string;
  location: string;
  job: string;
  income: string; // Monthly income as a string or number representation
  financialGoal: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string; // YYYY-MM-DD
  note: string;
  currency: string;
}

export interface SavingGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // YYYY-MM-DD
  currency: string;
}

export interface Category {
  id: string;
  name: string;
  iconName: string;
  type: 'income' | 'expense';
  isCustom?: boolean;
}

export type CurrencyCode = 'VND' | 'USD' | 'EUR' | 'JPY';

export interface AppSettings {
  theme: 'light' | 'dark';
  baseCurrency: CurrencyCode;
}
