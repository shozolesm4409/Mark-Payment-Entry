export interface Branch {
  name: string;
  id: string;
  coordinator: string;
}

export interface Teacher {
  name: string;
  tpin: string;
}

export interface Mark {
  roll: string;
  marks: string;
  status?: string;
}

export interface HistoryRecord {
  rowId: number;
  subject: string;
  teacherName: string;
  tpin: string;
  bvCount: number;
  evCount: number;
  entryDate: string;
  paymentStatus?: string;
  allMarks: { reg: string; marks: string; status: string }[];
}

export type ViewMode = 'login' | 'branch-home' | 'teacher-verify' | 'dashboard' | 'entry' | 'history' | 'report';
