import React from 'react';
import { 
  BookOpen, 
  Building2, 
  LayoutDashboard, 
  Plus, 
  History, 
  LogOut,
  BarChart3
} from 'lucide-react';
import { Branch, ViewMode } from '../types';

interface SidebarProps {
  showSidebar: boolean;
  branches: Branch[];
  view: ViewMode;
  selectedBranch: Branch | null;
  teacherName: string;
  isBranchHome: boolean;
  isTeacherVerify: boolean;
  setView: (view: ViewMode) => void;
  setSelectedBranch: (branch: Branch) => void;
  setIsSidebarOpen: (open: boolean) => void;
  resetForm: () => void;
  handleBranchLogout: () => void;
  handleTeacherLogout: () => void;
}

const NavItem = ({ 
  icon: Icon, 
  label, 
  targetView, 
  active, 
  disabled, 
  onClick 
}: { 
  icon: any, 
  label: string, 
  targetView: ViewMode, 
  active: boolean, 
  disabled?: boolean,
  onClick: () => void
}) => (
    <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all font-medium cursor-pointer ${
      active 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
        : disabled 
          ? 'text-slate-300 cursor-not-allowed'
          : 'text-slate-600 hover:bg-slate-100'
    }`}
  >
    <Icon size={20} />
    <span>{label}</span>
  </button>
);

export const Sidebar: React.FC<SidebarProps> = ({
  showSidebar,
  branches,
  view,
  selectedBranch,
  teacherName,
  isBranchHome,
  isTeacherVerify,
  setView,
  setSelectedBranch,
  setIsSidebarOpen,
  resetForm,
  handleBranchLogout,
  handleTeacherLogout
}) => {
  if (!showSidebar) return null;

  const handleNavClick = (targetView: ViewMode) => {
    if (targetView === 'entry') resetForm();
    setView(targetView);
    setIsSidebarOpen(false);
  };

  return (
    <aside className="hidden lg:flex w-80 bg-white border-r border-slate-200 flex-col sticky top-0 h-screen">
      <div className="p-6 flex items-center gap-3 border-b border-slate-100">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden shadow-sm border border-slate-100">
          <img src="https://play-lh.googleusercontent.com/IiCTqE_rB6y1nQlZ-AJIQA0_vyX2V0bjp0KyeSg0X12OVCE6odidw_yFf-YyYjUY0cye" alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight">Mark & Payment Entry</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Dashboard</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {['branch-home', 'teacher-verify', 'branch-report', 'report'].includes(view) ? (
          <>
            <NavItem 
              icon={BarChart3} 
              label="ব্রাঞ্চ রিপোর্ট" 
              targetView="branch-report" 
              active={view === 'branch-report'} 
              onClick={() => handleNavClick('branch-report')}
            />
            <NavItem 
              icon={BarChart3} 
              label="রং এন্ট্রি রিপোর্ট" 
              targetView="report" 
              active={view === 'report'} 
              onClick={() => handleNavClick('report')}
            />
            <div className="my-4 border-t border-slate-100 pt-4">
              <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">ব্রাঞ্চ সমূহ</p>
              {branches.map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    setSelectedBranch(b);
                    setView('teacher-verify');
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all font-medium cursor-pointer ${
                    selectedBranch?.id === b.id && isTeacherVerify
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Building2 size={20} />
                  <span>{b.name}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <NavItem 
              icon={LayoutDashboard} 
              label="ড্যাশবোর্ড" 
              targetView="dashboard" 
              active={view === 'dashboard'} 
              onClick={() => handleNavClick('dashboard')}
            />
            <NavItem 
              icon={Plus} 
              label="নতুন এন্ট্রি" 
              targetView="entry" 
              active={view === 'entry'} 
              onClick={() => handleNavClick('entry')}
            />
            <NavItem 
              icon={History} 
              label="হিস্ট্রি" 
              targetView="history" 
              active={view === 'history'} 
              onClick={() => handleNavClick('history')}
            />
          </>
        )}
      </nav>

      <div className="p-4 border-t border-slate-100">
        {!isBranchHome && !isTeacherVerify && (
          <div className="bg-slate-50 p-4 rounded-xl mb-4">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Logged in as</p>
            <p className="text-sm font-bold text-slate-800 truncate">{teacherName}</p>
            <p className="text-[10px] text-slate-500 truncate">{selectedBranch?.name}</p>
          </div>
        )}
        <button 
          onClick={isBranchHome ? handleBranchLogout : handleTeacherLogout}
          className="w-full flex items-center gap-3 p-2 rounded-xl text-red-600 hover:bg-red-50 transition-all font-medium cursor-pointer"
        >
          <LogOut size={20} />
          <span>লগআউট</span>
        </button>
      </div>
    </aside>
  );
};
