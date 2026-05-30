/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  UserCircle2, 
  Trash2, 
  CheckCircle, 
  AlertTriangle, 
  Coins, 
  ArrowRight,
  Printer
} from 'lucide-react';
import { CurrencyCode, UserInfo } from '../types';

interface SettingsViewProps {
  baseCurrency: CurrencyCode;
  setBaseCurrency: (c: CurrencyCode) => void;
  userInfo: UserInfo;
  onResetAllFinancialData: () => void;
  setCurrentTab: (tab: string) => void;
}

export function SettingsView({
  baseCurrency,
  setBaseCurrency,
  userInfo,
  onResetAllFinancialData,
  setCurrentTab,
}: SettingsViewProps) {
  const [showConfirmReset, setShowConfirmReset] = useState<boolean>(false);
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);

  const handleResetAction = () => {
    onResetAllFinancialData();
    setShowConfirmReset(false);
    setResetSuccess(true);
    setTimeout(() => {
      setResetSuccess(false);
      setCurrentTab('dashboard'); // Redirect back to Dashboard
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* 1. Header description */}
      <div className="space-y-1 font-sans px-2">
        <h2 className="text-xl font-black text-slate-900 dark:text-white font-display">Cài Đặt Hệ Thống HenHy</h2>
        <p className="text-xs text-slate-400 dark:text-slate-500">Cấu hình các thông số và tùy chọn hệ thống cá nhân hóa</p>
      </div>

      {/* 2. Form panel options */}
      <div className="space-y-4 font-sans">
        
        {/* Currencies settings card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm space-y-4 glow-card">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-805 pb-3">
            <Coins className="w-5 h-5 text-orange-500" />
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 font-display">Tiền tệ mặc định</h3>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Chọn đơn vị tiền tệ quy đổi chuẩn để tổng hợp toàn bộ số dư và hiển thị dòng tiền chính trên các biểu đồ phân tích.
            </p>
            
            <div className="grid grid-cols-4 gap-2.5">
              {(['VND', 'USD', 'EUR', 'JPY'] as CurrencyCode[]).map((cur) => (
                <button
                  key={cur}
                  onClick={() => setBaseCurrency(cur)}
                  className={`py-3 rounded-xl font-bold font-mono text-xs border transition-all cursor-pointer ${
                    baseCurrency === cur
                      ? 'border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400 font-extrabold'
                      : 'border-slate-200/60 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-655 dark:text-slate-350'
                  }`}
                >
                  {cur}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* User Information redirect card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm space-y-4 glow-card">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-805 pb-3">
            <div className="flex items-center gap-2">
              <UserCircle2 className="w-5 h-5 text-orange-500" />
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 font-display">Cập nhật Hồ sơ cá nhân</h3>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 bg-slate-50 dark:bg-slate-850 p-4.5 rounded-xl border border-slate-100 dark:border-slate-800/60 transition-all hover:bg-slate-100/40 dark:hover:bg-slate-800/30">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-905 dark:text-white block">
                {userInfo.name ? userInfo.name : 'Người dùng mới: HenHy'}
              </span>
              <p className="text-xs text-slate-400 dark:text-slate-500 leading-normal max-w-sm">
                Điền nhanh các thông tin họ tên, năm sinh, nghề nghiệp, thu nhập để cá nhân hóa tri thức tư vấn từ cố vấn AI Advisor.
              </p>
            </div>

            <button
              onClick={() => setCurrentTab('user-info')}
              className="p-2 w-10 h-10 rounded-xl bg-orange-600 hover:bg-orange-550 duration-150 text-white flex items-center justify-center transition-all shadow-sm cursor-pointer"
              title="Điền hồ sơ người dùng"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Financial Export shortcut card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm space-y-4 glow-card">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-805 pb-3">
            <div className="flex items-center gap-2">
              <Printer className="w-5 h-5 text-orange-500" />
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 font-display">Xuất Báo cáo Tài chính</h3>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 bg-slate-50 dark:bg-slate-850 p-4.5 rounded-xl border border-slate-100 dark:border-slate-800/60 transition-all hover:bg-slate-100/40 dark:hover:bg-slate-800/30">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-905 dark:text-white block">
                Xuất tệp Excel (.csv) hoặc in trực tiếp PDF
              </span>
              <p className="text-xs text-slate-400 dark:text-slate-500 leading-normal max-w-sm">
                Tải về báo cáo sao kê hạch toán giao dịch đầy đủ, mục tiêu tích lũy hoặc in ấn bản cứng sành điệu cùng hệ sinh thái HenHy FinTech.
              </p>
            </div>

            <button
              onClick={() => setCurrentTab('stats')}
              className="p-2 w-10 h-10 rounded-xl bg-orange-600 hover:bg-orange-550 duration-150 text-white flex items-center justify-center transition-all shadow-sm cursor-pointer"
              title="Đến trang xuất báo cáo"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Master reset card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm space-y-4 glow-card">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-805 pb-3">
            <Trash2 className="w-5 h-5 text-rose-500" />
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 text-rose-600 font-display">Bảo mật & Dòng dữ liệu</h3>
          </div>

          {resetSuccess ? (
            <div className="p-4 bg-emerald-50 border border-emerald-250 text-emerald-700 rounded-xl flex items-center gap-2.5 text-xs font-medium dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-400 animate-fade-in font-display">
              <CheckCircle className="w-4.5 h-4.5 text-emerald-500 animate-pulse" />
              <span>Dọn dẹp hệ thống thành công! Toàn bộ tệp chi tiêu đã được đặt lại về 0.</span>
            </div>
          ) : showConfirmReset ? (
            <div className="p-4 bg-rose-50 border border-rose-250 rounded-2xl text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/60 dark:text-rose-400 space-y-3.5 animate-fade-in">
              <div className="flex gap-2.5">
                <AlertTriangle className="w-5.5 h-5.5 text-rose-600 flex-shrink-0 mt-0.5 animate-bounce" />
                <div className="space-y-0.5">
                  <h4 className="text-xs font-black uppercase tracking-wide font-display text-rose-600 dark:text-rose-400">Cản báo đỏ: Hành động không thể khôi phục!</h4>
                  <p className="text-xs text-rose-700 dark:text-rose-400 leading-relaxed">
                    Hệ thống sẽ <strong>xóa toàn bộ</strong> lịch sử giao dịch nợ có, tất cả các mục tiêu tiết kiệm tích chứa, và tất cả danh mục tùy biến về mặc định. 
                    Nhưng <strong>GIỮ NGUYÊN</strong> giao diện, thói quen cài đặt, đồng xu tiền tệ, và toàn bộ Profile người dùng của bạn.
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-1 font-sans">
                <button
                  type="button"
                  onClick={handleResetAction}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-550 text-white font-bold text-xs cursor-pointer font-display transition-all"
                >
                  Tôi đã hiểu, Xóa Dữ Liệu
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmReset(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-250 cursor-pointer font-display transition-all"
                >
                  Hủy bỏ
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
              <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">
                Khi túi tiền phát sinh quá nhiều lỗi hoặc bạn bắt đầu một chu kỳ năm mới, bạn có thể thiết lập đặt lại. 
                Mọi tệp số lượng sẽ được dọn dẹp nguyên vẹn mà không tác động tới cấu hình giao diện hay Hồ sơ cá nhân của bạn.
              </p>

              <button
                type="button"
                onClick={() => setShowConfirmReset(true)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer font-display"
              >
                Đặt lại & xóa toàn bộ dữ liệu giao dịch
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
