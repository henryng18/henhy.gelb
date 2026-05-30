/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Percent, 
  Download, 
  FileText, 
  Printer, 
  Sparkles, 
  Award, 
  Coffee, 
  Flame, 
  Calendar,
  Layers,
  ArrowDownToLine,
  HelpCircle,
  Clock,
  PiggyBank
} from 'lucide-react';
import { Transaction, SavingGoal, Category, CurrencyCode } from '../types';
import { formatCurrency, convertCurrency, getTodayString } from '../utils';

interface StatsViewProps {
  transactions: Transaction[];
  savingGoals: SavingGoal[];
  categories: Category[];
  baseCurrency: CurrencyCode;
}

export function StatsView({
  transactions,
  savingGoals,
  categories,
  baseCurrency,
}: StatsViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'analytics' | 'export'>('analytics');
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; date: string; amount: number } | null>(null);

  // ----------------------------------------------------
  // CALCULATIONS / DATA AGGREGATION
  // ----------------------------------------------------

  // Calculate Base totals
  const totalExpense = useMemo(() => {
    return transactions
      .filter((tx) => tx.type === 'expense')
      .reduce((sum, tx) => sum + convertCurrency(tx.amount, tx.currency as CurrencyCode, baseCurrency), 0);
  }, [transactions, baseCurrency]);

  const totalIncome = useMemo(() => {
    return transactions
      .filter((tx) => tx.type === 'income')
      .reduce((sum, tx) => sum + convertCurrency(tx.amount, tx.currency as CurrencyCode, baseCurrency), 0);
  }, [transactions, baseCurrency]);

  // Aggregate Category Expense Data for Donut Chart / Category Breakdown
  const categoryExpenses = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter((tx) => tx.type === 'expense')
      .forEach((tx) => {
        const valInBase = convertCurrency(tx.amount, tx.currency as CurrencyCode, baseCurrency);
        map[tx.category] = (map[tx.category] || 0) + valInBase;
      });

    return Object.entries(map)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, totalExpense, baseCurrency]);

  // Daily Trend Data (Last 30 Calendar Days)
  const last30DaysData = useMemo(() => {
    const list = [];
    const now = new Date();
    
    // Generate dates backwards and order chronologically
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      // Calculate total expenses and income for this day
      let dailyExp = 0;
      let dailyInc = 0;
      
      transactions.forEach((tx) => {
        if (tx.date === dateStr) {
          const valInBase = convertCurrency(tx.amount, tx.currency as CurrencyCode, baseCurrency);
          if (tx.type === 'expense') {
            dailyExp += valInBase;
          } else {
            dailyInc += valInBase;
          }
        }
      });
      
      list.push({
        date: dateStr,
        formattedDate: dateStr.substring(8, 10) + '/' + dateStr.substring(5, 7),
        expense: dailyExp,
        income: dailyInc,
      });
    }
    return list;
  }, [transactions, baseCurrency]);

  // 1. Line path computation for 30 Days trend spending line chart
  const lineChartPath = useMemo(() => {
    if (last30DaysData.length === 0) return { line: '', pathArea: '' };
    const maxVal = Math.max(...last30DaysData.map(d => d.expense), 1000); // Guard division by zero
    
    const height = 180;
    const width = 500;
    const paddingLeft = 35;
    const paddingRight = 15;
    const paddingTop = 20;
    const paddingBottom = 20;
    
    const graphWidth = width - paddingLeft - paddingRight;
    const graphHeight = height - paddingTop - paddingBottom;
    
    const points = last30DaysData.map((d, index) => {
      const x = paddingLeft + (index / (last30DaysData.length - 1)) * graphWidth;
      const y = height - paddingBottom - (d.expense / maxVal) * graphHeight;
      return { x, y, date: d.formattedDate, amount: d.expense };
    });
    
    let pathStr = '';
    let areaStr = '';
    
    if (points.length > 0) {
      pathStr = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        pathStr += ` L ${points[i].x} ${points[i].y}`;
      }
      
      // Complete area for gradient coloring
      areaStr = pathStr + ` L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;
    }
    
    return { line: pathStr, pathArea: areaStr, points, maxVal };
  }, [last30DaysData]);

  // High interest highlights
  const specialMetrics = useMemo(() => {
    // 1. Day of highest spend
    let maxSpend = 0;
    let maxSpendDay = 'Chưa ghi nhận';
    const dailyMap: Record<string, number> = {};
    
    transactions
      .filter((tx) => tx.type === 'expense')
      .forEach((tx) => {
        const valInBase = convertCurrency(tx.amount, tx.currency as CurrencyCode, baseCurrency);
        dailyMap[tx.date] = (dailyMap[tx.date] || 0) + valInBase;
      });

    Object.entries(dailyMap).forEach(([date, amt]) => {
      if (amt > maxSpend) {
        maxSpend = amt;
        maxSpendDay = date;
      }
    });

    // 2. Count Chill activities like "Milk Tea / Coffee"
    const chillKeywords = ['trà sữa', 'cà phê', 'cafe', 'phở', 'ăn sáng', ' Highlands', 'Starbucks', ' Phúc Long', 'mèo'];
    const chillSpendCount = transactions.filter((tx) => {
      const matchedKeyword = chillKeywords.some(keyword => tx.note.toLowerCase().includes(keyword));
      return matchedKeyword || tx.category === 'Ăn uống';
    }).length;

    // 3. Average daily spend
    const uniqueDays = Object.keys(dailyMap).length;
    const avgDailySpend = uniqueDays > 0 ? (totalExpense / uniqueDays) : 0;

    return {
      peakDay: maxSpendDay,
      peakAmount: maxSpend,
      chillCount: chillSpendCount,
      avgSpend: avgDailySpend,
      topExpenseCategory: categoryExpenses[0]?.name || 'N/A'
    };
  }, [transactions, totalExpense, categoryExpenses, baseCurrency]);

  // ----------------------------------------------------
  // EXPORT UTILITIES
  // ----------------------------------------------------

  // Download Transactions as Excel-supported UTF-8 CSV with BOM
  const exportTransactionsToCSV = () => {
    let csvContent = '\uFEFF'; // Excel BOM
    csvContent += 'Mã Giao Dịch,Số Tiền,Loại Giao Dịch,Danh Mục,Ngày Tháng,Ghi Chú,Loại Tiền Tệ\n';

    transactions.forEach((tx) => {
      const row = [
        tx.id,
        tx.amount,
        tx.type === 'income' ? 'Thu Nhập' : 'Chi Tiêu',
        tx.category,
        tx.date,
        `"${tx.note.replace(/"/g, '""')}"`,
        tx.currency
      ].join(',');
      csvContent += row + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `henhy_giao_dich_${getTodayString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download Saving Goals as Excel-supported UTF-8 CSV with BOM
  const exportSavingGoalsToCSV = () => {
    let csvContent = '\uFEFF'; 
    csvContent += 'Mã Mục Tiêu,Tên Hoạt Động,Mức Đặt Ra,Thực Tế Đã Tích Lũy,Hạn Hoàn Thành,Loại Tiền Tệ,Trạng Thái\n';

    savingGoals.forEach((g) => {
      const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) || 0;
      const row = [
        g.id,
        `"${g.name.replace(/"/g, '""')}"`,
        g.targetAmount,
        g.currentAmount,
        g.deadline,
        g.currency,
        pct >= 100 ? 'Đã hoàn thành 🎉' : `Đang nuôi heo (${pct}%)`
      ].join(',');
      csvContent += row + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `henhy_quy_tiet_kiem_${getTodayString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trigger Native Print-to-PDF Window with beautiful printable layout
  const handlePrintToPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Elegant Header with Segmented tab switcher */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center justify-between font-sans glow-card">
        <div className="space-y-0.5">
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-1.5 font-display">
            <BarChart3 className="w-5.5 h-5.5 text-orange-500 animate-pulse" /> Trung tâm Thống kê & Xuất Báo cáo
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">Xem trực quan xu hướng chi tiêu 30 ngày và xuất tệp dữ liệu chuyên nghiệp</p>
        </div>

        {/* Sub Navigation */}
        <div className="flex bg-slate-100 dark:bg-slate-850 p-1 rounded-xl text-xs font-bold leading-none select-none">
          <button
            onClick={() => setActiveSubTab('analytics')}
            className={`px-4.5 py-2 rounded-lg cursor-pointer transition-all ${
              activeSubTab === 'analytics'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            Biểu đồ Phân tích
          </button>
          <button
            onClick={() => setActiveSubTab('export')}
            className={`px-4.5 py-2 rounded-lg cursor-pointer transition-all ${
              activeSubTab === 'export'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            Xuất Báo cáo (Excel/PDF)
          </button>
        </div>
      </div>

      {/* 2. MAIN ACTIVE SUBTAB DISPLAY WORKSPACE */}
      {activeSubTab === 'analytics' ? (
        <div className="space-y-6 animate-fade-in">
          
          {/* Advanced Visual Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* 30-Day trend spend line model (Pure elegant SVG layout) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm flex flex-col justify-between glow-card relative group">
              <div className="space-y-1 pb-3 border-b border-slate-100 dark:border-slate-850">
                <span className="text-[10px] font-black text-orange-500 tracking-wider block uppercase font-sans">THỐNG KÊ XU HƯỚNG CHI TIÊU</span>
                <h3 className="text-sm font-black text-slate-910 dark:text-white flex items-center gap-1.5 font-display">
                  <TrendingDown className="w-4 h-4 text-rose-500" /> Biểu đồ chi tiêu 30 ngày qua
                </h3>
              </div>

              {/* Chart stage */}
              <div className="pt-4 pb-2 relative h-52 flex items-center justify-center">
                
                {transactions.filter(tx => tx.type === 'expense').length === 0 ? (
                  <div className="text-center space-y-2 font-sans py-8">
                    <Layers className="w-8 h-8 text-slate-300 dark:text-slate-750 mx-auto animate-bounce" />
                    <p className="text-xs text-slate-400 dark:text-slate-550">Chưa đủ dữ liệu chi tiêu để dựng biểu đồ đường trend.</p>
                  </div>
                ) : (
                  <>
                    <svg viewBox="0 0 500 180" className="w-full h-full overflow-visible">
                      <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                        </linearGradient>
                      </defs>

                      {/* X and Y lines */}
                      <line x1="35" y1="20" x2="35" y2="160" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" />
                      <line x1="35" y1="160" x2="485" y2="160" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" />

                      {/* Y-axis helper grids */}
                      <line x1="35" y1="90" x2="485" y2="90" stroke="darkorange" strokeDasharray="3,3" strokeOpacity="0.08" strokeWidth="1" />
                      <line x1="35" y1="20" x2="485" y2="20" stroke="darkorange" strokeDasharray="3,3" strokeOpacity="0.08" strokeWidth="1" />

                      {/* Line of trend value */}
                      {lineChartPath.line && (
                        <>
                          <path d={lineChartPath.pathArea} fill="url(#areaGrad)" />
                          <path d={lineChartPath.line} fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </>
                      )}

                      {/* Small interaction nodes */}
                      {lineChartPath.points && lineChartPath.points.map((p, pIdx) => {
                        // Display sample subset nodes for visual clarity, hoverable individually
                        if (pIdx % 3 === 0 || pIdx === last30DaysData.length - 1) {
                          return (
                            <circle 
                              key={pIdx} 
                              cx={p.x} 
                              cy={p.y} 
                              r="3.5" 
                              className="fill-white dark:fill-slate-900 stroke-orange-500 cursor-pointer transition-all hover:scale-150" 
                              strokeWidth="2.5"
                              onMouseEnter={() => setHoveredPoint(p)}
                              onMouseLeave={() => setHoveredPoint(null)}
                            />
                          );
                        }
                        return null;
                      })}
                    </svg>

                    {/* Tooltip on Hover */}
                    {hoveredPoint && (
                      <div 
                        className="absolute bg-slate-900/90 dark:bg-black/90 backdrop-blur-md text-white border border-orange-500/30 p-2 rounded-lg text-[10px] space-y-0.5 pointer-events-none font-mono shadow-xl animate-fade-in"
                        style={{
                          left: `${(hoveredPoint.x / 500) * 100}%`,
                          top: `${(hoveredPoint.y / 180) * 100 - 15}%`,
                          transform: 'translate(-50%, -100%)'
                        }}
                      >
                        <p className="font-bold">Ngày {hoveredPoint.date}</p>
                        <p className="text-orange-400">Chi: {formatCurrency(hoveredPoint.amount, baseCurrency)}</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Footnotes */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-50 dark:border-slate-850/50">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Thống kê trong 30 ngày</span>
                <span>Rây chuột vào các điểm để xem chi tiết</span>
              </div>
            </div>

            {/* Chi tiêu theo danh mục (Pie/Donut progress distribution) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm flex flex-col justify-between glow-card">
              <div className="space-y-1 pb-3 border-b border-slate-100 dark:border-slate-850">
                <span className="text-[10px] font-black text-orange-500 tracking-wider block uppercase font-sans">PHÂN PHỐI SỐ DƯ KHOẢN CHI</span>
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 font-display">
                  <Percent className="w-4 h-4 text-orange-505 text-orange-600" /> Tỷ lệ chi tiêu theo danh mục
                </h3>
              </div>

              <div className="pt-4 flex-grow space-y-3 font-sans">
                {categoryExpenses.length === 0 ? (
                  <div className="text-center py-12 space-y-2">
                    <Layers className="w-8 h-8 text-slate-300 dark:text-slate-750 mx-auto" />
                    <p className="text-xs text-slate-400 dark:text-slate-550">Chưa ghi nhận chi tiêu nào để phân loại vòng tròn.</p>
                  </div>
                ) : (
                  categoryExpenses.slice(0, 5).map((item, idx) => {
                    const barColor = idx === 0 ? 'bg-orange-500' : idx === 1 ? 'bg-amber-500' : idx === 2 ? 'bg-indigo-500' : idx === 3 ? 'bg-rose-500' : 'bg-slate-400';
                    return (
                      <div key={item.name} className="space-y-1 animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                        <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-350">
                          <span className="truncate pr-2">{idx + 1}. {item.name}</span>
                          <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">{formatCurrency(item.amount, baseCurrency)} ({item.percentage}%)</span>
                        </div>
                        
                        {/* Progressive line track */}
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${barColor} transition-all duration-700`}
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {categoryExpenses.length > 5 && (
                <p className="text-[10px] font-mono text-center text-slate-400 pt-2 border-t border-slate-50 dark:border-slate-850/50">
                  + thêm {categoryExpenses.length - 5} danh mục chi tiêu nhỏ lẻ khác quy về VND.
                </p>
              )}
            </div>

          </div>

          {/* Double Column overall comparative graph: Income vs Expense of current block */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850/70 p-5 rounded-2xl shadow-sm glow-card font-sans">
            <div className="border-b border-slate-150 dark:border-slate-850 pb-3.5 space-y-0.5">
              <span className="text-[10px] font-black text-orange-500 tracking-wider block uppercase">DÒNG TIỀN ĐỐI SÁNH</span>
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 font-display">
                <BarChart3 className="w-4 h-4 text-indigo-500" /> Tổng quan Cán cân Thu nhập & Chi tiêu
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5">
              
              {/* Left stats blocks card overall */}
              <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border border-slate-100/50 dark:border-slate-800/80">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">Cọc tổng Thu nhập</span>
                  <span className="text-base font-extrabold text-emerald-600 font-mono mt-1 block">
                    {formatCurrency(totalIncome, baseCurrency)}
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border border-slate-100/50 dark:border-slate-800/80">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">Cọc tổng Chi tiêu</span>
                  <span className="text-base font-extrabold text-rose-500 font-mono mt-1 block">
                    {formatCurrency(totalExpense, baseCurrency)}
                  </span>
                </div>
              </div>

              {/* Middle comparative full SVG double-column graph */}
              <div className="md:col-span-2 flex items-end justify-center min-h-[160px] pb-2 pt-4 border-l border-slate-100 dark:border-slate-800 pl-4">
                {totalIncome === 0 && totalExpense === 0 ? (
                  <div className="text-center text-xs text-slate-400 py-6 max-w-sm mx-auto">
                    Thiếu dữ liệu. Vui lòng cập nhật chi tiêu thu nhập ở mục "Ghi Giao Dịch" để hệ thống phác họa cọc cán cân lực lượng.
                  </div>
                ) : (
                  <div className="w-full flex items-end justify-around gap-8 md:gap-16 px-4">
                    
                    {/* Income Pillar */}
                    <div className="flex flex-col items-center gap-3 w-20 md:w-28 group">
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-xl overflow-hidden h-32 flex items-end">
                        <div 
                          className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg shadow-emerald-500/20 group-hover:opacity-90 duration-250 transition-all cursor-pointer"
                          style={{ 
                            height: `${totalIncome >= totalExpense ? 100 : Math.max(10, Math.round((totalIncome / totalExpense) * 100))}%` 
                          }}
                        />
                      </div>
                      <span className="text-xs font-black text-slate-700 dark:text-slate-300 font-display">KHOẢN THU (+)</span>
                    </div>

                    {/* Expense Pillar */}
                    <div className="flex flex-col items-center gap-3 w-20 md:w-28 group">
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-xl overflow-hidden h-32 flex items-end">
                        <div 
                          className="w-full bg-gradient-to-t from-rose-500 to-orange-500 rounded-t-lg shadow-rose-500/20 group-hover:opacity-90 duration-250 transition-all cursor-pointer"
                          style={{ 
                            height: `${totalExpense >= totalIncome ? 100 : Math.max(10, Math.round((totalExpense / totalIncome) * 100))}%` 
                          }}
                        />
                      </div>
                      <span className="text-xs font-black text-slate-700 dark:text-slate-300 font-display">KHOẢN CHI (-)</span>
                    </div>

                  </div>
                )}
              </div>

            </div>
          </div>

          {/* 3. HenHy Custom highlights and sành điệu Analysis metrics */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm glow-card font-sans">
            <div className="border-b border-slate-100 dark:border-slate-850 pb-3 space-y-0.5 mb-5">
              <span className="text-[10px] font-black text-orange-500 tracking-wider block uppercase">DỮ LIỆU ĐỒ VẬT VÀ NHÓM CHUYÊN SƠN</span>
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 font-display">
                <Sparkles className="w-4 h-4 text-orange-500 animate-pulse" /> Thống kê đồ vật / Hành vi đặc biệt
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              {/* Box 1: Cà phê Trà sữa sành điệu */}
              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/40 dark:bg-slate-805 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">Đi cafe / Trà sữa</span>
                  <Coffee className="w-4.5 h-4.5 text-amber-500" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-xl font-black text-slate-910 dark:text-white block font-mono">{specialMetrics.chillCount} lần</span>
                  <p className="text-[10px] text-slate-400 leading-normal">Mức độ tương tác với nhóm ăn chơi sành điệu trong tháng</p>
                </div>
              </div>

              {/* Box 2: Peak Spending Day */}
              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/40 dark:bg-slate-805 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wide flex-grow pr-1">Ngày vung tay quá lẻ</span>
                  <Calendar className="w-4.5 h-4.5 text-orange-500 animate-pulse" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-sm font-black text-slate-910 dark:text-white block font-mono truncate">{specialMetrics.peakDay}</span>
                  <span className="text-xs font-bold text-rose-500 font-mono block">-{formatCurrency(specialMetrics.peakAmount, baseCurrency)}</span>
                </div>
              </div>

              {/* Box 3: Daily Average Spend */}
              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/40 dark:bg-slate-805 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">Chi tiêu TB ngày</span>
                  <Award className="w-4.5 h-4.5 text-indigo-500 animate-bounce" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-base font-extrabold text-slate-915 dark:text-white block font-mono truncate">{formatCurrency(specialMetrics.avgSpend, baseCurrency)}</span>
                  <p className="text-[10px] text-slate-400 leading-normal">Mức độ hao hụt ngân quỹ khả dụng trung bình mỗi ngày</p>
                </div>
              </div>

              {/* Box 4: Top expense category */}
              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/40 dark:bg-slate-805 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">Danh mục tốn ví nhất</span>
                  <Flame className="w-4.5 h-4.5 text-orange-650 text-orange-500" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-base font-extrabold text-orange-600 dark:text-orange-400 block truncate">{specialMetrics.topExpenseCategory}</span>
                  <p className="text-[10px] text-slate-400 leading-normal">Nhóm thói quen cần tối giản ngân sách trong tháng tới</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      ) : (
        /* PDF/Excel EXPORT SUBTAB */
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-6 md:p-8 rounded-2xl shadow-sm space-y-6 glow-card animate-fade-in font-sans">
          
          <div className="border-b border-slate-100 dark:border-slate-850 pb-4 space-y-1">
            <span className="text-xs font-black text-orange-500 uppercase tracking-widest leading-none">Trung tâm dữ liệu tệp</span>
            <h3 className="text-base font-black text-slate-900 dark:text-white font-display">Tải xuống sao kê hạch toán & Quỹ tài chính</h3>
            <p className="text-xs text-slate-400">Tất cả dữ liệu được biên dịch ngoại tuyến an toàn ngay trên điện thoại hoặc máy tính của bạn</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
            
            {/* Box 1: Transactions CSV */}
            <div className="bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-850/80 p-5 rounded-2xl flex flex-col justify-between gap-5 transition-all hover:border-orange-500/20">
              <div className="space-y-2">
                <div className="p-3 w-11 h-11 rounded-xl bg-orange-100 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 flex items-center justify-center shadow-inner">
                  <FileText className="w-5.5 h-5.5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display">Sao kê giao dịch chi tiêu (.csv)</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Sản xuất tệp tin bảng số liệu mọi giao dịch thu có, chi nợ đầy đủ thời gian và nội dung. Bản xuất lập trình tương thích hoàn chỉnh với Microsoft Excel, Google Sheets.
                  </p>
                </div>
              </div>

              <button
                onClick={exportTransactionsToCSV}
                className="w-full py-2.5 rounded-xl bg-orange-650 bg-orange-600 hover:bg-orange-550 duration-200 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm font-display"
              >
                <ArrowDownToLine className="w-4 h-4 animate-bounce" /> Tải tệp Excel Giao dịch
              </button>
            </div>

            {/* Box 2: Saving Goals CSV */}
            <div className="bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-850/80 p-5 rounded-2xl flex flex-col justify-between gap-5 transition-all hover:border-orange-500/20">
              <div className="space-y-2">
                <div className="p-3 w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
                  <PiggyBank className="w-5.5 h-5.5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display">Báo cáo tệp Quỹ tiết kiệm (.csv)</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Theo dõi đầy đủ mức tích lũy mong ước, số tiền thực tế nuôi heo tới ngày hôm nay, hạn định và trạng thái hoàn thiện của từng mục tiêu tiết kiệm.
                  </p>
                </div>
              </div>

              <button
                onClick={exportSavingGoalsToCSV}
                className="w-full py-2.5 rounded-xl bg-emerald-605 bg-emerald-600 hover:bg-emerald-550 duration-200 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm font-display"
              >
                <ArrowDownToLine className="w-4 h-4 animate-bounce" /> Tải tệp Excel Quỹ tiết kiệm
              </button>
            </div>

            {/* Box 3: Print Print-to-PDF widget */}
            <div className="bg-slate-50/50 dark:bg-slate-900/40 border border-slate-150 dark:border-slate-855 p-5 rounded-2xl flex flex-col justify-between gap-5 transition-all hover:border-orange-500/20">
              <div className="space-y-2">
                <div className="p-3 w-11 h-11 rounded-xl bg-indigo-100 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
                  <Printer className="w-5.5 h-5.5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display">In Báo Cáo Tài Chính / Xuất PDF</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Kết hợp toàn bộ: Sổ sách thu chi tức thời, các khoản quỹ tích góp, và trọn vẹn bản báo cáo đề xuất của HenHy AI Advisor thành bản in có cấu trúc gọn gàng để in hoặc lưu PDF.
                  </p>
                </div>
              </div>

              <button
                onClick={handlePrintToPDF}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-550 duration-200 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm font-display"
              >
                <Printer className="w-4 h-4" /> Bắt đầu in / Lưu PDF
              </button>
            </div>

          </div>

          {/* Quick instructions for native print tool */}
          <div className="p-4 bg-orange-50/50 border border-orange-105-0 border-orange-200/40 text-orange-850 dark:bg-orange-950/15 dark:border-orange-900/40 text-xs rounded-xl flex gap-2 w-full max-w-xl font-medium leading-relaxed">
            <HelpCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold font-display block text-orange-600 dark:text-orange-400 text-xs uppercase tracking-wide">Lời khuyên xuất PDF sành điệu:</span>
              <p className="text-slate-655 dark:text-slate-350 text-[11px]">
                Khi ấn nút <strong>In / Lưu PDF</strong>, bảng cấu hình in hệ thống của máy tính/thiết bị sẽ mở ra. 
                Bạn hãy chọn tùy chọn <strong>Định dạng dọc (Portrait)</strong>, thiết lập <strong>Lưu dưới dạng PDF</strong> và đừng quên bật/tick mục <strong>"In màu nền và hình ảnh" (Print backgrounds)</strong> để tối ưu toàn bộ thẻ đen sành điệu nhé!
              </p>
            </div>
          </div>

        </div>
      )}

      {/* ----------------------------------------------------
          HIDDEN PRINTABLE AREA: ACTIVATED ON @media print
          This area provides a clean, elegant layout for printing to PDF safely.
          ---------------------------------------------------- */}
      <div className="hidden print:block bg-white text-black p-12 font-sans space-y-8 min-h-screen text-xs">
        {/* Print Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-orange-600">HenHy FinTech Ledger</h1>
            <p className="text-xs text-gray-500">Sổ hạch toán dòng tiền & Đề án tiết kiệm thông minh</p>
          </div>
          <div className="text-right text-[10px] text-gray-500 font-mono">
            <p>Ngày in: {getTodayString()}</p>
            <p>Quản trị: Mr. Henry NG</p>
          </div>
        </div>

        {/* Totals overview */}
        <div className="grid grid-cols-3 gap-6 border p-4 rounded-xl">
          <div>
            <h4 className="text-[10px] text-gray-500 uppercase tracking-wider">Tổng khoản thu</h4>
            <p className="text-lg font-bold text-green-600">{formatCurrency(totalIncome, baseCurrency)}</p>
          </div>
          <div>
            <h4 className="text-[10px] text-gray-500 uppercase tracking-wider">Tổng khoản chi</h4>
            <p className="text-lg font-bold text-red-600">{formatCurrency(totalExpense, baseCurrency)}</p>
          </div>
          <div>
            <h4 className="text-[10px] text-gray-500 uppercase tracking-wider">Ví thặng dư khả dụng</h4>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(totalIncome - totalExpense, baseCurrency)}</p>
          </div>
        </div>

        {/* Section 1: Transactions Table */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-orange-600 border-b pb-1">1. Sổ Nhật Ký Biến Động Giao Dịch</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="py-2">Mã GD</th>
                <th className="py-2">Ngày Tháng</th>
                <th className="py-2">Nội dung / Mô tả</th>
                <th className="py-2">Danh mục</th>
                <th className="py-2 text-right">Giá trị gốc</th>
                <th className="py-2 text-right">Quy đổi ({baseCurrency})</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => {
                const isInc = tx.type === 'income';
                return (
                  <tr key={tx.id} className="border-b">
                    <td className="py-2 font-mono text-[10px]">{tx.id}</td>
                    <td className="py-2">{tx.date}</td>
                    <td className="py-2 font-medium">{tx.note}</td>
                    <td className="py-2">{tx.category}</td>
                    <td className="py-2 text-right font-mono">{formatCurrency(tx.amount, tx.currency as CurrencyCode)}</td>
                    <td className={`py-2 text-right font-mono font-bold ${isInc ? 'text-green-600' : 'text-gray-900'}`}>
                      {isInc ? '+' : '-'}{formatCurrency(convertCurrency(tx.amount, tx.currency as CurrencyCode, baseCurrency), baseCurrency)}
                    </td>
                  </tr>
                );
              })}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-gray-400">Không tìm thấy giao dịch nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Section 2: Saving Goals */}
        <div className="space-y-3 pt-4">
          <h2 className="text-sm font-bold text-orange-600 border-b pb-1">2. Tiến độ kế hoạch Quỹ mục tiêu</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="py-2">Tên quỹ / Dự định</th>
                <th className="py-2">Thời hạn tối đa</th>
                <th className="py-2 text-right">Số tiền định mức</th>
                <th className="py-2 text-right">Hiện trạng thăng dư</th>
                <th className="py-2 text-right">Phần trăm (%)</th>
              </tr>
            </thead>
            <tbody>
              {savingGoals.map((g) => {
                const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) || 0;
                return (
                  <tr key={g.id} className="border-b">
                    <td className="py-2 font-medium">{g.name}</td>
                    <td className="py-2">{g.deadline}</td>
                    <td className="py-2 text-right font-mono">{formatCurrency(g.targetAmount, g.currency as CurrencyCode)}</td>
                    <td className="py-2 text-right font-mono font-bold">{formatCurrency(g.currentAmount, g.currency as CurrencyCode)}</td>
                    <td className="py-2 text-right font-mono font-bold text-orange-600">{pct}%</td>
                  </tr>
                );
              })}
              {savingGoals.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-400">Không thiết lập quỹ mục tiêu nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Legal note footer */}
        <div className="pt-16 text-center text-[10px] text-gray-400 border-t space-y-1">
          <p>Bản in báo cáo được lập và dệt thông minh thông qua Hệ sinh thái HenHy fintech advisor.</p>
          <p>Tương thich bảo mật, an toàn và hoàn thiện chuỗi giá trị tuyệt hảo. Bản quyền © 2026 Henry NG.</p>
        </div>
      </div>

    </div>
  );
}
