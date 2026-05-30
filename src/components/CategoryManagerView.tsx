/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Tag, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Sparkles,
} from 'lucide-react';
import { Category } from '../types';
import { iconMap } from './DashboardView';

interface CategoryManagerViewProps {
  categories: Category[];
  onAddCategory: (c: Omit<Category, 'id'>) => void;
  onDeleteCategory: (id: string) => void;
}

const PRESET_ICONS = [
  { name: 'Utensils', label: 'Ăn uống / Nhà hàng' },
  { name: 'Car', label: 'Di chuyển / Xe cộ' },
  { name: 'Home', label: 'Nhà cửa / Hóa đơn' },
  { name: 'Film', label: 'Giải trí / Điện ảnh' },
  { name: 'HeartPulse', label: 'Sức khỏe / Bảo hiểm' },
  { name: 'ShoppingBag', label: 'Mua sắm / Quần áo' },
  { name: 'Briefcase', label: 'Lương bổng / Trụ cột' },
  { name: 'Laptop', label: 'Freelance / Việc ngoài' },
  { name: 'Award', label: 'Khen thưởng / Quà cáp' },
  { name: 'TrendingUp', label: 'Đầu tư / Sinh tài' },
  { name: 'Tag', label: 'Chi tiêu khác' },
];

export function CategoryManagerView({
  categories,
  onAddCategory,
  onDeleteCategory,
}: CategoryManagerViewProps) {
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [iconName, setIconName] = useState<string>('Tag');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Vui lòng điền tên danh mục hợp lệ.');
      return;
    }

    // Check duplication
    const duplicated = categories.some(c => c.name.toLowerCase() === name.trim().toLowerCase());
    if (duplicated) {
      setErrorMsg('Tên danh mục này đã tồn tại rồi nhé!');
      return;
    }

    onAddCategory({
      name: name.trim(),
      type,
      iconName,
      isCustom: true,
    });

    setName('');
    setIconName('Tag');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header and action trigger */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-4 sm:items-center justify-between font-sans glow-card">
        <div className="space-y-0.5">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-1.5 font-display">
            <Tag className="w-5 h-5 text-orange-500" /> Sổ Danh Mục Chi Tiêu
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">Tự do phân loại thu chi để dễ dàng quản lý theo mục đích riêng</p>
        </div>

        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setErrorMsg(null);
          }}
          className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-550 text-white font-bold text-xs flex items-center justify-center gap-1.5 self-start sm:self-center transition-all shadow-sm cursor-pointer font-display"
        >
          {showAddForm ? 'Hủy thêm mới' : 'Thêm danh mục tùy chỉnh'}
        </button>
      </div>

      {/* Categories Add Form Drawer */}
      {showAddForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-2xl shadow-md animate-fade-in font-sans glow-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-1.5 font-display">
              <Sparkles className="w-4 h-4 text-orange-500 animate-pulse" /> Tạo Danh Mục Mới
            </h3>

            {errorMsg && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs rounded-xl font-bold">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Category Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-550 dark:text-slate-400">Tên danh mục mới</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nuôi mèo 🐱, Trà sữa 🧋, Sách..."
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrorMsg(null);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Type Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-550 dark:text-slate-400">Dòng tài chính tác động</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-805 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer text-slate-850 dark:text-slate-300"
                >
                  <option value="expense">Khoản Chi tiêu (-)</option>
                  <option value="income">Khoản Thu nhập (+)</option>
                </select>
              </div>

              {/* Icon selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-550 dark:text-slate-400">Hình ảnh biểu thị (Icon)</label>
                <select
                  value={iconName}
                  onChange={(e) => setIconName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-805 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer text-slate-850 dark:text-slate-300"
                >
                  {PRESET_ICONS.map((ico) => (
                    <option key={ico.name} value={ico.name}>
                      {ico.label}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-550 text-white font-black text-xs md:text-sm cursor-pointer font-display transition-all"
            >
              Thiết lập danh mục mới ngay
            </button>
          </form>
        </div>
      )}

      {/* Grid listing of standard and custom categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 font-sans">
        {categories.map((c) => {
          const IconComp = iconMap[c.iconName] || Tag;
          const isExpense = c.type === 'expense';

          return (
            <div 
              key={c.id} 
              className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-4.5 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-all glow-card hover:border-orange-500/20"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${isExpense ? 'bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400' : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'}`}>
                  <IconComp className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-sm font-bold text-slate-800 dark:text-white block">
                    {c.name}
                  </span>
                  
                  {/* Category badges */}
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded leading-none ${isExpense ? 'bg-orange-100 text-orange-600 dark:bg-orange-950/65' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/65'}`}>
                      {isExpense ? 'Khoản Chi' : 'Khoản Thu'}
                    </span>

                    {c.isCustom ? (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded leading-none bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
                        Tùy chỉnh
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded leading-none bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 flex items-center gap-0.5 font-mono">
                        <ShieldCheck className="w-2.5 h-2.5" /> Mặc định
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Show delete only if custom category */}
              {c.isCustom && (
                <button
                  onClick={() => onDeleteCategory(c.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
                  title="Xóa danh mục tùy chỉnh"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
