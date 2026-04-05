import React from 'react';
import { motion } from 'motion/react';
import { Lock, Loader2 } from 'lucide-react';

interface LoginViewProps {
  pin: string;
  setPin: (pin: string) => void;
  branchName: string;
  coordinator: string;
  handleVerifyBranch: (e: React.FormEvent) => void;
  loading: boolean;
}

export const LoginView: React.FC<LoginViewProps> = ({
  pin,
  setPin,
  branchName,
  coordinator,
  handleVerifyBranch,
  loading
}) => {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4"><Lock size={32} /></div>
        <h2 className="text-2xl font-bold">ব্রাঞ্চ লগইন</h2>
        <p className="text-slate-500 mt-2">আপনার ব্রাঞ্চ পিন নম্বরটি প্রদান করুন</p>
      </div>
      <form onSubmit={handleVerifyBranch} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">ব্রাঞ্চ পিন</label>
          <div className="relative">
            <input type="text" value={pin} onChange={(e) => setPin(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="••••••" required />
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          </div>
          {branchName && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-sm font-bold text-emerald-700">{branchName}</span>
              </div>
              {coordinator && (
                <div className="text-xs font-medium text-emerald-600 ml-4">
                  Coordinator: {coordinator}
                </div>
              )}
            </motion.div>
          )}
        </div>
        <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-2 rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer">
          {loading ? <Loader2 className="animate-spin" /> : 'ভেরিফাই করুন'}
        </button>
      </form>
    </motion.div>
  );
};
