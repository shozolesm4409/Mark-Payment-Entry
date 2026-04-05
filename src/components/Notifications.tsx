import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface NotificationsProps {
  error: string | null;
  success: string | null;
}

export const Notifications: React.FC<NotificationsProps> = ({ error, success }) => {
  return (
    <AnimatePresence>
      {(error || success) && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 z-50 flex flex-col gap-2"
        >
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl shadow-lg shadow-red-100 border border-red-100 flex items-center gap-3">
              <AlertCircle size={20} />
              <span className="font-medium">{error}</span>
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 text-emerald-600 px-4 py-3 rounded-xl shadow-lg shadow-emerald-100 border border-emerald-100 flex items-center gap-3">
              <CheckCircle2 size={20} />
              <span className="font-medium">{success}</span>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
