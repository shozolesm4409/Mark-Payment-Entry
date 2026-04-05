import React from 'react';
import { motion } from 'motion/react';
import { User, Hash, Loader2 } from 'lucide-react';
import { Branch, ViewMode } from '../types';

interface TeacherVerifyViewProps {
  selectedBranch: Branch | null;
  tpin: string;
  setTpin: (tpin: string) => void;
  teacherName: string;
  isVerifyingTeacher: boolean;
  handleVerifyTeacher: (e: React.FormEvent) => void;
  loading: boolean;
  setView: (view: ViewMode) => void;
}

export const TeacherVerifyView: React.FC<TeacherVerifyViewProps> = ({
  selectedBranch,
  tpin,
  setTpin,
  teacherName,
  isVerifyingTeacher,
  handleVerifyTeacher,
  loading,
  setView
}) => {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4"><User size={32} /></div>
        <h2 className="text-2xl font-bold">শিক্ষক ভেরিফিকেশন</h2>
        <p className="text-slate-500 mt-2">{selectedBranch?.name} - এর জন্য TPIN দিন</p>
      </div>
      <form onSubmit={handleVerifyTeacher} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">শিক্ষক TPIN</label>
            <div className="relative">
              <input type="text" value={tpin} onChange={(e) => setTpin(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="TPIN" required />
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">&nbsp;</label>
            <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 font-medium min-h-[50px] flex items-center">
              {isVerifyingTeacher ? (
                <Loader2 className="animate-spin text-indigo-600" size={20} />
              ) : (
                teacherName || (tpin.length >= 2 ? 'শিক্ষক পাওয়া যায়নি' : 'শিক্ষক নাম')
              )}
            </div>
          </div>
        </div>
        <button type="submit" disabled={loading || isVerifyingTeacher || tpin.length < 2} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer">
          {(loading || isVerifyingTeacher) ? <Loader2 className="animate-spin" /> : 'প্রবেশ করুন'}
        </button>
        <button type="button" onClick={() => setView('branch-home')} className="w-full text-slate-500 font-medium py-2 hover:text-slate-800 transition-colors cursor-pointer">পিছনে যান</button>
      </form>
    </motion.div>
  );
};
