import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface NotificationsProps {
  error: string | null;
  success: string | null;
}

export const Notifications: React.FC<NotificationsProps> = ({
  error,
  success
}) => {
  return (
    <AnimatePresence>
      {(error || success) && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`mb-6 p-4 rounded-xl flex items-center gap-3 shadow-sm border ${
            error ? 'bg-red-50 border-red-100 text-red-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'
          }`}
        >
          {error ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          <p className="font-medium">{error || success}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
