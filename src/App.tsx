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
import { BranchReportView } from './components/BranchReportView';
import { NotificationsView } from './components/NotificationsView';
import { Footer } from './components/Footer';

export default function App() {
  const [view, setView] = useState<ViewMode>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Auth State
  const [pin, setPin] = useState('');
  const [branchName, setBranchName] = useState('');
  const [coordinator, setCoordinator] = useState('');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [tpin, setTpin] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [isVerifyingTeacher, setIsVerifyingTeacher] = useState(false);
  const [targetUpdate, setTargetUpdate] = useState<{ branchId: string, tpin: string, subject: string } | null>(null);

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

  const wrongEntries = useMemo(() => {
    return history.filter(record => record.allMarks.some(m => m.status === 'Wrong'));
  }, [history]);
  const wrongEntriesCount = wrongEntries.length;

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
      
      if (total > 0 && total > marks.length) {
        setMarks(prev => {
          const newMarks = [...prev];
          for (let i = newMarks.length; i < total; i++) {
            newMarks.push({ roll: '', marks: '' });
          }
          return newMarks;
        });
      } else if (bvCount === '' && evCount === '') {
        if (marks.length > 1 && marks.every(m => !m.roll && !m.marks)) {
          setMarks([{ roll: '', marks: '' }]);
        }
      }
    }
  }, [bvCount, evCount, isUpdate, view]);

  const isFormValid = useMemo(() => {
    const bv = parseInt(bvCount) || 0;
    const ev = parseInt(evCount) || 0;
    const totalExpected = bv + ev;
    
    if (!subject || !entryDate) return false;
    if (marks.length < totalExpected) return false;
    if (marks.length === 0) return false;
    
    return marks.every(m => String(m.roll || '').trim() !== '' && String(m.marks || '').trim() !== '');
  }, [subject, entryDate, bvCount, evCount, marks]);

  // Auto-fill Teacher Name
  useEffect(() => {
    const fetchTeacher = async () => {
      if (view !== 'teacher-verify') return;
      
      if (targetUpdate && targetUpdate.tpin === tpin) {
        return; // Skip auto-fetch if we came from report update
      }
      
      if (tpin.length >= 2 && selectedBranch) {
        setIsVerifyingTeacher(true);
        const data = await callGAS('verifyTeacher', { tpin, branchId: selectedBranch.id }, true);
        if (data?.status === 'success') {
          if (data.teacherName) {
            setTeacherName(data.teacherName);
          }
        } else if (data !== null) {
          // Only clear if we got an explicit error response, not a network failure (null)
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
  }, [tpin, selectedBranch, targetUpdate, view]);

  // Auto-fill Branch Name
  useEffect(() => {
    const fetchBranchName = async () => {
      if (pin.length >= 4) {
        const data = await callGAS('verifyBranch', { pin }, true);
        if (data?.status === 'success' && data.branches && data.branches.length > 0) {
          setBranchName(data.branches[0].name);
          setCoordinator(data.branches[0].coordinator || '');
        } else {
          setBranchName('');
          setCoordinator('');
        }
      } else {
        setBranchName('');
        setCoordinator('');
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
    
    let lastError;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await fetch('/api/gas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, ...payload })
        });
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          if (!silent) {
            if (response.status === 404) {
              setError('এপিআই এন্ডপয়েন্ট পাওয়া যায়নি (404)। ডেপ্লয়মেন্ট কনফিগারেশন চেক করুন।');
            } else {
              setError(`সার্ভার থেকে ভুল তথ্য এসেছে (HTTP ${response.status})।`);
            }
          }
          if (!silent) setLoading(false);
          return null;
        }

        const data = await response.json();
        
        if (data.status === 'error') {
          if (!silent) {
            setError(data.message + (data.debug ? ` (${data.debug})` : ''));
          }
          if (!silent) setLoading(false);
          return null;
        }

        if (data.status !== 'success') {
          if (!silent) {
            setError('সার্ভার থেকে অপ্রত্যাশিত তথ্য পাওয়া গেছে।');
          }
          if (!silent) setLoading(false);
          return null;
        }
        
        if (!silent) setLoading(false);
        return data;
      } catch (err: any) {
        lastError = err;
        if (err.name === 'TypeError' && err.message === 'Failed to fetch' && attempt < 3) {
          if (!silent) console.warn(`API Error: Failed to fetch. Retrying attempt ${attempt + 1}...`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s before retry
          continue;
        }
        break; // Break on other errors or if max attempts reached
      }
    }

    // If we reach here, all attempts failed
    if (!silent) {
      console.error('API Error:', lastError);
      if (lastError?.name === 'TypeError' && lastError?.message === 'Failed to fetch') {
        setError('সার্ভারের সাথে যোগাযোগ বিচ্ছিন্ন হয়েছে। আপনার ইন্টারনেট কানেকশন চেক করুন।');
      } else {
        setError('সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না।');
      }
    } else {
      // For silent background requests, just log a warning instead of an error
      console.warn('Background API request failed:', lastError?.message || 'Unknown error');
    }
    
    if (!silent) setLoading(false);
    return null;
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
    }
  };

  const handleVerifyTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranch) return;

    if (targetUpdate && targetUpdate.tpin === tpin && teacherName) {
      // Direct update mode - skip verifyTeacher API call since we already have the teacherName
      const historyData = await callGAS('getHistory', { branchId: selectedBranch.id, teacherName });
      if (historyData?.status === 'success') {
        setHistory(historyData.records);
        const recordToUpdate = historyData.records.find((r: HistoryRecord) => 
          r.subject === targetUpdate.subject && r.allMarks.some(m => m.status === 'Wrong')
        );
        if (recordToUpdate) {
          handleEdit(recordToUpdate);
          setTargetUpdate(null);
          return;
        }
      }
      fetchHistory();
      setView('dashboard');
      setTargetUpdate(null);
      return;
    }

    const data = await callGAS('verifyTeacher', { tpin, branchId: selectedBranch.id });
    if (data?.status === 'success') {
      if (data.teacherName) {
        setTeacherName(data.teacherName);
      }
      
      fetchHistory();
      setView('dashboard');
    }
  };

  const handleUpdateClick = (branchId: string, tpin: string, subject: string, teacherName: string) => {
    const branch = branches.find(b => b.id === branchId);
    if (branch) {
      setSelectedBranch(branch);
      setTpin(tpin);
      setTeacherName(teacherName);
      setTargetUpdate({ branchId, tpin, subject });
      setView('teacher-verify');
    }
  };

  const handleSubjectChange = (newSubject: string) => {
    setSubject(newSubject);
    if (newSubject === 'বাংলা') {
      setEvCount('0');
      setBvCount('');
    } else if (newSubject === 'ইংরেজি') {
      setBvCount('0');
      setEvCount('');
    } else if (['গণিত', 'বিজ্ঞান', 'বাংলাদেশ ও বিশ্ব-পরিচিতি'].includes(newSubject)) {
      setBvCount('0');
      setEvCount('0');
    } else {
      setBvCount('');
      setEvCount('');
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
      
      // Clear report caches so they fetch fresh data next time
      localStorage.removeItem('reportData_wrong_entries');
      localStorage.removeItem('reportData_branch_stats');
      
      setView('dashboard');
    }
  };

  const fetchHistory = async (silent = false) => {
    if (!selectedBranch || !teacherName) return;
    
    const cacheKey = `history_${selectedBranch.id}_${teacherName}`;
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      try {
        setHistory(JSON.parse(cachedData));
      } catch (e) {
        console.error('Failed to parse cached history', e);
      }
    }

    const data = await callGAS('getHistory', { branchId: selectedBranch.id, teacherName }, silent);
    if (data?.status === 'success') {
      setHistory(data.records);
      localStorage.setItem(cacheKey, JSON.stringify(data.records));
    }
  };

  // Fetch history on session restore or view change
  useEffect(() => {
    if (selectedBranch && teacherName && (view === 'dashboard' || view === 'history' || view === 'entry')) {
      fetchHistory(true);
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
    setMarks(record.allMarks.map(m => ({ roll: String(m.reg || ''), marks: String(m.marks || ''), status: m.status })));
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

  const isAuthView = view === 'login' || view === 'teacher-verify' || view === 'branch-home';
  const showSidebar = branches.length > 0 && view !== 'login';
  const isBranchHome = ['branch-home', 'branch-report', 'report'].includes(view);
  const isTeacherVerify = view === 'teacher-verify';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 flex">
      <Sidebar 
        showSidebar={showSidebar}
        branches={branches}
        view={view}
        selectedBranch={selectedBranch}
        teacherName={teacherName}
        pin={pin}
        isBranchHome={isBranchHome}
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
        pin={pin}
        isBranchHome={isBranchHome}
        isTeacherVerify={isTeacherVerify}
        setView={setView}
        setSelectedBranch={setSelectedBranch}
        setIsSidebarOpen={setIsSidebarOpen}
        resetForm={resetForm}
        handleBranchLogout={handleBranchLogout}
        handleTeacherLogout={handleTeacherLogout}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          view={view}
          isUpdate={isUpdate}
          teacherName={teacherName}
          tpin={tpin}
          selectedBranch={selectedBranch}
          setIsSidebarOpen={setIsSidebarOpen}
          wrongEntriesCount={wrongEntriesCount}
          onNotificationClick={() => setView('notifications')}
        />

        <main className={`flex-1 p-4 lg:p-8 ${view === 'login' || view === 'branch-home' || isTeacherVerify ? 'flex items-center justify-center' : ''}`}>
          <Notifications error={error} success={success} />

          <div className={isAuthView ? 'w-full max-w-md' : 'max-w-6xl mx-auto w-full'}>
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
                coordinator={coordinator}
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
                setSubject={handleSubjectChange}
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
                isFormValid={isFormValid}
              />
            )}

            {view === 'history' && (
              <HistoryView 
                loading={loading}
                history={history}
                handleEdit={handleEdit}
              />
            )}

            {view === 'branch-report' && (
              <BranchReportView 
                branches={branches}
                callGAS={callGAS}
              />
            )}

            {view === 'report' && (
              <ReportView 
                branches={branches}
                callGAS={callGAS}
                onUpdateClick={handleUpdateClick}
              />
            )}

            {view === 'notifications' && (
              <NotificationsView 
                wrongEntries={wrongEntries}
                onFix={handleEdit}
              />
            )}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
