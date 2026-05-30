/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Trash2, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CircleHelp,
  Tag,
  CircleX
} from 'lucide-react';
import { Transaction, Category, CurrencyCode } from '../types';
import { formatCurrency, formatDateLabel, DEFAULT_CATEGORIES, convertCurrency } from '../utils';
import { iconMap } from './DashboardView';

interface TransactionsViewProps {
  transactions: Transaction[];
  categories: Category[];
  baseCurrency: CurrencyCode;
  onDeleteTransaction: (id: string) => void;
}

export function TransactionsView({
  transactions,
  categories,
  baseCurrency,
  onDeleteTransaction,
}: TransactionsViewProps) {
  const [search, setSearch] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    // 1. Search note or category
    const searchLower = search.toLowerCase();
    const noteMatch = tx.note.toLowerCase().includes(searchLower);
    const categoryMatch = tx.category.toLowerCase().includes(searchLower);
    if (search && !noteMatch && !categoryMatch) return false;

    // 2. Type filter
    if (filterType !== 'all' && tx.type !== filterType) return false;

    // 3. Category filter
    if (filterCategory !== 'all' && tx.category !== filterCategory) return false;

    return true;
  });

  // Sort descending by date, then group by date
  const sortedTransactions = [...filteredTransactions].sort((a, b) => b.date.localeCompare(a.date));

  // Group by date YYYY-MM-DD
  const groups: Record<string, Transaction[]> = {};
  sortedTransactions.forEach((tx) => {
    if (!groups[tx.date]) {
      groups[tx.date] = [];
    }
    groups[tx.date].push(tx);
  });

  // Unique categories actually used + existing categories
  const allCategoryNames = Array.from(new Set(categories.map(c => c.name)));

  return (
    <div className="space-y-6">
      
      {/* Search and Filters panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm space-y-4 font-sans glow-card">
        
        <div className="space-y-1">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-1.5 font-display">
            Sổ Ghi Giao Dịch
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">Tra cứu, sắp xếp và lọc mọi hoạt động chi tiêu của bạn</p>
        </div>

        {/* Filters bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          {/* Search box */}
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo ghi chú hoặc danh mục..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-805 bg-transparent text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <CircleX className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Type filter */}
          <div className="md:col-span-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-805 bg-transparent text-sm text-slate-800 dark:text-slate-250 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
            >
              <option value="all">Tất cả loại giao dịch</option>
              <option value="income">Chỉ khoản Thu nhập</option>
              <option value="expense">Chỉ khoản Chi tiêu</option>
            </select>
          </div>

          {/* Category filter */}
          <div className="md:col-span-4">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-805 bg-transparent text-sm text-slate-800 dark:text-slate-250 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
            >
              <option value="all">Tất cả danh mục ({allCategoryNames.length})</option>
              {allCategoryNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

        </div>

      </div>

      {/* Transaction Records Grouped by Day */}
      <div className="space-y-6">
        {Object.keys(groups).map((date) => {
          const dateTxList = groups[date];

          // Calculate daily total
          let dailyExpenseTotal = 0;
          let dailyIncomeTotal = 0;

          dateTxList.forEach((tx) => {
            const convertedVal = convertCurrency(tx.amount, tx.currency as CurrencyCode, baseCurrency);
            if (tx.type === 'income') {
              dailyIncomeTotal += convertedVal;
            } else {
              dailyExpenseTotal += convertedVal;
            }
          });

          return (
            <div key={date} className="space-y-2.5 font-sans">
              
              {/* Day Header */}
              <div className="flex items-center justify-between px-2 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {formatDateLabel(date)} <span className="font-mono text-[9px] normal-case bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded text-orange-400">({date})</span>
                </span>
                
                <div className="flex items-center gap-3 font-mono">
                  {dailyIncomeTotal > 0 && (
                    <span className="text-emerald-500 flex items-center gap-0.5 font-bold">
                      +{formatCurrency(dailyIncomeTotal, baseCurrency)}
                    </span>
                  )}
                  {dailyExpenseTotal > 0 && (
                    <span className="text-slate-500 dark:text-slate-400 font-bold">
                      -{formatCurrency(dailyExpenseTotal, baseCurrency)}
                    </span>
                  )}
                </div>
              </div>

              {/* Day's Transactions list */}
              <div className="space-y-2">
                {dateTxList.map((tx) => {
                  const isIncome = tx.type === 'income';
                  
                  // Decide icon
                  const matchedCategory = categories.find(c => c.name === tx.category);
                  const iconName = matchedCategory?.iconName || 'Tag';
                  const IconComp = iconMap[iconName] || Tag;

                  return (
                    <div 
                      key={tx.id} 
                      className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-805 p-4 rounded-xl flex items-center justify-between transition-all hover:border-orange-500/20 hover:shadow-sm"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        
                        {/* Transaction indicator badge */}
                        <div className={`p-2.5 rounded-xl flex-shrink-0 ${isIncome ? 'bg-emerald-50 dark:bg-emerald-950/25 text-emerald-600 dark:text-emerald-400' : 'bg-orange-50 dark:bg-orange-950/25 text-orange-600 dark:text-orange-400'}`}>
                          {isIncome ? <ArrowUpRight className="w-4.5 h-4.5 animate-pulse" /> : <ArrowDownLeft className="w-4.5 h-4.5" />}
                        </div>

                        {/* Transaction info block */}
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                              {tx.note}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono">
                              <IconComp className="w-2.5 h-2.5 text-slate-400" /> {tx.category}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                            {tx.currency !== baseCurrency && (
                              <span className="font-mono text-[9px] bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 px-1 py-0.5 rounded font-black uppercase">
                                Gốc: {formatCurrency(tx.amount, tx.currency as CurrencyCode)}
                              </span>
                            )}
                          </div>
                        </div>

                      </div>

                      {/* Right amount and delete handles */}
                      <div className="flex items-center gap-4 ml-4">
                        <span className={`text-sm md:text-base font-black font-mono tracking-tight ${isIncome ? 'text-emerald-500' : 'text-slate-700 dark:text-slate-200'}`}>
                          {isIncome ? '+' : '-'}{formatCurrency(tx.amount, tx.currency as CurrencyCode)}
                        </span>

                        <button
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all cursor-pointer"
                          title="Xóa giao dịch"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          );
        })}

        {filteredTransactions.length === 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-12 text-center rounded-2xl space-y-3">
            <CircleHelp className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-300">Không tìm thấy giao dịch nào phù hợp.</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Thử thay đổi từ khóa tìm kiếm hoặc đặt lại các bộ lọc xem nhé!</p>
            </div>
            
            {(search || filterType !== 'all' || filterCategory !== 'all') && (
              <button
                onClick={() => {
                  setSearch('');
                  setFilterType('all');
                  setFilterCategory('all');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Đặt lại bộ lọc
              </button>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
