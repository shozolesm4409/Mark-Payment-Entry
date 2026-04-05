import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, X, Building2, LayoutDashboard, Plus, History, LogOut, BarChart3, User } from 'lucide-react';
import { Branch, ViewMode } from '../types';

interface MobileSidebarProps {
  isSidebarOpen: boolean;
  showSidebar: boolean;
  branches: Branch[];
  view: ViewMode;
  selectedBranch: Branch | null;
  pin: string;
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

export const MobileSidebar: React.FC<MobileSidebarProps> = ({
  isSidebarOpen,
  showSidebar,
  branches,
  view,
  selectedBranch,
  pin,
  isBranchHome,
  isTeacherVerify,
  setView,
  setSelectedBranch,
  setIsSidebarOpen,
  resetForm,
  handleBranchLogout,
  handleTeacherLogout
}) => {
  const handleNavClick = (targetView: ViewMode) => {
    if (targetView === 'entry') resetForm();
    setView(targetView);
    setIsSidebarOpen(false);
  };

  return (
    <AnimatePresence>
      {isSidebarOpen && showSidebar && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          />
          <motion.aside 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-72 bg-white z-50 lg:hidden flex flex-col shadow-2xl"
          >
            <div className="p-6 flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden shadow-sm border border-slate-100">
                  <img src="https://play-lh.googleusercontent.com/IiCTqE_rB6y1nQlZ-AJIQA0_vyX2V0bjp0KyeSg0X12OVCE6odidw_yFf-YyYjUY0cye" alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <h1 className="font-bold text-lg">Mark & Payment Entry</h1>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
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
              {(!isBranchHome && !isTeacherVerify) ? (
                <div className="bg-slate-50 p-4 rounded-xl mb-4">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">LOGGED IN AS Coordinator</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
                      <User size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{selectedBranch?.coordinator} ({pin})</p>
                      <p className="text-[10px] text-slate-500 truncate">{selectedBranch?.name}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 p-4 rounded-xl mb-4">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Coordinator Login</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
                      <User size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{selectedBranch?.coordinator || branches[0]?.coordinator} ({pin})</p>
                    </div>
                  </div>
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
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
