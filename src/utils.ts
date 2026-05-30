/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Category, CurrencyCode } from "./types";

// Exchange rates relative to VND as local base
export const EXCHANGE_RATES: Record<CurrencyCode, number> = {
  VND: 1,
  USD: 25000,
  EUR: 27000,
  JPY: 160,
};

/**
 * Format currency amount based on currency code
 */
export function formatCurrency(amount: number, currency: CurrencyCode): string {
  if (currency === 'VND') {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount);
  }
  
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  if (currency === 'EUR') {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  }

  if (currency === 'JPY') {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount);
  }

  return `${amount} ${currency}`;
}

/**
 * Convert an amount from one currency to another
 */
export function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode
): number {
  if (from === to) return amount;
  // Convert from input currency to VND base first
  const amountInVND = amount * EXCHANGE_RATES[from];
  // Convert from VND base to output currency
  return amountInVND / EXCHANGE_RATES[to];
}

/**
 * Default spending/income categories
 */
export const DEFAULT_CATEGORIES: Category[] = [
  // Expenses
  { id: 'cat-food', name: 'Ăn uống', iconName: 'Utensils', type: 'expense' },
  { id: 'cat-transport', name: 'Di chuyển', iconName: 'Car', type: 'expense' },
  { id: 'cat-house', name: 'Nhà cửa', iconName: 'Home', type: 'expense' },
  { id: 'cat-entertainment', name: 'Giải trí', iconName: 'Film', type: 'expense' },
  { id: 'cat-bills', name: 'Hóa đơn & Tiện ích', iconName: 'Receipt', type: 'expense' },
  { id: 'cat-health', name: 'Sức khỏe', iconName: 'HeartPulse', type: 'expense' },
  { id: 'cat-shopping', name: 'Mua sắm', iconName: 'ShoppingBag', type: 'expense' },
  
  // Income
  { id: 'cat-salary', name: 'Lương', iconName: 'Briefcase', type: 'income' },
  { id: 'cat-freelance', name: 'Freelance', iconName: 'Laptop', type: 'income' },
  { id: 'cat-investment', name: 'Đầu tư', iconName: 'TrendingUp', type: 'income' },
  { id: 'cat-bonus', name: 'Thưởng', iconName: 'Award', type: 'income' },
];

/**
 * Helper to get date string representation (YYYY-MM-DD)
 */
export function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Groups list of items by YYYY-MM-DD keys and labels nicely in Vietnamese
 */
export function formatDateLabel(dateStr: string): string {
  const today = getTodayString();
  const yesterday = getYesterdayString();

  if (dateStr === today) {
    return 'Hôm nay';
  } else if (dateStr === yesterday) {
    return 'Hôm qua';
  } else {
    // Return formatted date "Ngày DD/MM/YYYY"
    const [year, month, day] = dateStr.split('-');
    if (year && month && day) {
      return `${day}/${month}/${year}`;
    }
    return dateStr;
  }
}
