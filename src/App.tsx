import React, { useState, useEffect, useMemo } from 'react';
import { Mark, HistoryRecord, ViewMode, Branch } from './types';

// Components
import { Sidebar } from './components/Sidebar';
import { MobileSidebar } from './components/MobileSidebar';
import { Header } from './components/Header';
import { Notifications } from './components/Notifications';
import { LoginView } from './components/LoginView';
import { BranchHomeView } from './components/BranchHomeView';
import { TeacherVerifyView } from './components/TeacherVerifyView';
import { Dashboard } from './components/Dashboard';
import { EntryForm } from './components/EntryForm';
import { HistoryView } from './components/HistoryView';
import { ReportView } from './components/ReportView';

export default function App() {
  const [view, setView] = useState<ViewMode>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Auth State
  const [pin, setPin] = useState('');
  const [branchName, setBranchName] = useState('');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [tpin, setTpin] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [isVerifyingTeacher, setIsVerifyingTeacher] = useState(false);

  // Entry State
  const [subject, setSubject] = useState('');
  const [bvCount, setBvCount] = useState('');
  const [evCount, setEvCount] = useState('');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [marks, setMarks] = useState<Mark[]>([{ roll: '', marks: '' }]);
  const [isUpdate, setIsUpdate] = useState(false);
  const [currentRowId, setCurrentRowId] = useState<number | null>(null);

  // History State
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  // Session Persistence
  useEffect(() => {
    const savedSession = localStorage.getItem('app_session');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        if (session.pin) setPin(session.pin);
        if (session.branches) setBranches(session.branches);
        if (session.selectedBranch) setSelectedBranch(session.selectedBranch);
        if (session.tpin) setTpin(session.tpin);
        if (session.teacherName) setTeacherName(session.teacherName);
        if (session.view) setView(session.view);
      } catch (e) {
        console.error('Failed to load session', e);
      }
    }
  }, []);

  useEffect(() => {
    const session = {
      pin,
      selectedBranch,
      tpin,
      teacherName,
      view,
      branches
    };
    localStorage.setItem('app_session', JSON.stringify(session));
  }, [pin, selectedBranch, tpin, teacherName, view, branches]);

  // Dynamic Row Generation for New Entry
  useEffect(() => {
    if (!isUpdate && view === 'entry') {
      const bv = parseInt(bvCount) || 0;
      const ev = parseInt(evCount) || 0;
      const total = bv + ev;
      
      if (total > 0) {
        setMarks(prev => {
          if (prev.length === total) return prev;
          const newMarks = [...prev];
          if (newMarks.length < total) {
            for (let i = newMarks.length; i < total; i++) {
              newMarks.push({ roll: '', marks: '' });
            }
            return newMarks;
          } else {
            return newMarks.slice(0, total);
          }
        });
      } else if (bvCount === '' && evCount === '') {
        if (marks.length > 1 && marks.every(m => !m.roll && !m.marks)) {
          setMarks([{ roll: '', marks: '' }]);
        }
      }
    }
  }, [bvCount, evCount, isUpdate, view]);

  // Auto-fill Teacher Name
  useEffect(() => {
    const fetchTeacher = async () => {
      if (tpin.length >= 4 && selectedBranch) {
        setIsVerifyingTeacher(true);
        const data = await callGAS('verifyTeacher', { tpin, branchId: selectedBranch.id }, true);
        if (data?.status === 'success') {
          setTeacherName(data.teacherName);
        } else {
          setTeacherName('');
        }
        setIsVerifyingTeacher(false);
      } else {
        setTeacherName('');
        setIsVerifyingTeacher(false);
      }
    };
    const timer = setTimeout(fetchTeacher, 500);
    return () => clearTimeout(timer);
  }, [tpin, selectedBranch]);

  // Auto-fill Branch Name
  useEffect(() => {
    const fetchBranchName = async () => {
      if (pin.length >= 4) {
        const data = await callGAS('verifyBranch', { pin }, true);
        if (data?.status === 'success' && data.branches && data.branches.length > 0) {
          setBranchName(data.branches[0].name);
        } else {
          setBranchName('');
        }
      } else {
        setBranchName('');
      }
    };
    const timer = setTimeout(fetchBranchName, 500);
    return () => clearTimeout(timer);
  }, [pin]);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Stats Calculation
  const stats = useMemo(() => {
    const totalEntries = history.length;
    const totalStudents = history.reduce((acc, curr) => acc + curr.allMarks.length, 0);
    const pendingCount = history.reduce((acc, curr) => 
      acc + curr.allMarks.filter(m => m.status === 'Pending').length, 0
    );
    const updatedCount = history.reduce((acc, curr) => 
      acc + curr.allMarks.filter(m => m.status === 'Updated').length, 0
    );
    const wrongCount = history.reduce((acc, curr) => 
      acc + curr.allMarks.filter(m => m.status === 'Wrong').length, 0
    );

    return { totalEntries, totalStudents, pendingCount, updatedCount, wrongCount };
  }, [history]);

  const callGAS = async (action: string, payload: any, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await fetch('/api/gas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload })
      });
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        if (!silent) {
          setError('সার্ভার থেকে ভুল তথ্য এসেছে। অনুগ্রহ করে কিছুক্ষণ পর চেষ্টা করুন।');
        }
        return null;
      }

      const data = await response.json();
      
      if (data.status === 'error') {
        if (!silent) {
          setError(data.message + (data.debug ? ` (${data.debug})` : ''));
        }
        return null;
      }
      
      return data;
    } catch (err: any) {
      console.error('API Error:', err);
      if (!silent) {
        if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
          setError('সার্ভারের সাথে যোগাযোগ বিচ্ছিন্ন হয়েছে। আপনার ইন্টারনেট কানেকশন চেক করুন।');
        } else {
          setError('সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না।');
        }
      }
      return null;
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleVerifyBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = await callGAS('verifyBranch', { pin });
    if (data?.status === 'success') {
      setBranches(data.branches);
      if (data.branches.length === 1) {
        setSelectedBranch(data.branches[0]);
      }
      setView('branch-home');
    } else {
      setError(data?.message || 'ভুল পিন!');
    }
  };

  const handleVerifyTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranch) return;
    const data = await callGAS('verifyTeacher', { tpin, branchId: selectedBranch.id });
    if (data?.status === 'success') {
      setTeacherName(data.teacherName);
      fetchHistory();
      setView('dashboard');
    } else {
      setError(data?.message || 'সঠিক Tpin দিন');
    }
  };

  const handleSaveData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranch || !teacherName) return;

    const finalMarks = marks.map(m => ({
      ...m,
      status: m.status === 'Wrong' ? 'Pending' : m.status
    }));

    const payload = {
      data: {
        branchName: selectedBranch.name,
        branchId: selectedBranch.id,
        subject,
        teacherName,
        teacherTPIN: tpin,
        bvCount,
        evCount,
        entryDate,
        allMarks: finalMarks,
        isUpdate,
        rowId: currentRowId
      }
    };

    const data = await callGAS('saveData', payload);
    if (data?.status === 'success') {
      setSuccess(isUpdate ? 'সফলভাবে আপডেট হয়েছে!' : 'সফলভাবে সেভ হয়েছে!');
      resetForm();
      fetchHistory();
      setView('dashboard');
    } else {
      setError('ডাটা সেভ করা যায়নি।');
    }
  };

  const fetchHistory = async () => {
    if (!selectedBranch) return;
    const data = await callGAS('getHistory', { branchId: selectedBranch.id });
    if (data?.status === 'success') {
      setHistory(data.records);
    }
  };

  // Fetch history on session restore or view change
  useEffect(() => {
    if (selectedBranch && teacherName && (view === 'dashboard' || view === 'history' || view === 'entry')) {
      fetchHistory();
    }
  }, [selectedBranch, teacherName, view]);

  const resetForm = () => {
    setSubject('');
    setBvCount('');
    setEvCount('');
    setMarks([{ roll: '', marks: '' }]);
    setIsUpdate(false);
    setCurrentRowId(null);
  };

  const handleEdit = (record: HistoryRecord) => {
    setSubject(record.subject);
    setBvCount(record.bvCount.toString());
    setEvCount(record.evCount.toString());
    setEntryDate(record.entryDate);
    setMarks(record.allMarks.map(m => ({ roll: m.reg, marks: m.marks, status: m.status })));
    setIsUpdate(true);
    setCurrentRowId(record.rowId);
    setView('entry');
    setIsSidebarOpen(false);
  };

  const addMarkRow = () => setMarks([...marks, { roll: '', marks: '' }]);
  const removeMarkRow = (index: number) => setMarks(marks.filter((_, i) => i !== index));
  const updateMark = (index: number, field: keyof Mark, value: string) => {
    const newMarks = [...marks];
    newMarks[index][field] = value;
    setMarks(newMarks);
  };

  const handleTeacherLogout = () => {
    setTpin('');
    setTeacherName('');
    resetForm();
    setView('branch-home');
    setIsSidebarOpen(false);
  };

  const handleBranchLogout = () => {
    setView('login');
    setPin('');
    setTpin('');
    setBranches([]);
    setSelectedBranch(null);
    setTeacherName('');
    resetForm();
    setIsSidebarOpen(false);
  };

  const isAuthView = view === 'login' || view === 'teacher-verify';
  const showSidebar = branches.length > 0 && view !== 'login';
  const isBranchHome = view === 'branch-home';
  const isTeacherVerify = view === 'teacher-verify';
  const isReport = view === 'report';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 flex">
      <Sidebar 
        showSidebar={showSidebar}
        branches={branches}
        view={view}
        selectedBranch={selectedBranch}
        teacherName={teacherName}
        isBranchHome={isBranchHome || isReport}
        isTeacherVerify={isTeacherVerify}
        setView={setView}
        setSelectedBranch={setSelectedBranch}
        setIsSidebarOpen={setIsSidebarOpen}
        resetForm={resetForm}
        handleBranchLogout={handleBranchLogout}
        handleTeacherLogout={handleTeacherLogout}
      />

      <MobileSidebar 
        isSidebarOpen={isSidebarOpen}
        showSidebar={showSidebar}
        branches={branches}
        view={view}
        selectedBranch={selectedBranch}
        isBranchHome={isBranchHome || isReport}
        isTeacherVerify={isTeacherVerify}
        setView={setView}
        setSelectedBranch={setSelectedBranch}
        setIsSidebarOpen={setIsSidebarOpen}
        resetForm={resetForm}
        handleBranchLogout={handleBranchLogout}
        handleTeacherLogout={handleTeacherLogout}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {!isAuthView && !isBranchHome && !isReport && (
          <Header 
            view={view}
            isUpdate={isUpdate}
            teacherName={teacherName}
            selectedBranch={selectedBranch}
            setIsSidebarOpen={setIsSidebarOpen}
          />
        )}

        <main className={`flex-1 p-4 lg:p-8 ${view === 'login' || isBranchHome || isTeacherVerify ? 'flex items-center justify-center' : ''}`}>
          <Notifications error={error} success={success} />

          <div className={isAuthView ? 'w-full max-w-md' : 'max-w-6xl mx-auto'}>
            {view === 'branch-home' && (
              <BranchHomeView 
                selectedBranch={selectedBranch}
                setView={setView}
                handleBranchLogout={handleBranchLogout}
                setIsSidebarOpen={setIsSidebarOpen}
              />
            )}

            {view === 'login' && (
              <LoginView 
                pin={pin}
                setPin={setPin}
                branchName={branchName}
                handleVerifyBranch={handleVerifyBranch}
                loading={loading}
              />
            )}

            {view === 'teacher-verify' && (
              <TeacherVerifyView 
                selectedBranch={selectedBranch}
                tpin={tpin}
                setTpin={setTpin}
                teacherName={teacherName}
                isVerifyingTeacher={isVerifyingTeacher}
                handleVerifyTeacher={handleVerifyTeacher}
                loading={loading}
                setView={setView}
              />
            )}

            {view === 'dashboard' && (
              <Dashboard 
                stats={{
                  ...stats,
                  checkedCount: stats.updatedCount, // Mapping updatedCount to checkedCount for Dashboard prop
                  wrongCount: stats.wrongCount
                }}
                history={history}
                setView={setView}
                handleEdit={handleEdit}
                resetForm={resetForm}
              />
            )}

            {view === 'entry' && (
              <EntryForm 
                subject={subject}
                setSubject={setSubject}
                entryDate={entryDate}
                setEntryDate={setEntryDate}
                bvCount={bvCount}
                setBvCount={setBvCount}
                evCount={evCount}
                setEvCount={setEvCount}
                marks={marks}
                updateMark={updateMark}
                addMarkRow={addMarkRow}
                removeMarkRow={removeMarkRow}
                isUpdate={isUpdate}
                handleSaveData={handleSaveData}
                setView={setView}
                loading={loading}
              />
            )}

            {view === 'history' && (
              <HistoryView 
                loading={loading}
                history={history}
                handleEdit={handleEdit}
              />
            )}

            {view === 'report' && (
              <ReportView 
                branches={branches}
                callGAS={callGAS}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
