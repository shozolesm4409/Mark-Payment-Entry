import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BarChart3, RefreshCw, Search, Download } from 'lucide-react';
import { Branch } from '../types';

interface BranchStats {
  branchId: string;
  branchName: string;
  totalEntries: number;
  totalStudents: number;
  pendingCount: number;
  updatedCount: number;
  wrongCount: number;
}

interface ReportViewProps {
  branches: Branch[];
  callGAS: (action: string, payload: any, silent?: boolean) => Promise<any>;
}

export const ReportView: React.FC<ReportViewProps> = ({ branches, callGAS }) => {
  const [reportData, setReportData] = useState<BranchStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchReportData = async (silent = false) => {
    if (!silent) setLoading(true);
    setIsRefreshing(true);
    try {
      // We'll try to get all report data in one call if supported, 
      // otherwise we'll have to fetch for each branch (fallback)
      const data = await callGAS('getReportData', {}, silent);
      if (data?.status === 'success') {
        setReportData(data.stats);
      } else {
        // Fallback: Fetch history for each branch and calculate stats
        const allStats: BranchStats[] = [];
        for (const branch of branches) {
          const historyData = await callGAS('getHistory', { branchId: branch.id }, silent);
          if (historyData?.status === 'success') {
            const history = historyData.records;
            const totalEntries = history.length;
            const totalStudents = history.reduce((acc: number, curr: any) => acc + curr.allMarks.length, 0);
            const pendingCount = history.reduce((acc: number, curr: any) => 
              acc + curr.allMarks.filter((m: any) => m.status === 'Pending').length, 0
            );
            const updatedCount = history.reduce((acc: number, curr: any) => 
              acc + curr.allMarks.filter((m: any) => m.status === 'Updated').length, 0
            );
            const wrongCount = history.reduce((acc: number, curr: any) => 
              acc + curr.allMarks.filter((m: any) => m.status === 'Wrong').length, 0
            );
            allStats.push({
              branchId: branch.id,
              branchName: branch.name,
              totalEntries,
              totalStudents,
              pendingCount,
              updatedCount,
              wrongCount
            });
          }
        }
        setReportData(allStats);
      }
    } catch (error) {
      console.error('Failed to fetch report data:', error);
    } finally {
      if (!silent) setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReportData(true); // Initial fetch should also be silent to avoid intrusive error popups
    // Real-time update every 30 seconds - use silent mode
    const interval = setInterval(() => fetchReportData(true), 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredData = reportData.filter(item => 
    item.branchName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totals = reportData.reduce((acc, curr) => ({
    totalEntries: acc.totalEntries + curr.totalEntries,
    totalStudents: acc.totalStudents + curr.totalStudents,
    pendingCount: acc.pendingCount + curr.pendingCount,
    updatedCount: acc.updatedCount + curr.updatedCount,
    wrongCount: acc.wrongCount + curr.wrongCount,
  }), { totalEntries: 0, totalStudents: 0, pendingCount: 0, updatedCount: 0, wrongCount: 0 });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="text-indigo-600" />
            ব্রাঞ্চ রিপোর্ট
          </h2>
          <p className="text-slate-500">সকল ব্রাঞ্চের এন্ট্রি স্ট্যাটাস ও রিয়েল-টাইম আপডেট</p>
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
              placeholder="ব্রাঞ্চ খুঁজুন..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-64"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase">মোট এন্ট্রি</p>
          <p className="text-xl font-bold text-indigo-600">{totals.totalEntries}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase">মোট শিক্ষার্থী</p>
          <p className="text-xl font-bold text-emerald-600">{totals.totalStudents}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase">পেন্ডিং</p>
          <p className="text-xl font-bold text-amber-600">{totals.pendingCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase">আপডেটেড</p>
          <p className="text-xl font-bold text-blue-600">{totals.updatedCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase">রং মার্কস</p>
          <p className="text-xl font-bold text-red-600">{totals.wrongCount}</p>
        </div>
      </div>

      {/* Report Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ব্রাঞ্চের নাম</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">এন্ট্রি</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">শিক্ষার্থী</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center text-amber-600">পেন্ডিং</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center text-emerald-600">আপডেটেড</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center text-red-600">রং</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">অগ্রগতি</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((item) => {
                const totalMarks = item.pendingCount + item.updatedCount + item.wrongCount;
                const progress = totalMarks > 0 ? Math.round((item.updatedCount / totalMarks) * 100) : 0;
                
                return (
                  <tr key={item.branchId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{item.branchName}</p>
                      <p className="text-[10px] text-slate-400">ID: {item.branchId}</p>
                    </td>
                    <td className="px-6 py-4 text-center font-medium">{item.totalEntries}</td>
                    <td className="px-6 py-4 text-center font-medium">{item.totalStudents}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-1 bg-amber-50 text-amber-600 rounded-lg text-xs font-bold">
                        {item.pendingCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold">
                        {item.updatedCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-bold">
                        {item.wrongCount}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="h-full bg-indigo-500"
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-600">{progress}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    কোন ব্রাঞ্চের তথ্য পাওয়া যায়নি
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
