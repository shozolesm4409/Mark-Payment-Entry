import React from 'react';
import { motion } from 'motion/react';
import { AlertCircle } from 'lucide-react';
import { HistoryRecord } from '../types';

interface NotificationsViewProps {
  wrongEntries: HistoryRecord[];
  onFix: (record: HistoryRecord) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ wrongEntries, onFix }) => {
  if (wrongEntries.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-20 text-slate-500">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle size={32} className="text-slate-400" />
        </div>
        <p className="text-lg font-medium">কোনো নোটিফিকেশন নেই</p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center shrink-0">
            <AlertCircle size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-red-700 mb-1">Wrong Entries Detected!</h3>
            <p className="text-red-600 mb-4">
              There are {wrongEntries.length} records with incorrect marks. Please fix them to clear this notification.
            </p>
            <div className="flex flex-wrap gap-2">
              {wrongEntries.map((record) => {
                // Find the first wrong mark to display its roll, or just show the subject
                const wrongMark = record.allMarks.find(m => m.status === 'Wrong');
                const label = wrongMark ? `Fix: Roll ${wrongMark.reg} (${record.subject})` : `Fix: ${record.subject}`;
                
                return (
                  <button
                    key={record.rowId}
                    onClick={() => onFix(record)}
                    className="p-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
