import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BarChart2, RefreshCw, Search } from 'lucide-react';
import { Branch } from '../types';

interface BranchStats {
  branchId: string;
  branchName: string;
  totalEntries: number;
  totalStudents: number;
  pendingMarks: number;
  updatedMarks: number;
  wrongMarks: number;
}

interface BranchReportViewProps {
  branches: Branch[];
  callGAS: (action: string, payload: any, silent?: boolean) => Promise<any>;
}

export const BranchReportView: React.FC<BranchReportViewProps> = ({ branches, callGAS }) => {
  const [reportData, setReportData] = useState<BranchStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchReportData = async (silent = false) => {
    const cacheKey = 'reportData_branch_stats';
    
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
      const stats: BranchStats[] = [];
      for (const branch of branches) {
        const historyData = await callGAS('getHistory', { branchId: branch.id }, silent);
        if (historyData?.status === 'success') {
          const history = historyData.records;
          
          let students = 0;
          let pending = 0;
          let updated = 0;
          let wrong = 0;

          history.forEach((record: any) => {
            students += record.allMarks.length;
            record.allMarks.forEach((m: any) => {
              if (m.status === 'Pending') pending++;
              if (m.status === 'Updated') updated++;
              if (m.status === 'Wrong') wrong++;
            });
          });

          stats.push({
            branchId: branch.id,
            branchName: branch.name,
            totalEntries: history.length,
            totalStudents: students,
            pendingMarks: pending,
            updatedMarks: updated,
            wrongMarks: wrong
          });
        }
      }
      setReportData(stats);
      localStorage.setItem(cacheKey, JSON.stringify(stats));
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
    item.branchName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalEntries = reportData.reduce((acc, curr) => acc + curr.totalEntries, 0);
  const totalStudents = reportData.reduce((acc, curr) => acc + curr.totalStudents, 0);
  const totalPending = reportData.reduce((acc, curr) => acc + curr.pendingMarks, 0);
  const totalUpdated = reportData.reduce((acc, curr) => acc + curr.updatedMarks, 0);
  const totalWrong = reportData.reduce((acc, curr) => acc + curr.wrongMarks, 0);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BarChart2 className="text-indigo-600" />
            ব্রাঞ্চ রিপোর্ট
          </h2>
          <p className="text-slate-500">সকল ব্রাঞ্চের এন্ট্রি স্ট্যাটাস ও রিয়েল-টাইম আপডেট</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => fetchReportData()}
            disabled={isRefreshing}
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={20} className={isRefreshing ? 'animate-spin text-indigo-600' : ''} />
          </button>
          <div className="relative w-full max-w-xs">
            <input 
              type="text" 
              placeholder="ব্রাঞ্চ খুঁজুন..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">মোট এন্ট্রি</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{totalEntries}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">মোট শিক্ষার্থী</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{totalStudents}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">পেন্ডিং</p>
          <p className="text-2xl font-bold text-amber-500 mt-1">{totalPending}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">আপডেটেড</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{totalUpdated}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">রং মার্কস</p>
          <p className="text-2xl font-bold text-rose-600 mt-1">{totalWrong}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="p-4 font-semibold">ব্রাঞ্চের নাম</th>
                <th className="p-4 font-semibold text-center">এন্ট্রি</th>
                <th className="p-4 font-semibold text-center">শিক্ষার্থী</th>
                <th className="p-4 font-semibold text-center">পেন্ডিং</th>
                <th className="p-4 font-semibold text-center">আপডেটেড</th>
                <th className="p-4 font-semibold text-center">রং</th>
                <th className="p-4 font-semibold text-center">অগ্রগতি</th>
              </tr>
            </thead>
            <tbody>
              {loading && reportData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <RefreshCw className="animate-spin text-indigo-500" size={24} />
                      <p>ডেটা লোড হচ্ছে...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    কোনো ডেটা পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => {
                  const totalMarks = item.pendingMarks + item.updatedMarks + item.wrongMarks;
                  const progress = totalMarks > 0 ? Math.round((item.updatedMarks / totalMarks) * 100) : 0;
                  
                  return (
                    <tr key={item.branchId} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-800">{item.branchName}</div>
                        <div className="text-[10px] text-slate-400 font-medium mt-0.5">ID: BR-0{index + 1}</div>
                      </td>
                      <td className="p-4 text-center font-medium text-slate-800">{item.totalEntries}</td>
                      <td className="p-4 text-center font-medium text-slate-800">{item.totalStudents}</td>
                      <td className="p-4 text-center text-amber-500 font-bold">{item.pendingMarks}</td>
                      <td className="p-4 text-center text-emerald-500 font-bold">{item.updatedMarks}</td>
                      <td className="p-4 text-center text-rose-500 font-bold">{item.wrongMarks}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-indigo-500 rounded-full" 
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-bold text-slate-600 w-8">{progress}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};
