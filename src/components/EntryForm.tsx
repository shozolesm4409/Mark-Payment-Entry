import React from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, Save, Loader2 } from 'lucide-react';
import { Mark, ViewMode } from '../types';

interface EntryFormProps {
  subject: string;
  setSubject: (subject: string) => void;
  entryDate: string;
  setEntryDate: (date: string) => void;
  bvCount: string;
  setBvCount: (count: string) => void;
  evCount: string;
  setEvCount: (count: string) => void;
  marks: Mark[];
  updateMark: (index: number, field: keyof Mark, value: string) => void;
  addMarkRow: () => void;
  removeMarkRow: (index: number) => void;
  isUpdate: boolean;
  handleSaveData: (e: React.FormEvent) => void;
  setView: (view: ViewMode) => void;
  loading: boolean;
  isFormValid: boolean;
}

export const EntryForm: React.FC<EntryFormProps> = ({
  subject,
  setSubject,
  entryDate,
  setEntryDate,
  bvCount,
  setBvCount,
  evCount,
  setEvCount,
  marks,
  updateMark,
  addMarkRow,
  removeMarkRow,
  isUpdate,
  handleSaveData,
  setView,
  loading,
  isFormValid
}) => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-3xl mx-auto">
      <form onSubmit={handleSaveData} className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">পরীক্ষকের পেমেন্ট</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">বিষয়</label>
              <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none appearance-none" required>
                <option value="">সিলেক্ট করুন</option>
                <option value="বাংলা">বাংলা</option>
                <option value="ইংরেজি">ইংরেজি</option>
                <option value="গণিত">গণিত</option>
                <option value="বিজ্ঞান">বিজ্ঞান</option>
                <option value="বাংলাদেশ ও বিশ্ব-পরিচিতি">বাংলাদেশ ও বিশ্ব-পরিচিতি</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">তারিখ</label>
              <input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
            </div>
          </div>
          {subject && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(subject === 'বাংলা' || ['গণিত', 'বিজ্ঞান', 'বাংলাদেশ ও বিশ্ব-পরিচিতি'].includes(subject)) && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">BV Count</label>
                  <input 
                    type="number" 
                    value={bvCount} 
                    onChange={(e) => setBvCount(e.target.value)} 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                    required 
                  />
                </div>
              )}
              {(subject === 'ইংরেজি' || ['গণিত', 'বিজ্ঞান', 'বাংলাদেশ ও বিশ্ব-পরিচিতি'].includes(subject)) && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">EV Count</label>
                  <input 
                    type="number" 
                    value={evCount} 
                    onChange={(e) => setEvCount(e.target.value)} 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                    required 
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800">শিক্ষার্থীদের মার্কস</h3>
            {!isUpdate && (
              <button type="button" onClick={addMarkRow} className="flex items-center gap-1 text-sm bg-indigo-50 text-indigo-600 p-2 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer">
                <Plus size={16} />নতুন রো
              </button>
            )}
          </div>
          <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            <div className="space-y-3">
              {marks.map((mark, index) => (
                <div key={index} className="flex gap-3 items-end">
                  <div className="w-10 pb-2 text-center text-slate-400 font-bold text-sm">
                    {index === 0 && <label className="block text-[10px] uppercase tracking-wider mb-2">SL</label>}
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    {index === 0 && <label className="block text-xs font-semibold text-slate-500 mb-1">রোল</label>}
                    <input 
                      type="text" 
                      value={mark.roll} 
                      onChange={(e) => updateMark(index, 'roll', e.target.value)} 
                      className={`w-full px-3 py-2 bg-slate-50 border ${mark.status === 'Wrong' ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'} rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none`} 
                      placeholder="রোল" 
                      required 
                    />
                  </div>
                  <div className="flex-1">
                    {index === 0 && <label className="block text-xs font-semibold text-slate-500 mb-1">মার্কস</label>}
                    <input 
                      type="number" 
                      value={mark.marks} 
                      onChange={(e) => updateMark(index, 'marks', e.target.value)} 
                      className={`w-full px-3 py-2 bg-slate-50 border ${mark.status === 'Wrong' ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'} rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none`} 
                      placeholder="মার্কস" 
                      required 
                    />
                  </div>
                  {isUpdate && (
                    <div className="w-24">
                      {index === 0 && <label className="block text-xs font-semibold text-slate-500 mb-1">স্ট্যাটাস</label>}
                      <div className={`px-3 py-2 rounded-lg text-center text-[10px] font-black uppercase border-2 shadow-sm ${
                        mark.status === 'Updated' ? 'bg-emerald-100 border-emerald-500 text-emerald-700' :
                        mark.status === 'Wrong' ? 'bg-red-100 border-red-500 text-red-700' :
                        'bg-amber-100 border-amber-500 text-amber-700'
                      }`}>
                        {mark.status || 'Pending'}
                      </div>
                    </div>
                  )}
                  {marks.length > 1 && !isUpdate && <button type="button" onClick={() => removeMarkRow(index)} className="p-2 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"><Trash2 size={20} /></button>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button type="button" onClick={() => setView('dashboard')} className="flex-1 bg-white border border-slate-200 text-slate-600 font-bold p-2 rounded-xl hover:bg-slate-50 transition-all cursor-pointer">বাতিল করুন</button>
          <button type="submit" disabled={loading || !isFormValid} className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-2 rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer">
            {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} />{isUpdate ? 'আপডেট করুন' : 'সেভ করুন'}</>}
          </button>
        </div>
      </form>
    </motion.div>
  );
};
