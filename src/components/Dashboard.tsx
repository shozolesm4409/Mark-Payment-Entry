import React from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  Users, 
  Clock, 
  TrendingUp, 
  BookOpen, 
  ChevronRight, 
  Plus, 
  History,
  AlertCircle
} from 'lucide-react';
import { HistoryRecord, ViewMode } from '../types';

interface DashboardProps {
  stats: {
    totalEntries: number;
    totalStudents: number;
    pendingCount: number;
    checkedCount: number;
    wrongCount: number;
  };
  history: HistoryRecord[];
  setView: (view: ViewMode) => void;
  handleEdit: (record: HistoryRecord) => void;
  resetForm: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  history,
  setView,
  handleEdit,
  resetForm
}) => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0"><FileText size={20} /></div>
          <div className="min-w-0"><p className="text-[10px] font-bold text-slate-400 uppercase truncate">মোট এন্ট্রি</p><p className="text-xl font-bold">{stats.totalEntries}</p></div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0"><Users size={20} /></div>
          <div className="min-w-0"><p className="text-[10px] font-bold text-slate-400 uppercase truncate">মোট শিক্ষার্থী</p><p className="text-xl font-bold">{stats.totalStudents}</p></div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0"><Clock size={20} /></div>
          <div className="min-w-0"><p className="text-[10px] font-bold text-slate-400 uppercase truncate">পেন্ডিং মার্কস</p><p className="text-xl font-bold">{stats.pendingCount}</p></div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0"><TrendingUp size={20} /></div>
          <div className="min-w-0"><p className="text-[10px] font-bold text-slate-400 uppercase truncate">আপডেটেড মার্কস</p><p className="text-xl font-bold">{stats.checkedCount}</p></div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center shrink-0"><AlertCircle size={20} /></div>
          <div className="min-w-0"><p className="text-[10px] font-bold text-slate-400 uppercase truncate">রং মার্কস</p><p className="text-xl font-bold">{stats.wrongCount}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-slate-800">সাম্প্রতিক এন্ট্রি</h3>
            <button onClick={() => setView('history')} className="text-sm text-indigo-600 font-bold hover:underline cursor-pointer">সব দেখুন</button>
          </div>
          <div className="space-y-3">
            {history.slice(0, 5).map((record) => (
              <div key={record.rowId} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between hover:border-indigo-200 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400"><BookOpen size={20} /></div>
                  <div>
                    <div className="flex items-center flex-wrap gap-2">
                      <p className="font-bold text-slate-800">{record.subject}</p>
                      {(() => {
                        const pendingCount = record.allMarks.filter(m => m.status === 'Pending').length;
                        const wrongCount = record.allMarks.filter(m => m.status === 'Wrong').length;
                        return (
                          <>
                            {pendingCount > 0 && (
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-black uppercase rounded-md border border-amber-100 flex items-center gap-1">
                                <Clock size={10} /> Pending ({pendingCount})
                              </span>
                            )}
                            {wrongCount > 0 && (
                              <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-black uppercase rounded-md border border-red-100 flex items-center gap-1">
                                <AlertCircle size={10} /> Wrong ({wrongCount})
                              </span>
                            )}
                          </>
                        );
                      })()}
                    </div>
                    <p className="text-xs text-slate-500">{record.entryDate} • {record.allMarks.length} Students</p>
                  </div>
                </div>
                <button onClick={() => handleEdit(record)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"><ChevronRight size={20} /></button>
              </div>
            ))}
            {history.length === 0 && <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200 text-slate-400">কোন এন্ট্রি পাওয়া যায়নি</div>}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg text-slate-800">কুইক অ্যাকশন</h3>
          <div className="space-y-3">
            <button onClick={() => { resetForm(); setView('entry'); }} className="w-full bg-white p-2 rounded-xl border border-slate-200 flex items-center gap-4 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all group cursor-pointer">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center group-hover:bg-white/20 group-hover:text-white"><Plus size={20} /></div>
              <span className="font-bold">নতুন মার্কস এন্ট্রি</span>
            </button>
            <button onClick={() => setView('history')} className="w-full bg-white p-2 rounded-xl border border-slate-200 flex items-center gap-4 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all group cursor-pointer">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center group-hover:bg-white/20 group-hover:text-white"><History size={20} /></div>
              <span className="font-bold">রেকর্ড চেক করুন</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
