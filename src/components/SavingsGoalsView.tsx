/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  PiggyBank, 
  Trash2, 
  PlusCircle, 
  Target, 
  Clock,
  CircleHelp
} from 'lucide-react';
import { SavingGoal, CurrencyCode } from '../types';
import { formatCurrency, getTodayString } from '../utils';

interface SavingsGoalsViewProps {
  savingGoals: SavingGoal[];
  baseCurrency: CurrencyCode;
  onAddGoal: (g: Omit<SavingGoal, 'id'>) => void;
  onUpdateGoalAmount: (id: string, newAmount: number) => void;
  onDeleteGoal: (id: string) => void;
}

export function SavingsGoalsView({
  savingGoals,
  baseCurrency,
  onAddGoal,
  onUpdateGoalAmount,
  onDeleteGoal,
}: SavingsGoalsViewProps) {
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [targetAmount, setTargetAmount] = useState<string>('');
  const [currentAmount, setCurrentAmount] = useState<string>('0');
  const [deadline, setDeadline] = useState<string>(getTodayString());
  const [currency, setCurrency] = useState<CurrencyCode>(baseCurrency);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Quick action adjust amount per goal
  const [adjustingGoalId, setAdjustingGoalId] = useState<string | null>(null);
  const [adjustValue, setAdjustValue] = useState<string>('');
  const [adjustType, setAdjustType] = useState<'deposit' | 'withdraw'>('deposit');
  const [adjustErrorMsg, setAdjustErrorMsg] = useState<string | null>(null);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const target = parseFloat(targetAmount);
    const current = parseFloat(currentAmount);

    if (isNaN(target) || target <= 0) {
      setErrorMsg('Vui lòng nhập định mức mục tiêu lớn hơn 0.');
      return;
    }
    if (isNaN(current) || current < 0) {
      setErrorMsg('Vui lòng nhập số tiền hiện hữu chính xác.');
      return;
    }

    onAddGoal({
      name: name.trim() || 'Mục tiêu không tên',
      targetAmount: target,
      currentAmount: current,
      deadline,
      currency,
    });

    // Reset fields
    setName('');
    setTargetAmount('');
    setCurrentAmount('0');
    setDeadline(getTodayString());
    setShowAddForm(false);
  };

  const handleAdjustSubmit = (id: string) => {
    setAdjustErrorMsg(null);
    const val = parseFloat(adjustValue);
    if (isNaN(val) || val <= 0) {
      setAdjustErrorMsg('Vui lòng nhập một số lượng tiền chính xác.');
      return;
    }

    const matched = savingGoals.find((g) => g.id === id);
    if (!matched) return;

    let newAmt = matched.currentAmount;
    if (adjustType === 'deposit') {
      newAmt += val;
    } else {
      newAmt = Math.max(0, newAmt - val);
    }

    onUpdateGoalAmount(id, newAmt);
    setAdjustValue('');
    setAdjustingGoalId(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Dynamic Header with Create Trigger */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-4 sm:items-center justify-between font-sans glow-card">
        <div className="space-y-0.5">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-1.5 font-display">
            <PiggyBank className="w-5 h-5 text-orange-500" /> Quỹ Tích Lũy & Tiết Kiệm
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">Đặt kế hoạch nuôi heo đất thông minh cho những niềm vui lớn</p>
        </div>

        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setErrorMsg(null);
          }}
          className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-550 text-white font-bold text-xs flex items-center justify-center gap-1.5 self-start sm:self-center transition-all shadow-sm cursor-pointer font-display"
        >
          {showAddForm ? 'Hủy tạo quỹ' : 'Thiết lập quỹ mới'}
        </button>
      </div>

      {/* Goal creation Form layout Drawer style */}
      {showAddForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-2xl shadow-md animate-fade-in font-sans glow-card">
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 border-b border-sans-100 dark:border-slate-800 pb-2 flex items-center gap-1 font-display">
              <Target className="w-4 h-4 text-orange-500" /> Tạo Mục tiêu Tài chính Mới
            </h3>

            {errorMsg && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs rounded-xl font-bold">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-550 dark:text-slate-400">Tên quỹ / Dự án</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Mua Macbook Pro, Đi du lịch Nhật Bản..."
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrorMsg(null);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-550 dark:text-slate-400">Số tiền cần tiết kiệm</label>
                  <input
                    type="number"
                    required
                    placeholder="Định mức đề ra"
                    value={targetAmount}
                    onChange={(e) => {
                      setTargetAmount(e.target.value);
                      setErrorMsg(null);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-550 dark:text-slate-400">Số tiền có sẵn hiện hữu</label>
                  <input
                    type="number"
                    required
                    placeholder="Mức ban đầu"
                    value={currentAmount}
                    onChange={(e) => {
                      setCurrentAmount(e.target.value);
                      setErrorMsg(null);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-550 dark:text-slate-400">Loại tiền tệ ước tính</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-800 dark:text-slate-200"
                >
                  <option value="VND">VND</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="JPY">JPY</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-550 dark:text-slate-400">Thời hạn dự kiến hoàn thành</label>
                <input
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-800 dark:text-slate-200"
                />
              </div>

            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-555 text-white font-black text-xs md:text-sm cursor-pointer font-display transition-all"
            >
              Phát hành Quỹ mới ngay
            </button>
          </form>
        </div>
      )}

      {/* List of active saving goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {savingGoals.map((g) => {
          const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) || 0;
          const isCompleted = g.currentAmount >= g.targetAmount;
          const isAdjusting = adjustingGoalId === g.id;

          // Remaining days helper
          const dLine = new Date(g.deadline);
          const today = new Date();
          const diffTime = dLine.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          return (
            <div 
              key={g.id} 
              className={`bg-white dark:bg-slate-900 border p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between glow-card ${isCompleted ? 'border-emerald-100 dark:border-emerald-900 bg-emerald-50/5 dark:bg-emerald-950/5' : 'border-slate-150 dark:border-slate-800/85'}`}
            >
              <div className="space-y-4">
                {/* Card title and trash */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest leading-none font-sans">QUỸ TIẾT KIỆM</span>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5 font-display">
                      {g.name}
                    </h3>
                  </div>

                  <button
                    onClick={() => onDeleteGoal(g.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
                    title="Xóa mục tiêu"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Info parameters */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100/50 dark:border-slate-850">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Định mức</span>
                    <span className="font-extrabold text-slate-800 dark:text-white font-mono">{formatCurrency(g.targetAmount, g.currency as CurrencyCode)}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Đã tích lũy</span>
                    <span className="font-extrabold text-slate-800 dark:text-white font-mono">{formatCurrency(g.currentAmount, g.currency as CurrencyCode)}</span>
                  </div>
                  <div className="space-y-0.5 col-span-2 pt-1 flex items-center gap-1 text-slate-400 font-mono text-[10px]">
                    <Clock className="w-3.5 h-3.5 text-orange-500" />
                    <span>Thời hạn: {g.deadline} • {diffDays > 0 ? `Còn ${diffDays} ngày` : 'Quá hạn'}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-350 font-mono">
                    <span>Mức tích lũy:</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="w-full bg-slate-150 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-orange-500 to-rose-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Accumulate adjusting buttons drawer inside card footer */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                {isAdjusting ? (
                  <div className="space-y-3 font-sans">
                    {adjustErrorMsg && (
                      <div className="p-2 bg-rose-50 dark:bg-rose-955/20 border border-rose-200/40 text-rose-600 dark:text-rose-400 text-[11px] rounded-lg font-bold">
                        {adjustErrorMsg}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <select
                        value={adjustType}
                        onChange={(e) => setAdjustType(e.target.value as any)}
                        className="text-xs font-bold border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-orange-500 outline-none text-slate-850 dark:text-slate-300"
                      >
                        <option value="deposit">Gửi thêm (+)</option>
                        <option value="withdraw">Rút bớt (-)</option>
                      </select>
                      
                      <input
                        type="number"
                        placeholder="Số tiền..."
                        value={adjustValue}
                        onChange={(e) => {
                          setAdjustValue(e.target.value);
                          setAdjustErrorMsg(null);
                        }}
                        className="w-full text-xs font-mono px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAdjustSubmit(g.id)}
                        className="flex-1 py-1.5 px-3 bg-orange-600 hover:bg-orange-550 duration-150 text-white font-bold text-[11px] rounded-lg cursor-pointer"
                      >
                        Xác nhận
                      </button>
                      <button
                        onClick={() => {
                          setAdjustingGoalId(null);
                          setAdjustErrorMsg(null);
                        }}
                        className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-805 text-slate-650 dark:text-slate-350 font-bold text-[11px] rounded-lg cursor-pointer"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setAdjustingGoalId(g.id);
                      setAdjustType('deposit');
                      setAdjustValue('');
                      setAdjustErrorMsg(null);
                    }}
                    className="w-full py-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-805 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-orange-500 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-orange-500 animate-pulse" /> Điều chỉnh tích lũy
                  </button>
                )}
              </div>

            </div>
          );
        })}

        {savingGoals.length === 0 && (
          <div className="col-span-full bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 p-12 text-center rounded-2xl space-y-3 font-sans glow-card">
            <CircleHelp className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-705" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-350 font-display">Không tìm thấy kế hoạch tiết kiệm nào.</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">Hãy thêm ước vọng sở hữu hoặc khoản quỹ cá nhân để thúc đẩy tích lũy nhé!</p>
            </div>
            
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-550 text-white text-xs font-black rounded-xl transition-all cursor-pointer font-display"
              >
                Tạo một quỹ tích lũy ngay
              </button>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
