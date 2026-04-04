import React from 'react';
import { Menu, User } from 'lucide-react';
import { Branch, ViewMode } from '../types';

interface HeaderProps {
  view: ViewMode;
  isUpdate: boolean;
  teacherName: string;
  selectedBranch: Branch | null;
  setIsSidebarOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  view,
  isUpdate,
  teacherName,
  selectedBranch,
  setIsSidebarOpen
}) => {
  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
      <button 
        onClick={() => setIsSidebarOpen(true)}
        className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
      >
        <Menu size={24} />
      </button>

      <div className="flex-1 lg:flex-none px-4">
        <h2 className="font-bold text-slate-800 lg:text-xl">
          {view === 'dashboard' && 'ড্যাশবোর্ড'}
          {view === 'entry' && (isUpdate ? 'তথ্য আপডেট' : 'নতুন এন্ট্রি')}
          {view === 'history' && 'এন্ট্রি হিস্ট্রি'}
          {view === 'report' && 'রিপোর্ট'}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-sm font-bold text-slate-800">{teacherName}</span>
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{selectedBranch?.name}</span>
        </div>
        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 border border-slate-200">
          <User size={20} />
        </div>
      </div>
    </header>
  );
};
