/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Wallet, 
  Activity, 
  PiggyBank, 
  Tag, 
  Bot, 
  Settings, 
  Sparkles,
  Award,
  BookOpen,
  BarChart3
} from 'lucide-react';

import { UserInfo, Transaction, SavingGoal, Category, CurrencyCode } from './types';
import { DEFAULT_CATEGORIES, convertCurrency, getTodayString, getYesterdayString } from './utils';

// Import Visual Views
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { TransactionsView } from './components/TransactionsView';
import { AIAdvisorView } from './components/AIAdvisorView';
import { SavingsGoalsView } from './components/SavingsGoalsView';
import { CategoryManagerView } from './components/CategoryManagerView';
import { UserInfoView } from './components/UserInfoView';
import { SettingsView } from './components/SettingsView';
import { StatsView } from './components/StatsView';

// Initial Mock data for awesome first view
const INITIAL_USER_INFO: UserInfo = {
  name: "Henry Nguyen",
  birthYear: "1998",
  hometown: "Đà Nẵng",
  location: "TP. Hồ Chí Minh",
  job: "Kỹ sư Trí tuệ Nhân tạo",
  income: "45.000.000 VND",
  financialGoal: "Tự do tài chính trước tuôi 35, sở hưu căn hộ ven biển và sống thảnh thơi không lo nợ nần."
};

const INITIAL_TRANSACTIONS = (): Transaction[] => {
  const today = getTodayString();
  const yesterday = getYesterdayString();
  return [
    {
      id: "tx-1",
      amount: 45000000,
      type: "income",
      category: "Lương",
      date: yesterday,
      note: "Nhận lương dự án chính thức",
      currency: "VND"
    },
    {
      id: "tx-2",
      amount: 65000,
      type: "expense",
      category: "Ăn uống",
      date: today,
      note: "Pha ly cà phê muối sáng cực ngon",
      currency: "VND"
    },
    {
      id: "tx-3",
      amount: 450000,
      type: "expense",
      category: "Ăn uống",
      date: yesterday,
      note: "Ăn lẩu Thái cùng hội lập trình viên",
      currency: "VND"
    },
    {
      id: "tx-4",
      amount: 150000,
      type: "expense",
      category: "Di chuyển",
      date: yesterday,
      note: "Nạp thẻ xăng xe tuần mới",
      currency: "VND"
    },
    {
      id: "tx-5",
      amount: 50,
      type: "income",
      category: "Freelance",
      date: today,
      note: "Thanh toán bug freelance cho đối tác Mỹ",
      currency: "USD"
    }
  ];
};

const INITIAL_SAVING_GOALS = (): SavingGoal[] => {
  return [
    {
      id: "goal-1",
      name: "Quỹ tiết kiệm mua MacBook Pro M4 Pro",
      targetAmount: 55000000,
      currentAmount: 18000000,
      deadline: "2026-12-31",
      currency: "VND"
    },
    {
      id: "goal-2",
      name: "Quỹ khẩn cấp chống bão giá",
      targetAmount: 20000000,
      currentAmount: 15000000,
      deadline: "2026-09-30",
      currency: "VND"
    }
  ];
};

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('henhy_theme') as 'light' | 'dark') || 'light';
  });

  const [baseCurrency, setBaseCurrency] = useState<CurrencyCode>(() => {
    return (localStorage.getItem('henhy_base_currency') as CurrencyCode) || 'VND';
  });

  const [userInfo, setUserInfo] = useState<UserInfo>(() => {
    const saved = localStorage.getItem('henhy_user_info');
    return saved ? JSON.parse(saved) : INITIAL_USER_INFO;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('henhy_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS();
  });

  const [savingGoals, setSavingGoals] = useState<SavingGoal[]>(() => {
    const saved = localStorage.getItem('henhy_saving_goals');
    return saved ? JSON.parse(saved) : INITIAL_SAVING_GOALS();
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('henhy_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Trigger dark mode injection directly
  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;
    if (theme === 'dark') {
      root.classList.add('dark');
      body?.classList.add('dark');
    } else {
      root.classList.remove('dark');
      body?.classList.remove('dark');
    }
    localStorage.setItem('henhy_theme', theme);
  }, [theme]);

  // Sycn base choices
  useEffect(() => {
    localStorage.setItem('henhy_base_currency', baseCurrency);
  }, [baseCurrency]);

  useEffect(() => {
    localStorage.setItem('henhy_user_info', JSON.stringify(userInfo));
  }, [userInfo]);

  useEffect(() => {
    localStorage.setItem('henhy_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('henhy_saving_goals', JSON.stringify(savingGoals));
  }, [savingGoals]);

  useEffect(() => {
    localStorage.setItem('henhy_categories', JSON.stringify(categories));
  }, [categories]);

  // Calculations for total balance in Base Currency
  let totalIncomeInBase = 0;
  let totalExpenseInBase = 0;

  transactions.forEach((tx) => {
    const converted = convertCurrency(tx.amount, tx.currency as CurrencyCode, baseCurrency);
    if (tx.type === 'income') {
      totalIncomeInBase += converted;
    } else {
      totalExpenseInBase += converted;
    }
  });

  const totalBalanceInBase = totalIncomeInBase - totalExpenseInBase;

  // Actions CRUD
  const handleAddTransaction = (t: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...t,
      id: `tx-${Date.now()}`
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(tx => tx.id !== id));
  };

  const handleAddGoal = (g: Omit<SavingGoal, 'id'>) => {
    const newGoal: SavingGoal = {
      ...g,
      id: `goal-${Date.now()}`
    };
    setSavingGoals(prev => [...prev, newGoal]);
  };

  const handleUpdateGoalAmount = (id: string, newAmount: number) => {
    setSavingGoals(prev => prev.map(g => g.id === id ? { ...g, currentAmount: newAmount } : g));
  };

  const handleDeleteGoal = (id: string) => {
    setSavingGoals(prev => prev.filter(g => g.id !== id));
  };

  const handleAddCategory = (c: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...c,
      id: `cat-${Date.now()}`
    };
    setCategories(prev => [...prev, newCat]);
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== id));
  };

  const handleSaveUserInfo = (info: UserInfo) => {
    setUserInfo(info);
  };

  // Master security wipe onlyfinancial data correctly as requested:
  const handleResetAllFinancialData = () => {
    setTransactions([]);
    setSavingGoals([]);
    setCategories(DEFAULT_CATEGORIES);
    
    // Wipe local storage keys regarding finances
    localStorage.removeItem('henhy_transactions');
    localStorage.removeItem('henhy_saving_goals');
    localStorage.removeItem('henhy_categories');
    localStorage.removeItem('henhy_ai_report');
    
    // Note: Theme, AppSettings baseCurrency, UserInfo, cache/offline persistence ARE PRESERVED!
  };

  // Render view
  const renderViewContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardView
            transactions={transactions}
            savingGoals={savingGoals}
            categories={categories}
            baseCurrency={baseCurrency}
            onAddTransaction={handleAddTransaction}
            setCurrentTab={setCurrentTab}
          />
        );
      case 'transactions':
        return (
          <TransactionsView
            transactions={transactions}
            categories={categories}
            baseCurrency={baseCurrency}
            onDeleteTransaction={handleDeleteTransaction}
          />
        );
      case 'stats':
        return (
          <StatsView
            transactions={transactions}
            savingGoals={savingGoals}
            categories={categories}
            baseCurrency={baseCurrency}
          />
        );
      case 'ai-advisor':
        return (
          <AIAdvisorView
            userInfo={userInfo}
            transactions={transactions}
            savingGoals={savingGoals}
            baseCurrency={baseCurrency}
            setCurrentTab={setCurrentTab}
          />
        );
      case 'saving-goals':
        return (
          <SavingsGoalsView
            savingGoals={savingGoals}
            baseCurrency={baseCurrency}
            onAddGoal={handleAddGoal}
            onUpdateGoalAmount={handleUpdateGoalAmount}
            onDeleteGoal={handleDeleteGoal}
          />
        );
      case 'categories':
        return (
          <CategoryManagerView
            categories={categories}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        );
      case 'user-info':
        return (
          <UserInfoView
            userInfo={userInfo}
            onSaveUserInfo={handleSaveUserInfo}
            setCurrentTab={setCurrentTab}
          />
        );
      case 'settings':
        return (
          <SettingsView
            baseCurrency={baseCurrency}
            setBaseCurrency={setBaseCurrency}
            userInfo={userInfo}
            onResetAllFinancialData={handleResetAllFinancialData}
            setCurrentTab={setCurrentTab}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 transition-colors duration-305">
      
      {/* 1. Header widget with togglers */}
      <Header
        theme={theme}
        setTheme={setTheme}
        baseCurrency={baseCurrency}
        totalBalance={totalBalanceInBase}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      {/* 2. Main content container */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full animate-fade-in block">
        
        {/* Navigation tabs row */}
        <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mb-6 bg-white dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/60 shadow-sm overflow-x-auto whitespace-nowrap scrollbar-none font-sans font-semibold">
          {[
            { id: 'dashboard', label: 'Bảng Số Liệu', icon: Wallet },
            { id: 'transactions', label: 'Ghi Giao Dịch', icon: Activity },
            { id: 'stats', label: 'Thống Kê', icon: BarChart3 },
            { id: 'ai-advisor', label: 'Cố Vấn AI', icon: Bot },
            { id: 'saving-goals', label: 'Mục Tiêu', icon: PiggyBank },
            { id: 'categories', label: 'Danh Mục', icon: Tag },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`px-4.5 py-2.5 rounded-xl text-xs md:text-sm flex items-center gap-2 transition-all cursor-pointer select-none ${
                  isActive
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20 font-bold font-display'
                    : 'text-slate-600 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'scale-110 animate-pulse' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic active visual view */}
        <div className="tab-view-render block">
          {renderViewContent()}
        </div>

      </main>

      {/* 3. Personalized Footer */}
      <footer className="mt-12 border-t border-slate-200/60 dark:border-slate-900/80 bg-white/70 dark:bg-slate-950/40 py-6 md:py-8 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2.5 font-sans">
          <p className="text-xs md:text-sm font-semibold text-slate-650 dark:text-slate-440 leading-relaxed max-w-4xl mx-auto">
            Dự án HenHy © 2026 — Giúp người tiêu dùng quản lý chi tiêu, sống chill không lo nợ nần - một ứng dụng được phát triển bởi MR.Henry NG. 🧡
          </p>
          <div className="flex items-center justify-center gap-4 text-[10px] uppercase tracking-wider font-mono text-slate-400 dark:text-slate-500 font-bold animate-pulse">
            <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-orange-500" /> HenHy Core v2.0.1</span>
            <span>•</span>
            <span>Sống sành điệu, Ví an toàn</span>
            <span>•</span>
            <span>Made with Gemini 3.5</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
