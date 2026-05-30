/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Flame, Sun, Moon, Sparkles, PiggyBank, Settings, DollarSign, Wallet } from 'lucide-react';
import { CurrencyCode } from '../types';
import { formatCurrency } from '../utils';

interface HeaderProps {
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  baseCurrency: CurrencyCode;
  totalBalance: number;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export function Header({
  theme,
  setTheme,
  baseCurrency,
  totalBalance,
  currentTab,
  setCurrentTab,
}: HeaderProps) {
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20 font-sans">
          
          {/* Logo Section */}
          <div 
            onClick={() => setCurrentTab('dashboard')} 
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 opacity-75 blur-sm group-hover:opacity-100 transition duration-300"></div>
              <div className="relative bg-slate-900 text-white p-2 rounded-full shadow-lg flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-400 group-hover:text-amber-300 animate-pulse transition-all" />
              </div>
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl md:text-2xl font-display font-black tracking-tight bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 bg-clip-text text-transparent">
                  Henry
                </span>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 font-display">
                  HENHY
                </span>
              </div>
              <span className="text-[9px] text-slate-500 dark:text-slate-400 tracking-wider uppercase font-mono font-bold leading-none mt-0.5">
                Sống Chill Không Lo Nợ
              </span>
            </div>
          </div>

          {/* Quick Balance Preview / Mid bar */}
          <div className="hidden md:flex items-center gap-3 px-4.5 py-2 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-inner">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5 text-slate-400" /> Số dư khả dụng:
            </span>
            <span className={`text-sm font-bold font-mono ${totalBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
              {formatCurrency(totalBalance, baseCurrency)}
            </span>
          </div>

          {/* Controls Section */}
          <div className="flex items-center gap-2 md:gap-4">
            
            {/* Quick Balance Mobile view indicator */}
            <div className="md:hidden flex flex-col items-end mr-1 select-none">
              <span className="text-[9px] text-slate-400 uppercase font-mono">Số dư</span>
              <span className={`text-xs font-bold font-mono ${totalBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                {formatCurrency(totalBalance, baseCurrency)}
              </span>
            </div>

            {/* Light/Dark Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-orange-50 dark:hover:bg-orange-950/30 text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 border border-slate-200 dark:border-slate-800 transition-all duration-200 cursor-pointer"
              title={theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 md:w-5 h-5 transition-transform hover:rotate-12" />
              ) : (
                <Sun className="w-4 h-4 md:w-5 h-5 transition-transform hover:-rotate-12" />
              )}
            </button>

            {/* Settings Quick Tab shortcut */}
            <button
              onClick={() => setCurrentTab('settings')}
              className={`p-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                currentTab === 'settings' || currentTab === 'user-info'
                  ? 'border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800/85'
              }`}
              title="Cài đặt hệ thống"
            >
              <Settings className="w-4 h-4 md:w-5 h-5 animate-spin-hover" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
