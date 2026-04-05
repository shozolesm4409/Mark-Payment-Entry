import React from 'react';
import { Menu, User, Bell } from 'lucide-react';
import { Branch, ViewMode } from '../types';

interface HeaderProps {
  view: ViewMode;
  isUpdate: boolean;
  teacherName: string;
  tpin: string;
  selectedBranch: Branch | null;
  setIsSidebarOpen: (open: boolean) => void;
  wrongEntriesCount: number;
  onNotificationClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  view,
  isUpdate,
  teacherName,
  tpin,
  selectedBranch,
  setIsSidebarOpen,
  wrongEntriesCount,
  onNotificationClick
}) => {
  const getTitle = () => {
    if (view === 'login') return { title: 'Exam Scripts Management', subtitle: 'Exam Center Scripts Management System' };
    if (view === 'branch-home') return { title: 'ব্রাঞ্চ হোম', subtitle: 'শাখা নির্বাচন করুন' };
    if (view === 'teacher-verify') return { title: 'শিক্ষক ভেরিফিকেশন', subtitle: 'TPIN যাচাই করুন' };
    if (view === 'dashboard') return { title: 'ড্যাশবোর্ড', subtitle: 'সার্বিক চিত্র' };
    if (view === 'entry') return { title: isUpdate ? 'এন্ট্রি আপডেট' : 'নতুন এন্ট্রি', subtitle: 'মার্কস ও পেমেন্ট' };
    if (view === 'history') return { title: 'হিস্ট্রি', subtitle: 'পূর্বের এন্ট্রি সমূহ' };
    if (view === 'report') return { title: 'রং এন্ট্রি রিপোর্ট', subtitle: 'ভুল এন্ট্রির তালিকা' };
    if (view === 'branch-report') return { title: 'ব্রাঞ্চ রিপোর্ট', subtitle: 'শাখা ভিত্তিক রিপোর্ট' };
    if (view === 'notifications') return { title: 'নোটিফিকেশন', subtitle: 'সতর্কবার্তা' };
    return { title: 'Exam Scripts Management', subtitle: 'Exam Center Scripts Management System' };
  };

  const { title, subtitle } = getTitle();

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
      <button 
        onClick={() => setIsSidebarOpen(true)}
        className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
      >
        <Menu size={24} />
      </button>

      <div className="flex-1 lg:flex-none px-4 flex items-center gap-3">
        {view === 'login' && (
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center overflow-hidden shadow-sm border border-slate-100 shrink-0">
            <img src="https://play-lh.googleusercontent.com/IiCTqE_rB6y1nQlZ-AJIQA0_vyX2V0bjp0KyeSg0X12OVCE6odidw_yFf-YyYjUY0cye" alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
        )}
        <div>
          <h1 className="font-bold text-slate-800 text-base lg:text-lg leading-tight">{title}</h1>
          <p className="text-[10px] lg:text-xs text-slate-500 font-medium">{subtitle}</p>
        </div>
      </div>

      {view !== 'login' && (
        <div className="flex items-center gap-4">
          {teacherName && (
            <button 
              onClick={onNotificationClick}
              className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            >
              <Bell size={20} />
              {wrongEntriesCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
              )}
            </button>
          )}
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-bold text-slate-800">{teacherName ? `${teacherName} (${tpin})` : ''}</span>
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{selectedBranch?.name}</span>
          </div>
          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 border border-slate-200">
            <User size={20} />
          </div>
        </div>
      )}
    </header>
  );
};
