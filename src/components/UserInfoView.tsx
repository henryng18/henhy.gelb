/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  User, 
  MapPin, 
  Briefcase, 
  Coins, 
  Target, 
  ArrowLeft, 
  Calendar, 
  CheckCircle2, 
  Map
} from 'lucide-react';
import { UserInfo } from '../types';

interface UserInfoViewProps {
  userInfo: UserInfo;
  onSaveUserInfo: (info: UserInfo) => void;
  setCurrentTab: (tab: string) => void;
}

export function UserInfoView({
  userInfo,
  onSaveUserInfo,
  setCurrentTab,
}: UserInfoViewProps) {
  const [name, setName] = useState<string>(userInfo.name || '');
  const [birthYear, setBirthYear] = useState<string>(userInfo.birthYear || '');
  const [hometown, setHometown] = useState<string>(userInfo.hometown || '');
  const [location, setLocation] = useState<string>(userInfo.location || '');
  const [job, setJob] = useState<string>(userInfo.job || '');
  const [income, setIncome] = useState<string>(userInfo.income || '');
  const [financialGoal, setFinancialGoal] = useState<string>(userInfo.financialGoal || '');
  
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveUserInfo({
      name: name.trim(),
      birthYear: birthYear.trim(),
      hometown: hometown.trim(),
      location: location.trim(),
      job: job.trim(),
      income: income.trim(),
      financialGoal: financialGoal.trim(),
    });

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setCurrentTab('settings'); // Go back smoothly to Settings screen
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Return Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setCurrentTab('settings')}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
          title="Quay lại cài đặt"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="space-y-0.5">
          <h2 className="text-lg font-black text-slate-900 dark:text-white font-display">Cập Nhật Hồ Sơ Người Dùng</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">Thông tin dùng để tối ưu hóa tri thức phân tích từ cố vấn HenHy AI</p>
        </div>
      </div>

      {/* Main card panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-6 md:p-8 rounded-2xl shadow-sm font-sans glow-card">
        
        {success ? (
          /* Transition success screen */
          <div className="py-12 text-center space-y-4 animate-fade-in">
            <div className="inline-flex p-4 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h3 className="text-md font-black text-slate-900 dark:text-white font-display">Đã lưu thông tin người dùng thành công!</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Đang chuẩn bị điều hướng về mục Cài đặt hệ thống...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-4">
              
              {/* Họ và Tên */}
              <div className="relative">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <User className="w-4 h-4 text-orange-500" /> Họ và tên người dùng
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Minh Henry NG..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Năm Sinh */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-orange-500" /> Năm sinh
                  </label>
                  <input
                    type="number"
                    placeholder="Ví dụ: 2000"
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Quê Quán */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Map className="w-4 h-4 text-orange-500" /> Quê quán
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Đà Nẵng, Việt Nam"
                    value={hometown}
                    onChange={(e) => setHometown(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nơi sống hiện tại */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-orange-500" /> Nơi sinh sống hiện tại
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Quận 1, TP. Hồ Chí Minh"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Nghề Nghiệp */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Briefcase className="w-4 h-4 text-orange-500" /> Nghề nghiệp / Công việc
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Kỹ sư Phần mềm, Freelancer..."
                    value={job}
                    onChange={(e) => setJob(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Thu Nhập */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Coins className="w-4 h-4 text-orange-500" /> Thu nhập bình quân hàng tháng
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: 25.000.000 VND, 1500 USD..."
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <p className="text-[10px] text-slate-400 dark:text-slate-550 font-mono">Ghi rõ số lượng và loại tiền tệ thực tế của bạn để AI lập biểu đồ tối ưu.</p>
              </div>

              {/* Mục tiêu tài chính */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Target className="w-4 h-4 text-orange-500" /> Mục tiêu tài chính mong muốn
                </label>
                <textarea
                  placeholder="Ví dụ: Mua nhà trước tuổi 30, xây dựng quỹ tiết kiệm hưu trí an nhàn, sống thảnh thơi chill không lo nợ..."
                  rows={3}
                  value={financialGoal}
                  onChange={(e) => setFinancialGoal(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-orange-600 hover:bg-orange-550 text-white font-black text-xs md:text-sm shadow-md transition-all cursor-pointer font-display"
              >
                Lưu thông tin & Đồng bộ hóa
              </button>
            </div>

          </form>
        )}

      </div>

    </div>
  );
}
