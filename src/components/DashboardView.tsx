/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Plus, 
  ArrowRight, 
  PiggyBank, 
  Percent, 
  ChevronRight,
  Activity,
  Calendar,
  Utensils,
  Car,
  Home,
  Film,
  HeartPulse,
  ShoppingBag,
  Briefcase,
  Laptop,
  Award,
  CircleHelp,
  Tag
} from 'lucide-react';
import { Transaction, SavingGoal, Category, CurrencyCode } from '../types';
import { formatCurrency, convertCurrency, getTodayString } from '../utils';

interface DashboardViewProps {
  transactions: Transaction[];
  savingGoals: SavingGoal[];
  categories: Category[];
  baseCurrency: CurrencyCode;
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
  setCurrentTab: (tab: string) => void;
}

// Icon helper to correspond to lucide icons
export const iconMap: Record<string, React.ComponentType<any>> = {
  Utensils,
  Car,
  Home,
  Film,
  HeartPulse,
  ShoppingBag,
  Briefcase,
  Laptop,
  Award,
  TrendingUp,
  Tag
};

export function DashboardView({
  transactions,
  savingGoals,
  categories,
  baseCurrency,
  onAddTransaction,
  setCurrentTab,
}: DashboardViewProps) {
  // Local state for Quick Add Transaction Form
  const [amount, setAmount] = useState<string>('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [currency, setCurrency] = useState<CurrencyCode>(baseCurrency);
  const [date, setDate] = useState<string>(getTodayString());
  const [addSuccess, setAddSuccess] = useState<string | null>(null);

  // Filter categories by type
  const filteredCategories = categories.filter(c => c.type === type);

  // Handle auto-selected category if empty or mismatched on type switch
  React.useEffect(() => {
    if (filteredCategories.length > 0) {
      setCategory(filteredCategories[0].name);
    } else {
      setCategory('Khác');
    }
  }, [type, categories]);

  // Calculations relative to the base currency
  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach((tx) => {
    const converted = convertCurrency(tx.amount, tx.currency as CurrencyCode, baseCurrency);
    if (tx.type === 'income') {
      totalIncome += converted;
    } else {
      totalExpense += converted;
    }
  });

  const totalBalance = totalIncome - totalExpense;

  // Handle transaction submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ lớn hơn 0.');
      return;
    }

    onAddTransaction({
      amount: parsedAmount,
      type,
      category,
      date,
      note: note.trim() || `Giao dịch ${category}`,
      currency,
    });

    // Reset inputs
    setAmount('');
    setNote('');
    setAddSuccess('Đã thêm giao dịch thành công!');
    setTimeout(() => setAddSuccess(null), 3000);
  };

  // 5 Recent activities
  const recentTransactions = [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner & Welcome */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 border border-indigo-500/20 text-white p-6 md:p-8 shadow-xl animate-fade-in glow-indigo">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 rounded-full bg-orange-500/5 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 rounded-full bg-indigo-500/5 blur-2xl"></div>
        
        <div className="relative z-10 space-y-4 font-sans">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-widest font-black text-orange-400">Quản Lý Tài Chính HenHy</span>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight font-display">
              Sống chill không lo nợ nần, tự tin làm chủ vận mệnh! 💸
            </h2>
          </div>
          <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Hôm nay bạn đã ghi chép chi tiêu chưa? Từng đồng tiền nhỏ tiết kiệm hôm nay sẽ thắp sáng khát vọng vươn tầm của bạn ngày mai cùng HenHy.
          </p>
          <div className="pt-2 flex flex-wrap gap-2.5">
            <button 
              onClick={() => setCurrentTab('ai-advisor')}
              className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-550 hover:shadow-orange-500/20 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all duration-200 cursor-pointer font-display"
            >
              <span>Phân Tích AI ⚡</span>
            </button>
            <button 
              onClick={() => setCurrentTab('transactions')}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-all duration-200 cursor-pointer"
            >
              <span>Xem lịch sử giao dịch</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Primary Key Numbers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans">
        
        {/* Số dư tổng thể */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between glow-card">
          <div className="space-y-1.5">
            <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block font-display">Ví Số Dư Tổng (HenHy)</span>
            <span className={`text-2xl md:text-3xl font-black font-mono tracking-tight ${totalBalance >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-500'}`}>
              {formatCurrency(totalBalance, baseCurrency)}
            </span>
            <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1 font-mono">
              <Activity className="w-3 h-3 text-orange-500 animate-pulse" /> Số dư tức thời của bạn
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 flex items-center justify-center">
            <Wallet className="w-5.5 h-5.5" />
          </div>
        </div>

        {/* Tổng Thu Nhập */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between glow-card">
          <div className="space-y-1.5">
            <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block font-display">Tổng Khoản Thu Có</span>
            <span className="text-2xl md:text-3xl font-black font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalIncome, baseCurrency)}
            </span>
            <div className="text-[11px] text-emerald-600/90 flex items-center gap-1 font-mono">
              <TrendingUp className="w-3 h-3" /> Thu nhập dòng đã quy đổi
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-5.5 h-5.5" />
          </div>
        </div>

        {/* Tổng Chi Tiêu */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between glow-card">
          <div className="space-y-1.5">
            <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block font-display">Tổng Khoản Chi Nợ</span>
            <span className="text-2xl md:text-3xl font-black font-mono tracking-tight text-rose-500">
              {formatCurrency(totalExpense, baseCurrency)}
            </span>
            <div className="text-[11px] text-rose-500/90 flex items-center gap-1 font-mono">
              <TrendingDown className="w-3 h-3" /> Chi hoạt động đã quy đổi
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-955/20 text-rose-500 flex items-center justify-center">
            <TrendingDown className="w-5.5 h-5.5" />
          </div>
        </div>

      </div>

      {/* 3. Core Working Workspace: Quick add trans vs Recent Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans">
        
        {/* Quick Add Form Section */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm space-y-4 glow-card">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5 font-display">
                <Plus className="w-4 h-4 text-orange-500" /> Thêm nhanh giao dịch
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Phát sinh thu chi nhanh chóng chỉ trong 3 giây</p>
            </div>
            
            {/* Quick Income or or Expense Selector Switch */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-bold">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${type === 'expense' ? 'bg-orange-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Chi tiêu
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${type === 'income' ? 'bg-emerald-605 bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Thu nhập
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {addSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl text-center font-medium dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-400 transition-all">
                {addSuccess}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {/* Amount input */}
              <div className="col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Số tiền</label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Ví dụ: 50000"
                    className="w-full pl-3 pr-16 py-2.5 rounded-xl border border-slate-200 dark:border-slate-850 bg-transparent text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  
                  {/* Currency Selector */}
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                    className="absolute right-1 top-1 bottom-1 text-xs font-bold border-0 bg-slate-100 dark:bg-slate-800 text-slate-705 dark:text-slate-300 rounded-lg px-2.5 outline-none cursor-pointer"
                  >
                    <option value="VND">VND</option>
                    <option value="USD">USD</option>
                    <option value="EUR">€ EUR</option>
                    <option value="JPY">¥ JPY</option>
                  </select>
                </div>
              </div>

              {/* Category selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Danh mục</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-855 bg-transparent text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                >
                  {filteredCategories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                  {filteredCategories.length === 0 && <option value="Khác">Khác</option>}
                </select>
              </div>

              {/* Date pick */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Ngày phát sinh</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-855 bg-transparent text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Note input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Ghi chú / Mô tả</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ví dụ: Ăn phở bò sáng ngon lành..."
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-855 bg-transparent text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <button
              type="submit"
              className={`w-full py-2.5 rounded-xl text-white font-bold text-xs md:text-sm flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer font-display ${type === 'income' ? 'bg-emerald-600 hover:bg-emerald-550 shadow-emerald-500/10' : 'bg-orange-600 hover:bg-orange-550 shadow-orange-550/10'}`}
            >
              <Plus className="w-4 h-4" /> Thêm giao dịch ngay
            </button>
          </form>
        </div>

        {/* Recent Transactions list */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm space-y-4 glow-card">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5 font-display">
                <Activity className="w-4 h-4 text-orange-500" /> Biến động dòng tiền gần đây
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Các hoạt động tài chính mới cập nhật</p>
            </div>
            
            <button
              onClick={() => setCurrentTab('transactions')}
              className="text-xs text-orange-600 dark:text-orange-400 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              Xem tất cả <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentTransactions.map((tx) => {
              // Find matching category to display matching icon
              const matchedCategory = categories.find(c => c.name === tx.category);
              const customIconName = matchedCategory?.iconName || 'Tag';
              const IconComponent = iconMap[customIconName] || Tag;

              const isIncome = tx.type === 'income';

              return (
                <div 
                  key={tx.id} 
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 border border-slate-100/60 dark:border-slate-850 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${isIncome ? 'bg-emerald-50 dark:bg-emerald-950/25 text-emerald-600 dark:text-emerald-400' : 'bg-orange-50 dark:bg-orange-950/25 text-orange-600 dark:text-orange-400'}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-905 dark:text-white block">
                        {tx.note}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-505 flex items-center gap-1 font-mono hover:text-orange-550 transition-all">
                        <Calendar className="w-3 h-3 text-orange-550" /> {tx.date} • {tx.category}
                      </span>
                    </div>
                  </div>

                  <span className={`text-sm font-black font-mono tracking-tight ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-200'}`}>
                    {isIncome ? '+' : '-'}{formatCurrency(tx.amount, tx.currency as CurrencyCode)}
                  </span>
                </div>
              );
            })}

            {recentTransactions.length === 0 && (
              <div className="py-12 text-center space-y-2">
                <CircleHelp className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
                <p className="text-xs text-slate-400 dark:text-slate-500">Chưa có giao dịch nào được ghi nhận.</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Hãy thêm một giao dịch ở form bên cạnh nhé!</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 4. Active Saving goals overview */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-805 p-5 rounded-2xl shadow-sm space-y-4 glow-card font-sans">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5 font-display">
              <PiggyBank className="w-4.5 h-4.5 text-orange-500" /> Tiến độ mục tiêu tích lũy
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">Quỹ tài chính tương lai của riêng bạn</p>
          </div>
          
          <button
            onClick={() => setCurrentTab('saving-goals')}
            className="text-xs text-orange-600 dark:text-orange-400 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            Quản lý quỹ <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {savingGoals.slice(0, 3).map((goal) => {
            const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) || 0;
            return (
              <div key={goal.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/55 dark:bg-slate-900/50 space-y-3 hover:border-orange-500/20 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate pr-2">{goal.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 rounded-full font-extrabold shadow-sm">
                    {pct}%
                  </span>
                </div>

                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  <span>{formatCurrency(goal.currentAmount, goal.currency as CurrencyCode)}</span>
                  <span>{formatCurrency(goal.targetAmount, goal.currency as CurrencyCode)}</span>
                </div>
              </div>
            );
          })}

          {savingGoals.length === 0 && (
            <div className="col-span-full py-8 text-center space-y-1">
              <PiggyBank className="w-7 h-7 mx-auto text-slate-300 dark:text-slate-700 animate-bounce" />
              <p className="text-xs text-slate-400 dark:text-slate-500">Chưa thiết lập quỹ tiết kiệm cá nhân nào.</p>
              <button 
                onClick={() => setCurrentTab('saving-goals')}
                className="text-[11px] text-orange-600 dark:text-orange-400 font-black hover:underline cursor-pointer"
              >
                Tạo quỹ mới ngay
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
