/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Bot, 
  Clock, 
  Coins, 
  UserCheck, 
  HelpCircle, 
  AlertCircle, 
  ArrowRight,
  RefreshCw,
  PiggyBank
} from 'lucide-react';
import { UserInfo, Transaction, SavingGoal, CurrencyCode } from '../types';
import { MarkdownView } from './MarkdownView';
import { formatCurrency, convertCurrency } from '../utils';

interface AIAdvisorViewProps {
  userInfo: UserInfo;
  transactions: Transaction[];
  savingGoals: SavingGoal[];
  baseCurrency: CurrencyCode;
  setCurrentTab: (tab: string) => void;
}

// Encouraging load messages
const LOADING_FACTS = [
  "HenHy đang lục lọi heo đất và bóp ví của bạn...",
  "Đang thống kê thói quen trà sữa, cà phê sắm sửa...",
  "Henry đang đo đếm các mục tiêu tậu nhà, mua xe...",
  "Đang kết nối siêu trí tuệ để phác họa tương lai...",
  "Chuẩn bị phát hành cẩm nang sống chill không lo nợ nần cho bạn..."
];

export function AIAdvisorView({
  userInfo,
  transactions,
  savingGoals,
  baseCurrency,
  setCurrentTab,
}: AIAdvisorViewProps) {
  const [report, setReport] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [loadMsgIdx, setLoadMsgIdx] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Load cached report
  useEffect(() => {
    const cached = localStorage.getItem('henhy_ai_report');
    if (cached) {
      setReport(cached);
    }
  }, []);

  // Update loading message cyclically
  useEffect(() => {
    let timer: any;
    if (loading) {
      timer = setInterval(() => {
        setLoadMsgIdx((prev) => (prev + 1) % LOADING_FACTS.length);
      }, 3500);
    }
    return () => clearInterval(timer);
  }, [loading]);

  const handleGenerateReport = async () => {
    setLoading(true);
    setError(null);
    setLoadMsgIdx(0);

    try {
      // 1. Filter transactions from the last 7 days only
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const dateLimit = sevenDaysAgo.toISOString().split('T')[0];

      const last7DaysTransactions = transactions.filter(tx => tx.date >= dateLimit);

      // 2. Query server API route
      const response = await fetch('/api/gemini/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInfo,
          transactions: last7DaysTransactions,
          savingGoals,
          baseCurrency,
        }),
      });

      const text = await response.text();
      let data: any = null;

      try {
        data = JSON.parse(text);
      } catch (parseError) {
        throw new Error(
          response.ok
            ? `API trả về dữ liệu không đúng định dạng JSON: ${text.slice(0, 200)}`
            : `Lỗi API ${response.status}: ${text.slice(0, 200)}`
        );
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Tuyệt đỉnh AI đang bận, vui lòng thử lại sau ít phút.');
      }

      setReport(data.report);
      localStorage.setItem('henhy_ai_report', data.report);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Lỗi kết nối máy chủ HenHy. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Profile completeness check
  const isProfileIncomplete = !userInfo.name || !userInfo.income;

  return (
    <div className="space-y-6">
      
      {/* Personalized AI Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row gap-5 items-start justify-between font-sans glow-card">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 font-black font-sans text-[10px] rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 uppercase tracking-widest leading-none">
            <Sparkles className="w-3.5 h-3.5" /> Báo cáo tài chính cá nhân hóa
          </div>
          
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 font-display">
              <Bot className="w-5 h-5 text-orange-500 animate-pulse" /> Tri kỷ Tài chính: HenHy AI Advisor
            </h2>
            <p className="text-xs md:text-sm text-slate-550 dark:text-slate-400 leading-relaxed">
              Dựa trên thông tin họ tên, nghề nghiệp, nguồn thu nhập, mục tiêu tài chính độc quyền của bạn để dệt nên giải pháp tiết kiệm tối ưu, chi tiêu sành điệu mà vẫn an toàn giữ ví!
            </p>
          </div>

          {/* Quick Info tag preview */}
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-lg flex items-center gap-1 font-mono">
              <UserCheck className="w-3 h-3 text-emerald-500" /> 
              {userInfo.name ? `${userInfo.name} (${userInfo.job || 'Chưa đặt nghề'})` : 'Chưa định danh người dùng'}
            </span>
            <span className="text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-lg flex items-center gap-1 font-mono">
              <Coins className="w-3 h-3 text-amber-500" />
              Tổng thu: {userInfo.income || 'Chưa cung cấp'}
            </span>
          </div>
        </div>

        {/* Action Button to Generate */}
        <div className="w-full md:w-auto flex-shrink-0 pt-2 md:pt-0">
          <button
            onClick={handleGenerateReport}
            disabled={loading}
            className="w-full md:w-auto px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-550 text-white font-bold text-xs shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer font-display"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {report ? 'Yêu cầu phân tích lại' : 'Lập báo cáo tài chính ngay'}
          </button>
        </div>
      </div>

      {/* Profile Incomplete Warning Banner */}
      {isProfileIncomplete && (
        <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-2xl text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/60 dark:text-amber-400 flex flex-col sm:flex-row gap-3.5 items-start justify-between font-sans">
          <div className="flex gap-2.5">
            <AlertCircle className="w-5.5 h-5.5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold font-display">Bổ sung "Thông tin người dùng" để AI Advisor sắc bén hơn!</h4>
              <p className="text-xs text-amber-700/90 dark:text-amber-400/80 leading-relaxed">
                Khi có đầy đủ thông tin về năm sinh, quê quán, nơi sống, thu nhập, HenHy AI Advisor sẽ đưa ra các dự đoán chi tiêu, chiến lược phân bổ dòng tiền chuẩn xác 100% dành riêng cho bạn.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setCurrentTab('user-info')}
            className="text-xs font-bold bg-amber-600/10 hover:bg-amber-600/20 text-amber-700 dark:text-amber-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5 self-end sm:self-center transition-all whitespace-nowrap cursor-pointer"
          >
            Điền thông tin <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main advisor content workspace */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-6 md:p-8 rounded-2xl shadow-sm min-h-[300px] flex flex-col justify-between glow-card">
        
        {loading ? (
          /* Loading State animation wrapper */
          <div className="my-16 text-center space-y-5 animate-pulse max-w-md mx-auto font-sans">
            <div className="relative inline-block">
              <div className="absolute inset-0 rounded-full bg-orange-500/10 blur-xl animate-ping" />
              <div className="relative bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 p-5 rounded-full shadow-lg">
                <Bot className="w-10 h-10 animate-pulse" />
              </div>
            </div>
            
            <div className="space-y-2.5">
              <h4 className="text-base font-black text-slate-900 dark:text-white font-display">HenHy AI đang tính toán...</h4>
              <p className="text-xs text-orange-600 dark:text-orange-400 font-bold font-mono bg-orange-50 dark:bg-orange-950/20 px-3.5 py-1.5 rounded-xl border border-orange-100/40">
                {LOADING_FACTS[loadMsgIdx]}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-550">Quá trình này tốn khoảng 5 - 10 giây để dệt nên báo cáo cực kỳ chất lượng.</p>
            </div>
          </div>
        ) : error ? (
          /* Error feedback panel */
          <div className="my-12 text-center max-w-sm mx-auto space-y-4 font-sans">
            <AlertCircle className="w-12 h-12 mx-auto text-rose-600" />
            <div className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display">Thất bại khi xuất báo cáo</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {error}
              </p>
            </div>
            <button
              onClick={handleGenerateReport}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-755 font-bold text-xs rounded-xl cursor-pointer"
            >
              Thử lại ngay
            </button>
          </div>
        ) : report ? (
          /* Successful report presentation */
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Sparkles className="w-5 h-5 text-orange-500 animate-pulse" />
              <h3 className="text-base font-black text-slate-900 dark:text-white font-display">Thư khuyên: Cố vấn Tài chính HenHy AI</h3>
            </div>

            <div className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-250">
              <MarkdownView content={report} />
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 dark:text-slate-550 gap-3 font-sans">
              <span className="flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-orange-500" /> Báo cáo được lập dựa trên 7 ngày giao dịch hoạt động gần đây của bạn
              </span>
              <button
                onClick={handleGenerateReport}
                className="text-orange-600 dark:text-orange-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                Cập nhật báo cáo mới <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* Empty Initial State */
          <div className="text-center my-16 space-y-4 max-w-sm mx-auto font-sans">
            <Bot className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-705 animate-bounce" />
            <div className="space-y-1.5">
              <h4 className="text-sm font-black text-slate-800 dark:text-slate-300 font-display">Nhận báo cáo tài chính thông minh 7 ngày</h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                HenHy AI sẽ phân tích mọi thói quen lãng phí, xu hướng tiêu dùng, dự đoán dòng tiền tương lai và hướng giải quyết giúp túi tiền của bạn dày lên từng ngày.
              </p>
            </div>
            <button
              onClick={handleGenerateReport}
              className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-555 text-white font-black text-xs cursor-pointer font-display"
            >
              Bắt đầu phân tích
            </button>
          </div>
        )}

      </div>

    </div>
  );
}
