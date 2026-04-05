import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BarChart3, RefreshCw, Search, AlertCircle } from 'lucide-react';
import { Branch } from '../types';

interface WrongSummaryItem {
  id: string;
  teacherName: string;
  tpin: string;
  branchName: string;
  branchId: string;
  subject: string;
  wrongCount: number;
}

interface ReportViewProps {
  branches: Branch[];
  callGAS: (action: string, payload: any, silent?: boolean) => Promise<any>;
  onUpdateClick: (branchId: string, tpin: string, subject: string, teacherName: string) => void;
}

export const ReportView: React.FC<ReportViewProps> = ({ branches, callGAS, onUpdateClick }) => {
  const [reportData, setReportData] = useState<WrongSummaryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchReportData = async (silent = false) => {
    const cacheKey = 'reportData_wrong_entries';
    
    // Always try to load from cache first if we don't have data yet
    if (reportData.length === 0) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          setReportData(JSON.parse(cached));
        } catch (e) {}
      }
    }

    if (!silent) {
      setLoading(true);
    }
    setIsRefreshing(true);
    try {
      const allWrongSummaries: WrongSummaryItem[] = [];
      for (const branch of branches) {
        const historyData = await callGAS('getHistory', { branchId: branch.id }, silent);
        if (historyData?.status === 'success') {
          const history = historyData.records;
          const wrongRecords = history.filter((r: any) => r.allMarks.some((m: any) => m.status === 'Wrong'));
          
          const teacherMap = new Map<string, WrongSummaryItem>();
          wrongRecords.forEach((record: any) => {
            const key = `${branch.id}-${record.tpin}-${record.subject}`;
            const wrongMarksCount = record.allMarks.filter((m: any) => m.status === 'Wrong').length;
            
            if (wrongMarksCount > 0) {
              if (teacherMap.has(key)) {
                teacherMap.get(key)!.wrongCount += wrongMarksCount;
              } else {
                teacherMap.set(key, {
                  id: key,
                  teacherName: record.teacherName,
                  tpin: record.tpin,
                  branchName: branch.name,
                  branchId: branch.id,
                  subject: record.subject,
                  wrongCount: wrongMarksCount
                });
              }
            }
          });
          allWrongSummaries.push(...Array.from(teacherMap.values()));
        }
      }
      setReportData(allWrongSummaries);
      localStorage.setItem(cacheKey, JSON.stringify(allWrongSummaries));
    } catch (error) {
      console.error('Failed to fetch report data:', error);
    } finally {
      if (!silent) setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReportData(true);
    const interval = setInterval(() => fetchReportData(true), 30000);
    return () => clearInterval(interval);
  }, [branches]);

  const filteredData = reportData.filter(item => 
    item.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalWrong = reportData.reduce((acc, curr) => acc + curr.wrongCount, 0);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="text-indigo-600" />
            রং এন্ট্রি রিপোর্ট
          </h2>
          <p className="text-slate-500">যে সকল টিচার ও ব্রাঞ্চের এন্ট্রিতে ভুল আছে</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => fetchReportData()}
            disabled={isRefreshing}
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50 cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="খুঁজুন..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-64"
            />
          </div>
        </div>
      </div>

      <div className="bg-red-50 p-4 rounded-2xl border border-red-200 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center shrink-0">
          <AlertCircle size={24} />
        </div>
        <div>
          <p className="text-sm font-bold text-red-700 uppercase">মোট রং এন্ট্রি</p>
          <p className="text-2xl font-bold text-red-600">{totalWrong}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">শিক্ষকের নাম</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">টিপিন (TPIN)</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ব্রাঞ্চ</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">বিষয়</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center text-red-600">রং কাউন্ট</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800">{item.teacherName}</td>
                  <td className="px-6 py-4 text-slate-600">{item.tpin}</td>
                  <td className="px-6 py-4 text-slate-600">{item.branchName}</td>
                  <td className="px-6 py-4 text-slate-600">{item.subject}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-sm font-bold">
                      {item.wrongCount}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => onUpdateClick(item.branchId, item.tpin, item.subject, item.teacherName)}
                      className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
                    >
                      Update করুন
                    </button>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    কোনো রং এন্ট্রি পাওয়া যায়নি
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};
