import React from 'react';
import { motion } from 'motion/react';
import { Building2, Menu, User, LogOut } from 'lucide-react';
import { Branch, ViewMode } from '../types';

interface BranchHomeViewProps {
  selectedBranch: Branch | null;
  setView: (view: ViewMode) => void;
  handleBranchLogout: () => void;
  setIsSidebarOpen: (open: boolean) => void;
}

export const BranchHomeView: React.FC<BranchHomeViewProps> = ({
  selectedBranch,
  setView,
  handleBranchLogout,
  setIsSidebarOpen
}) => {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center w-full max-w-lg">
      <div className="lg:hidden absolute top-4 left-4">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
        >
          <Menu size={24} />
        </button>
      </div>
      
      <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
        <Building2 size={48} />
      </div>
      <h2 className="text-3xl font-bold text-slate-800 mb-2">
        {selectedBranch ? selectedBranch.name : 'ব্রাঞ্চ নির্বাচন করুন'}
      </h2>
      <p className="text-slate-500 mb-8 px-4">
        {selectedBranch 
          ? 'ব্রাঞ্চ প্যানেলে স্বাগতম। শিক্ষক ভেরিফিকেশন করতে বাম পাশের মেনুতে ক্লিক করুন অথবা নিচের বাটনে চাপ দিন।'
          : 'ব্রাঞ্চ প্যানেলে স্বাগতম। অনুগ্রহ করে বাম পাশের মেনু থেকে আপনার ব্রাঞ্চটি নির্বাচন করুন।'}
      </p>
      
      <div className="space-y-4 px-4">
        {selectedBranch && (
          <button 
            onClick={() => setView('teacher-verify')}
            className="w-full bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <User size={20} />
            শিক্ষক ভেরিফিকেশন
          </button>
        )}
        
        <button 
          onClick={handleBranchLogout}
          className="w-full bg-white text-red-600 border border-red-100 px-8 py-4 rounded-xl font-bold hover:bg-red-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogOut size={20} />
          লগআউট
        </button>
      </div>
    </motion.div>
  );
};
