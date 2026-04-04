import React from 'react';
import { motion } from 'motion/react';
import { Loader2, History, Calendar } from 'lucide-react';
import { HistoryRecord } from '../types';

interface HistoryViewProps {
  loading: boolean;
  history: HistoryRecord[];
  handleEdit: (record: HistoryRecord) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  loading,
  history,
  handleEdit
}) => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {loading && history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin mb-2" size={32} />
          <p>লোড হচ্ছে...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center text-slate-500">
          <History size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">কোন রেকর্ড পাওয়া যায়নি</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {history.map((record) => (
            <div key={record.rowId} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-300 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-slate-800">{record.subject}</h3>
                    {(() => {
                      const statuses = record.allMarks.map(m => m.status);
                      const isWrong = statuses.includes('Wrong');
                      const isPending = statuses.includes('Pending') || statuses.includes('');
                      const isAllUpdated = statuses.every(s => s === 'Updated');
                      
                      let badgeClass = 'bg-amber-100 border-amber-500 text-amber-700';
                      let badgeText = 'Pending';
                      
                      if (isWrong) {
                        badgeClass = 'bg-red-100 border-red-500 text-red-700';
                        badgeText = 'Wrong';
                      } else if (isAllUpdated) {
                        badgeClass = 'bg-emerald-100 border-emerald-500 text-emerald-700';
                        badgeText = 'Updated';
                      }
                      
                      return (
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border shadow-sm ${badgeClass}`}>
                          {badgeText}
                        </span>
                      );
                    })()}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><Calendar size={14} /> {record.entryDate}</span>
                  </div>
                </div>
                <button onClick={() => handleEdit(record)} className="text-indigo-600 font-semibold text-sm hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer">এডিট</button>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-slate-50 rounded-xl">
                <div className="text-center"><p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">BV</p><p className="text-base font-bold text-slate-700">{record.bvCount}</p></div>
                <div className="text-center border-l border-slate-200"><p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">EV</p><p className="text-base font-bold text-slate-700">{record.evCount}</p></div>
                <div className="text-center border-l border-slate-200">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Payment</p>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border shadow-sm inline-block mt-1 ${
                    record.paymentStatus === 'Paid' ? 'bg-emerald-100 border-emerald-500 text-emerald-700' : 
                    'bg-amber-100 border-amber-500 text-amber-700'
                  }`}>
                    {record.paymentStatus || 'Unpaid'}
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-100">
                      <th className="text-left font-medium py-2">রোল</th>
                      <th className="text-left font-medium py-2">মার্কস</th>
                      <th className="text-right font-medium py-2">স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody>
                    {record.allMarks.map((m, idx) => (
                      <tr key={idx} className="border-b border-slate-50 last:border-0">
                        <td className="py-2 font-medium">{m.reg}</td>
                        <td className="py-2">{m.marks}</td>
                        <td className="py-2 text-right">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border shadow-sm ${
                            m.status === 'Updated' ? 'bg-emerald-100 border-emerald-500 text-emerald-700' : 
                            m.status === 'Wrong' ? 'bg-red-100 border-red-500 text-red-700' : 
                            'bg-amber-100 border-amber-500 text-amber-700'
                          }`}>
                            {m.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
