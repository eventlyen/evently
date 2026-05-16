import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Building2, 
  Users, 
  Wallet, 
  Receipt, 
  Plus, 
  Trash2, 
  Edit2,
  Calendar as CalendarIcon, 
  ChevronRight, 
  ChevronLeft,
  Download,
  Printer,
  Search,
  TrendingDown,
  TrendingUp,
  CreditCard,
  Sun,
  Moon,
  PieChart as PieChartIcon,
  BarChart3,
  DollarSign,
  Activity,
  Bell,
  BellRing,
  Settings,
  LogIn,
  LogOut,
  Loader2,
  FileUp,
  FileText,
  Image as ImageIcon,
  Eye,
  FileDown,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { 
  AppState, 
  AttendanceStatus, 
  Employee, 
  Expense, 
  FinanceData 
} from './types';

// Firebase Imports
import { auth, db, signInWithGoogle, logOut, storage } from './lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { FirebaseProvider, useFirebase } from './components/FirebaseProvider';

// New Component Imports
import { Dashboard } from './components/Dashboard';
import { AttendanceTable } from './components/AttendanceTable';
import { InvoiceForm } from './components/InvoiceForm';
import { EmployeeManager } from './components/EmployeeManager';
import { ExpenseManager } from './components/ExpenseManager';
import { EmployeeSearch } from './components/EmployeeSearch';
import { MonthSummary } from './components/MonthSummary';

// Utility Imports
import { calculateEmployeeSalaryStats, calculateEmployeeSalary } from './lib/salaryUtils';

const INITIAL_STATE: AppState = {
  month: new Date().getMonth(),
  year: new Date().getFullYear(),
  hotels: [{ id: 'h1', name: 'Mövenpick' }],
  currentHotelId: 'h1',
  employees: [
    { id: '1', name: 'وليد', salary: 11000, hotelId: 'h1', month: new Date().getMonth(), year: new Date().getFullYear() },
    { id: '2', name: 'محمد', salary: 9500, hotelId: 'h1', month: new Date().getMonth(), year: new Date().getFullYear() },
    { id: '3', name: 'سارة', salary: 10000, hotelId: 'h1', month: new Date().getMonth(), year: new Date().getFullYear() }
  ],
  attendance: {},
  finance: {},
  advances: [],
  expenses: [],
  theme: 'light',
  notifications: {
    enabled: false,
    onStatusChange: true,
    onLowProfit: true,
    onOverdueFinancials: false,
    profitThreshold: 20
  }
};

const MONTHS = [
  'يناير / Jan', 'فبراير / Feb', 'مارس / Mar', 'أبريل / Apr', 'مايو / May', 'يونيو / Jun', 
  'يوليو / Jul', 'أغسطس / Aug', 'سبتمبر / Sep', 'أكتوبر / Oct', 'نوفمبر / Nov', 'ديسمبر / Dec'
];

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4" dir="rtl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-brand-card p-8 rounded-[2.5rem] border border-brand-border shadow-2xl text-center space-y-6"
      >
        <div className="w-20 h-20 bg-brand-primary text-brand-accent rounded-3xl flex items-center justify-center mx-auto shadow-xl">
          <CalendarIcon size={40} />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-brand-primary">Evently Entertainment System</h1>
          <div className="space-y-1">
            <p className="text-brand-neutral font-bold text-sm leading-relaxed">نظام مخصص لشركة ايفنتلي انترتيمنت للخدمات الترفيهية</p>
            <p className="text-brand-neutral/60 font-black text-[10px] tracking-wider uppercase mb-2">Entertainment System For Evently Company Only</p>
            <p className="text-red-600/80 font-bold text-[9px] leading-tight">
              - غير مصرح بأستخدام هذا النظام الا من صاحب الشركة فقط<br/>
              والا ستعرض نفسك الي المسائلة القانونية و حقوق الملكية الفكرية
            </p>
          </div>
        </div>
        <button 
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-4 bg-red-600 text-white rounded-2xl font-black shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" /> : <LogIn size={20} />}
          تسجيل الدخول باستخدام Google
        </button>
        <p className="text-[10px] text-brand-neutral font-medium">بالمتابعة أنت توافق على شروط الاستخدام وسياسة الخصوصية</p>
      </motion.div>
    </div>
  );
}

export function AppContent() {
  const { user } = useFirebase();
  const [state, setState] = useState<AppState>(INITIAL_STATE);

  const [lastSaved, setLastSaved] = useState<string>(new Date().toLocaleTimeString());
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Auto-save every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem('evently_pro_v1', JSON.stringify(stateRef.current));
      setLastSaved(new Date().toLocaleTimeString());
      setShowSaveIndicator(true);
      setTimeout(() => setShowSaveIndicator(false), 2000);
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(interval);
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMonth, setSearchMonth] = useState(state.month);
  const [searchYear, setSearchYear] = useState(state.year);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ 
    isOpen: boolean; 
    title: string; 
    message: string; 
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const showConfirmation = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Notification Helpers
  const toggleNotifications = async () => {
    if (!user) return;
    const nextEnabled = !state.notifications?.enabled;
    
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        'notifications.enabled': nextEnabled
      });

      if (nextEnabled && 'Notification' in window && Notification.permission !== 'granted') {
        await Notification.requestPermission();
      }

      if (nextEnabled && 'Notification' in window && Notification.permission === 'granted') {
        new Notification("Notifications Enabled / تم تفعيل التنبيهات", {
          body: "You will now receive alerts for important events."
        });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}/notifications`);
    }
  };

  const sendNotification = (title: string, body: string) => {
    if (state.notifications?.enabled && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  };

  useEffect(() => {
    if (!user) return;

    const userDocRef = doc(db, 'users', user.uid);
    const unsubs: (() => void)[] = [];

    // 1. Sync User Profile (Settings)
    unsubs.push(onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setState(prev => ({
          ...prev,
          theme: data.theme || prev.theme,
          notifications: data.notifications || prev.notifications,
          currentHotelId: data.currentHotelId || prev.currentHotelId,
          month: data.month ?? prev.month,
          year: data.year ?? prev.year
        }));
      } else {
        // Initial setup for new user
        setDoc(userDocRef, {
          theme: INITIAL_STATE.theme,
          notifications: INITIAL_STATE.notifications,
          currentHotelId: INITIAL_STATE.currentHotelId,
          month: INITIAL_STATE.month,
          year: INITIAL_STATE.year
        }).catch(e => handleFirestoreError(e, OperationType.CREATE, `users/${user.uid}`));
      }
    }));

    // 2. Sync Collections
    const collections = ['hotels', 'employees', 'expenses', 'advances', 'attendance', 'finance'];
    collections.forEach(colName => {
      const colRef = collection(db, 'users', user.uid, colName);
      unsubs.push(onSnapshot(colRef, (snapshot) => {
        if (colName === 'attendance' || colName === 'finance') {
          const map: any = {};
          snapshot.docs.forEach(d => {
            const data = d.data();
            if (colName === 'attendance') {
              map[d.id] = data.status;
            } else {
              map[d.id] = data;
            }
          });
          setState(prev => {
            const currentMapStr = JSON.stringify(prev[colName as keyof AppState]);
            const newMapStr = JSON.stringify(map);
            if (currentMapStr === newMapStr) return prev;
            return { ...prev, [colName]: map };
          });
        } else {
          const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          setState(prev => {
            const currentItemsStr = JSON.stringify(prev[colName as keyof AppState]);
            const newItemsStr = JSON.stringify(items);
            if (currentItemsStr === newItemsStr) return prev;
            return { ...prev, [colName]: items };
          });
        }
      }, (e) => handleFirestoreError(e, OperationType.GET, `users/${user.uid}/${colName}`)));
    });

    return () => unsubs.forEach(unsub => unsub());
  }, [user]);

  useEffect(() => {
    // Sync month/year/hotel selection to Firestore profile
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    updateDoc(userDocRef, {
      month: state.month,
      year: state.year,
      currentHotelId: state.currentHotelId
    }).catch(() => {}); // Silent fail for simple navigation
  }, [state.month, state.year, state.currentHotelId, user]);

  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);

  const toggleTheme = () => {
    if (!user) return;
    const nextTheme = state.theme === 'light' ? 'dark' : 'light';
    updateDoc(doc(db, 'users', user.uid), { theme: nextTheme })
      .catch(e => handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`));
  };

  const daysInMonth = new Date(state.year, state.month + 1, 0).getDate();
  
  const currentFinance = useMemo(() => {
    const key = `${state.year}-${state.month}-${state.currentHotelId}`;
    const defaults: FinanceData = {
      contractValue: 0,
      invoiceNumber: '',
      taxRate: 0,
      status: 'لم تصدر'
    };
    return { ...defaults, ...(state.finance[key] || {}) };
  }, [state.finance, state.year, state.month, state.currentHotelId]);

  const currentExpenses = useMemo(() => {
    return state.expenses.filter(ex => 
      ex.month === state.month && 
      ex.year === state.year && 
      ex.hotelId === state.currentHotelId
    );
  }, [state.expenses, state.month, state.year, state.currentHotelId]);

  const currentEmployees = useMemo(() => {
    return state.employees
      .filter(e => 
        e.hotelId === state.currentHotelId && 
        e.month === state.month && 
        e.year === state.year
      )
      .sort((a, b) => {
        // First sort by order
        if ((a.order ?? 0) !== (b.order ?? 0)) {
          return (a.order ?? 0) - (b.order ?? 0);
        }
        // Fallback to name if order is same
        return a.name.localeCompare(b.name);
      });
  }, [state.employees, state.currentHotelId, state.month, state.year]);

  const currentAdvances = useMemo(() => {
    const activeEmpIds = new Set(currentEmployees.map(e => e.id));
    return state.advances.filter(ad => 
      ad.month === state.month && 
      ad.year === state.year && 
      (ad.hotelId === state.currentHotelId || activeEmpIds.has(ad.empId))
    );
  }, [state.advances, state.month, state.year, state.currentHotelId, currentEmployees]);

  const totals = useMemo(() => {
    const totalBasicSalaries = currentEmployees.reduce((sum, emp) => sum + emp.salary, 0);
    const totalNetSalaries = currentEmployees.reduce((sum, emp) => sum + calculateEmployeeSalary(emp, state), 0);
    const totalExpenses = currentExpenses.reduce((sum, ex) => sum + ex.amount, 0);
    const totalAdvances = currentAdvances.reduce((sum, ad) => sum + ad.amount, 0);
    const taxAmount = currentFinance.contractValue * (currentFinance.taxRate / 100);
    
    // Total Costs should be Salaries (Net + Advances) + Expenses
    // Tax is a pass-through (collected from hotel, paid to govt)
    // So profit = ContractValue - (NetSalaries + Advances + Expenses)
    const totalCosts = totalNetSalaries + totalAdvances + totalExpenses;
    const profit = currentFinance.contractValue - totalCosts;

    return {
      basicSalaries: totalBasicSalaries,
      netSalaries: totalNetSalaries,
      salaries: totalNetSalaries, // For backward compatibility if needed, though better to use explicit names
      expenses: totalExpenses,
      advances: totalAdvances,
      tax: taxAmount, // This is explicitly the VAT amount
      costs: totalCosts,
      profit: profit
    };
  }, [currentEmployees, currentExpenses, currentAdvances, currentFinance.contractValue, currentFinance.taxRate, state]);

  // Monitor Profit Margin
  useEffect(() => {
    if (!state.notifications?.enabled || !state.notifications.onLowProfit) return;
    
    const revenue = totals.tax + totals.costs + totals.profit;
    if (revenue > 0) {
      const margin = (totals.profit / revenue) * 100;
      if (margin < state.notifications.profitThreshold) {
        const key = `notified_low_profit_${state.year}_${state.month}_${state.currentHotelId}`;
        if (!sessionStorage.getItem(key)) {
          sendNotification(
            "Low Profit Margin / هامش ربح منخفض",
            `Alert: Profit margin for ${MONTHS[state.month]} dropped below ${state.notifications.profitThreshold}% (Current: ${Math.round(margin)}%)`
          );
          sessionStorage.setItem(key, 'true');
        }
      }
    }
  }, [totals.profit, totals.costs, state.notifications, state.month, state.year, state.currentHotelId]);

  // Monitor Overdue Financials
  useEffect(() => {
    if (!state.notifications?.enabled || !state.notifications.onOverdueFinancials) return;

    // Check months before current
    const currentMonthNum = state.year * 12 + state.month;
    
    Object.entries(state.finance).forEach(([key, value]) => {
      const data = value as FinanceData;
      const [year, month] = key.split('-').map(Number);
      const dataMonthNum = year * 12 + month;

      if (dataMonthNum < currentMonthNum && data.status !== 'تم التحصيل') {
        const sessionKey = `notified_overdue_${key}`;
        if (!sessionStorage.getItem(sessionKey)) {
          const hotelName = state.hotels.find(h => h.id === key.split('-')[2])?.name || 'Hotel';
          sendNotification(
            "Overdue Payment / مستحقات متأخرة",
            `Warning: Month ${MONTHS[month]} ${year} for ${hotelName} is still ${data.status}.`
          );
          sessionStorage.setItem(sessionKey, 'true');
        }
      }
    });

  }, [state.finance, state.notifications, state.month, state.year]);

  const updateFinance = async (updates: Partial<FinanceData>) => {
    if (!user) return;
    const key = `${state.year}-${state.month}-${state.currentHotelId}`;
    const oldStatus = currentFinance.status;
    const financeRef = doc(db, 'users', user.uid, 'finance', key);
    
    console.log('Updating finance:', key, updates);
    
    try {
      // Remove undefined fields to prevent Firestore errors
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, v]) => v !== undefined)
      );

      const dataToSet = { 
        status: currentFinance.status,
        ...cleanUpdates,
        year: state.year,
        month: state.month,
        hotelId: state.currentHotelId
      };

      await setDoc(financeRef, dataToSet, { merge: true });

      if (updates.status && updates.status !== oldStatus && state.notifications?.onStatusChange) {
        sendNotification(
          "Invoice Status Updated / تحديث حالة الفاتورة",
          `Invoice status changed to "${updates.status}" for ${MONTHS[state.month]} ${state.year}`
        );
      }
    } catch (e) {
      console.error('Error in updateFinance:', e);
      // Construct a detailed error message including data
      const details = {
        error: e instanceof Error ? e.message : String(e),
        data: { 
          status: currentFinance.status,
          year: state.year,
          month: state.month,
          hotelId: state.currentHotelId,
          updates: updates
        }
      };
      handleFirestoreError(new Error(JSON.stringify(details)), OperationType.WRITE, `users/${user.uid}/finance/${key}`);
    }
  };

  const uploadInvoice = async (file: File) => {
    if (!user) {
      alert("يرجى تسجيل الدخول أولاً / Please log in first");
      return;
    }
    if (!state.currentHotelId) {
      alert("يرجى اختيار الفندق أولاً / Please select a hotel first");
      return;
    }
    
    const key = `${state.year}-${state.month}-${state.currentHotelId}`;
    const fileExt = file.name.split('.').pop();
    const fileName = `invoices/${user.uid}/${key}_${Date.now()}.${fileExt}`;
    const storageRef = ref(storage, fileName);

    console.log('Starting upload for file:', file.name, 'Size:', file.size, 'Type:', file.type);
    console.log('Storage path:', fileName);

    try {
      // 1. Upload file
      const snapshot = await uploadBytes(storageRef, file);
      console.log('File uploaded successfully. Snapshot:', snapshot);
      
      const url = await getDownloadURL(snapshot.ref);
      console.log('File URL obtained:', url);

      // 2. Create invoice object
      const newInvoice = {
        id: Math.random().toString(36).substr(2, 9),
        url,
        name: file.name,
        type: file.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : file.type,
        createdAt: Date.now()
      };

      // 3. Update Firestore
      await updateFinance({ 
        invoices: [...(currentFinance.invoices || []), newInvoice]
      });
      console.log('Firestore updated with new invoice');
    } catch (error) {
      console.error("Error uploading invoice", error);
      const errorMessage = error instanceof Error ? error.message : "Internal Error";
      alert(`خطأ في رفع الفاتورة: تأكد من إعدادات Storage في Firebase\nError: ${errorMessage}`);
      throw error; // Re-throw to be caught by form finally block
    }
  };

  const removeInvoiceFile = async (id: string) => {
    if (!user) return;
    
    try {
      const updatedInvoices = (currentFinance.invoices || []).filter(inv => inv.id !== id);
      await updateFinance({ invoices: updatedInvoices });
    } catch (error) {
       console.error("Error removing invoice", error);
    }
  };

  const cycleAttendance = async (empId: string, day: number) => {
    if (!user) return;
    const key = `${state.year}-${state.month}-${empId}-${day}`;
    const statuses: AttendanceStatus[] = ['', 'D', 'A', 'O'];
    const currentStatus = state.attendance[key] || '';
    const nextStatus = statuses[(statuses.indexOf(currentStatus) + 1) % 4];

    const attRef = doc(db, 'users', user.uid, 'attendance', key);
    try {
      if (nextStatus === '') {
        await deleteDoc(attRef);
      } else {
        await setDoc(attRef, { 
          status: nextStatus,
          year: state.year,
          month: state.month,
          empId,
          day 
        });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}/attendance/${key}`);
    }
  };

  const addExpense = async (description: string, amount: number) => {
    if (!description || !amount || !user) return;
    const id = Math.random().toString(36).substr(2, 9);
    const newExpense: Expense = {
      id,
      description,
      amount,
      month: state.month,
      year: state.year,
      hotelId: state.currentHotelId
    };
    
    const expRef = doc(db, 'users', user.uid, 'expenses', id);
    try {
      const { id: _, ...data } = newExpense;
      await setDoc(expRef, data);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `users/${user.uid}/expenses/${id}`);
    }
  };

  const handlePrint = () => {
    window.focus();
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const removeExpense = (id: string) => {
    if (!user) return;
    const expense = state.expenses.find(ex => ex.id === id);
    showConfirmation(
      'حذف مصروف / Delete Expense',
      `هل أنت متأكد من حذف المصفوف "${expense?.description}" بقيمة ${expense?.amount}؟ / Are you sure you want to delete this expense?`,
      async () => {
        const expRef = doc(db, 'users', user.uid, 'expenses', id);
        try {
          await deleteDoc(expRef);
        } catch (e) {
          handleFirestoreError(e, OperationType.DELETE, `users/${user.uid}/expenses/${id}`);
        }
      }
    );
  };

  const exportData = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `evently_pro_backup_${state.year}_${state.month + 1}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const importedData: AppState = JSON.parse(content);
        
        const confirmResult = window.confirm('هل أنت متأكد من استيراد هذه النسخة الاحتياطية؟ سيؤدي ذلك إلى استبدال البيانات الحالية في السحابة. / Are you sure you want to import this backup? This will replace current data in the cloud.');
        if (!confirmResult) return;

        const batch = writeBatch(db);
        
        // Update profile
        batch.set(doc(db, 'users', user.uid), {
          theme: importedData.theme || INITIAL_STATE.theme,
          notifications: importedData.notifications || INITIAL_STATE.notifications,
          currentHotelId: importedData.currentHotelId || INITIAL_STATE.currentHotelId,
          month: importedData.month ?? INITIAL_STATE.month,
          year: importedData.year ?? INITIAL_STATE.year
        });

        // Batch upload collections
        if (Array.isArray(importedData.hotels)) {
          importedData.hotels.forEach(h => {
            const { id, ...data } = h;
            batch.set(doc(db, 'users', user.uid, 'hotels', id), data);
          });
        }

        if (Array.isArray(importedData.employees)) {
          importedData.employees.forEach(emp => {
            const { id, ...data } = emp;
            batch.set(doc(db, 'users', user.uid, 'employees', id), data);
          });
        }

        if (Array.isArray(importedData.expenses)) {
          importedData.expenses.forEach(ex => {
            const { id, ...data } = ex;
            batch.set(doc(db, 'users', user.uid, 'expenses', id), data);
          });
        }

        if (Array.isArray(importedData.advances)) {
          importedData.advances.forEach(adv => {
            const { id, ...data } = adv;
            batch.set(doc(db, 'users', user.uid, 'advances', id), data);
          });
        }

        if (importedData.finance) {
          Object.entries(importedData.finance).forEach(([key, val]) => {
            batch.set(doc(db, 'users', user.uid, 'finance', key), val);
          });
        }

        if (importedData.attendance) {
          Object.entries(importedData.attendance).forEach(([key, status]) => {
            const parts = key.split('-');
            if (parts.length >= 4) {
              batch.set(doc(db, 'users', user.uid, 'attendance', key), { 
                status,
                year: parseInt(parts[0]),
                month: parseInt(parts[1]),
                empId: parts[2],
                day: parseInt(parts[3])
              });
            }
          });
        }

        await batch.commit();
        alert('تم استيراد البيانات بنجاح / Import successful');
      } catch (err) {
        alert('خطأ في استيراد البيانات / Error importing data: ' + (err as Error).message);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const manualSave = () => {
    localStorage.setItem('evently_pro_v1', JSON.stringify(state));
    setLastSaved(new Date().toLocaleTimeString());
    setShowSaveIndicator(true);
    setTimeout(() => setShowSaveIndicator(false), 2000);
  };

  const [newHotelColor, setNewHotelColor] = useState('#ea580c');
  const [showHotelModal, setShowHotelModal] = useState(false);
  const [newHotelName, setNewHotelName] = useState('');
  const [editingHotelId, setEditingHotelId] = useState<string | null>(null);

  const sortedHotels = useMemo(() => {
    return [...state.hotels].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [state.hotels]);

  const addHotel = async () => {
    if (!newHotelName.trim() || !user) return;
    
    try {
      if (editingHotelId) {
        const hotelRef = doc(db, 'users', user.uid, 'hotels', editingHotelId);
        await updateDoc(hotelRef, { 
          name: newHotelName.trim(),
          color: newHotelColor
        });
      } else {
        const newId = Math.random().toString(36).substr(2, 9);
        const maxOrder = state.hotels.reduce((max, h) => Math.max(max, h.order ?? 0), 0);
        const hotelRef = doc(db, 'users', user.uid, 'hotels', newId);
        await setDoc(hotelRef, { 
          name: newHotelName.trim(),
          color: newHotelColor,
          order: maxOrder + 1
        });
        
        // Update current hotel in profile
        await updateDoc(doc(db, 'users', user.uid), { currentHotelId: newId });
      }
      setNewHotelName('');
      setNewHotelColor('#ea580c');
      setEditingHotelId(null);
      setShowHotelModal(false);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}/hotels`);
    }
  };

  const reorderHotel = async (id: string, direction: 'up' | 'down') => {
    if (!user) return;
    const index = sortedHotels.findIndex(h => h.id === id);
    if (index === -1) return;
    
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sortedHotels.length) return;
    
    const h1 = sortedHotels[index];
    const h2 = sortedHotels[targetIndex];
    
    let order1 = h1.order !== undefined ? h1.order : index;
    let order2 = h2.order !== undefined ? h2.order : targetIndex;

    if (order1 === order2) {
      order2 = order1 + 1;
    }

    try {
      const batch = writeBatch(db);
      batch.update(doc(db, 'users', user.uid, 'hotels', h1.id), { order: order2 });
      batch.update(doc(db, 'users', user.uid, 'hotels', h2.id), { order: order1 });
      await batch.commit();
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}/hotels/reorder`);
    }
  };

  const removeHotel = (id: string) => {
    if (state.hotels.length <= 1 || !user) return;
    
    const hotelName = state.hotels.find(h => h.id === id)?.name;
    showConfirmation(
      'حذف فندق / Delete Hotel',
      `هل أنت متأكد من حذف فندق "${hotelName}"؟ سيتم حذف جميع الموظفين والمصروفات المرتبطة به. / Are you sure you want to delete "${hotelName}"? All associated employees and expenses will be removed.`,
      async () => {
        try {
          const batch = writeBatch(db);
          
          // Delete hotel doc
          batch.delete(doc(db, 'users', user.uid, 'hotels', id));
          
          // Delete associated employees
          const employeesToDel = state.employees.filter(e => e.hotelId === id);
          employeesToDel.forEach(e => batch.delete(doc(db, 'users', user.uid, 'employees', e.id)));
          
          // Delete associated expenses
          const expensesToDel = state.expenses.filter(ex => ex.hotelId === id);
          expensesToDel.forEach(ex => batch.delete(doc(db, 'users', user.uid, 'expenses', ex.id)));

          // Delete associated finance records
          const financeToDel = Object.keys(state.finance).filter(k => k.endsWith(`-${id}`));
          financeToDel.forEach(k => batch.delete(doc(db, 'users', user.uid, 'finance', k)));

          await batch.commit();

          // Reset current hotel if deleted
          if (state.currentHotelId === id) {
            const remainingHotels = state.hotels.filter(h => h.id !== id);
            if (remainingHotels.length > 0) {
              await updateDoc(doc(db, 'users', user.uid), { currentHotelId: remainingHotels[0].id });
            }
          }
        } catch (e) {
          handleFirestoreError(e, OperationType.DELETE, `users/${user.uid}/hotels/${id}`);
        }
      }
    );
  };

  const addEmployee = async (name: string, salary: number, position: string = '') => {
    if (!name || !salary || !user) return;
    const now = new Date().toISOString().split('T')[0];
    const id = Math.random().toString(36).substr(2, 9);
    
    // Set order to be the last
    const maxOrder = currentEmployees.reduce((max, emp) => Math.max(max, emp.order ?? 0), 0);
    
    const newEmp: Employee = {
      id,
      name,
      position,
      salary,
      salaryHistory: [{
        amount: salary,
        month: state.month,
        year: state.year,
        date: now
      }],
      hotelId: state.currentHotelId,
      month: state.month,
      year: state.year,
      order: maxOrder + 1
    };

    const empRef = doc(db, 'users', user.uid, 'employees', id);
    try {
      const { id: _, ...data } = newEmp;
      await setDoc(empRef, data);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `users/${user.uid}/employees/${id}`);
    }
  };

  const copyEmployeesFromPreviousMonth = async () => {
    if (!user) return;
    const prevMonth = state.month === 0 ? 11 : state.month - 1;
    const prevYear = state.month === 0 ? state.year - 1 : state.year;
    
    const prevEmployees = state.employees.filter(e => 
      e.hotelId === state.currentHotelId && 
      e.month === prevMonth && 
      e.year === prevYear
    );

    if (prevEmployees.length === 0) {
      alert('لا يوجد موظفين في الشهر السابق لنسخهم');
      return;
    }

    const performCopy = async () => {
      try {
        const batch = writeBatch(db);
        
        // Remove current month employees for this hotel first? 
        // The original logic filtered them out locally.
        const currentMonthEmps = state.employees.filter(e => e.hotelId === state.currentHotelId && e.month === state.month && e.year === state.year);
        currentMonthEmps.forEach(e => batch.delete(doc(db, 'users', user.uid, 'employees', e.id)));

        // Add copied employees
        prevEmployees.forEach(e => {
          const newId = Math.random().toString(36).substr(2, 9);
          const { id: _, ...data } = e;
          batch.set(doc(db, 'users', user.uid, 'employees', newId), {
            ...data,
            month: state.month,
            year: state.year,
            order: data.order // Ensure order is copied
          });
        });

        await batch.commit();
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}/employees/batch-copy`);
      }
    };

    if (currentEmployees.length > 0) {
      showConfirmation(
        'نسخ بيانات الموظفين / Copy Employees',
        'هذا الشهر يحتوي بالفعل على موظفين. هل تريد مسحهم واستبدالهم بموظفي الشهر السابق؟ / This month already has employees. Do you want to clear them and replace them with last month\'s data?',
        performCopy
      );
    } else {
      performCopy();
    }
  };

  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [activeAdvanceEmpId, setActiveAdvanceEmpId] = useState<string | null>(null);

  const addAdvance = async (empId: string, amount: number, reason: string) => {
    if (!amount || !user) return;
    const id = Math.random().toString(36).substr(2, 9);
    const advRef = doc(db, 'users', user.uid, 'advances', id);
    try {
      await setDoc(advRef, {
        empId,
        amount,
        reason: reason || 'سلفة',
        month: state.month,
        year: state.year,
        hotelId: state.currentHotelId
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `users/${user.uid}/advances/${id}`);
    }
  };

  const removeAdvance = async (id: string) => {
    if (!user) return;
    const advRef = doc(db, 'users', user.uid, 'advances', id);
    try {
      await deleteDoc(advRef);
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `users/${user.uid}/advances/${id}`);
    }
  };

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    if (!user) return;
    const emp = state.employees.find(e => e.id === id);
    if (!emp) return;

    const empRef = doc(db, 'users', user.uid, 'employees', id);
    const updatedData: any = { ...updates };
          
    // Track salary history if salary changed
    if (updates.salary !== undefined && updates.salary !== emp.salary) {
      const history = emp.salaryHistory || [];
      const exists = history.find(h => h.month === state.month && h.year === state.year);
      const now = new Date().toISOString().split('T')[0];
      
      if (exists) {
        updatedData.salaryHistory = history.map(h => 
          (h.month === state.month && h.year === state.year) 
            ? { ...h, amount: updates.salary!, date: now } 
            : h
        );
      } else {
        updatedData.salaryHistory = [
          ...history, 
          { amount: updates.salary, month: state.month, year: state.year, date: now }
        ].sort((a, b) => (b.year * 12 + b.month) - (a.year * 12 + a.month));
      }
    }

    try {
      await updateDoc(empRef, updatedData);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}/employees/${id}`);
    }
  };

  const removeEmployee = (id: string) => {
    if (!user) return;
    const empName = state.employees.find(e => e.id === id)?.name;
    showConfirmation(
      'حذف موظف / Delete Employee',
      `هل أنت متأكد من حذف الموظف "${empName}"؟ / Are you sure you want to delete employee "${empName}"?`,
      async () => {
        try {
          const batch = writeBatch(db);
          // Delete employee
          batch.delete(doc(db, 'users', user.uid, 'employees', id));
          
          // Delete associated advances
          const advancesToDel = state.advances.filter(a => a.empId === id);
          advancesToDel.forEach(a => batch.delete(doc(db, 'users', user.uid, 'advances', a.id)));

          // Delete associated attendance
          const attendanceToDel = Object.keys(state.attendance).filter(k => k.includes(`-${id}-`));
          attendanceToDel.forEach(k => batch.delete(doc(db, 'users', user.uid, 'attendance', k)));

          await batch.commit();
        } catch (e) {
          handleFirestoreError(e, OperationType.DELETE, `users/${user.uid}/employees/${id}`);
        }
      }
    );
  };

  const reorderEmployee = async (id: string, direction: 'up' | 'down') => {
    if (!user) return;
    const index = currentEmployees.findIndex(e => e.id === id);
    if (index === -1) return;
    
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentEmployees.length) return;
    
    const emp1 = currentEmployees[index];
    const emp2 = currentEmployees[targetIndex];
    
    let order1 = emp1.order !== undefined ? emp1.order : index;
    let order2 = emp2.order !== undefined ? emp2.order : targetIndex;

    if (order1 === order2) {
      order2 = order1 + 1;
    }

    try {
      const batch = writeBatch(db);
      batch.update(doc(db, 'users', user.uid, 'employees', emp1.id), { order: order2 });
      batch.update(doc(db, 'users', user.uid, 'employees', emp2.id), { order: order1 });
      await batch.commit();
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}/employees/reorder`);
    }
  };

  return (
    <div className="min-h-screen pb-12" dir="rtl">
      {/* Print-only Header */}
      <div className="hidden print:block w-full mb-8 border-b-2 border-brand-primary pb-4">
        <div className="flex justify-between items-end">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-black rounded-xl flex items-center justify-center">
              <CalendarIcon size={24} className="text-brand-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-brand-primary leading-tight text-center">EVENTLY COMPANY " CEO : Walid "</h1>
              <p className="text-sm font-bold text-brand-neutral">تقرير الحضور والماليات الشهري</p>
            </div>
          </div>
          <div className="text-left">
            <h2 className="text-xl font-black text-brand-primary">{state.hotels.find(h => h.id === state.currentHotelId)?.name}</h2>
            <p className="text-sm font-bold text-brand-neutral">{MONTHS[state.month]} {state.year}</p>
          </div>
        </div>
      </div>

      {/* Print-Only Header */}
      <div className="hidden print-only mb-8 text-center border-b-2 border-brand-primary pb-4">
        <h1 className="text-3xl font-black text-brand-primary">EVENTLY ENTERTAINMENT</h1>
        <p className="text-lg font-bold text-brand-neutral">تقرير الحضور والماليات - {MONTHS[state.month]} {state.year}</p>
        <div className="mt-2 text-sm text-brand-neutral">الفندق: {state.hotels.find(h => h.id === state.currentHotelId)?.name}</div>
      </div>

      <header className="bg-brand-card border-b border-brand-border sticky top-0 z-50 backdrop-blur-md bg-brand-card/90 no-print">
        <div className="max-w-full mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="font-black text-lg leading-tight text-brand-primary">EVENTLY COMPANY " CEO : Walid "</h1>
              <p className="text-[10px] uppercase tracking-wider text-brand-neutral font-bold">نظام الحضور والماليات / Financial & Attendance</p>
            </div>
          </div>

            <div className="flex items-center gap-4">
              {showSaveIndicator && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="hidden md:flex items-center gap-1.5 text-[10px] font-black text-brand-gold bg-brand-gold/10 px-2 py-1 rounded-full border border-brand-gold/20"
                >
                  <div className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-pulse" />
                  تم الحفظ تلقائياً / Auto-saved
                </motion.div>
              )}
              {!showSaveIndicator && (
                <div className="hidden lg:block text-[10px] font-bold text-brand-neutral">
                  آخر حفظ: {lastSaved}
                </div>
              )}
              <button 
                onClick={toggleTheme}
              className="p-2 bg-brand-bg rounded-xl text-brand-primary border border-brand-border hover:border-brand-accent transition-all"
            >
              {state.theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <div className="flex gap-1 sm:gap-2">
              <button 
                onClick={handlePrint}
                className="p-2 bg-red-600 rounded-xl text-white border border-red-700 hover:bg-red-700 transition-all group shadow-lg shadow-red-600/20 active:scale-95 flex items-center gap-2 px-3 sm:px-4"
                title="طباعة التقرير / Print Report"
              >
                <Printer size={20} className="group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline text-xs font-black">طباعة / Print</span>
              </button>
              <button 
                onClick={() => setShowSearchPanel(true)}
                className="p-2 bg-red-600 rounded-xl text-white border border-red-700 hover:bg-red-700 transition-all group shadow-lg shadow-red-600/20 active:scale-95 flex items-center gap-2 px-3 sm:px-4"
                title="استعلام الموظفين / Employee Search"
              >
                <Search size={20} className="group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline text-xs font-black">بحث / Search</span>
              </button>
              <button 
                onClick={() => setShowNotificationSettings(true)}
                className={`p-2 bg-brand-card border border-brand-border rounded-xl transition-all hover:scale-105 active:scale-95 ${state.notifications?.enabled ? 'text-brand-gold' : 'text-brand-neutral'}`}
                title="إعدادات التنبيهات / Notification Settings"
              >
                {state.notifications?.enabled ? <BellRing size={20} /> : <Bell size={20} />}
              </button>
              <div className="hidden lg:flex gap-2">
                <button 
                  onClick={async () => {
                    if (!user) return;
                    await updateDoc(doc(db, 'users', user.uid), {
                      month: state.month,
                      year: state.year,
                      currentHotelId: state.currentHotelId,
                      notifications: state.notifications,
                      theme: state.theme
                    });
                    setLastSaved(new Date().toLocaleTimeString());
                    setShowSaveIndicator(true);
                    setTimeout(() => setShowSaveIndicator(false), 2000);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-brand-card border border-brand-border rounded-lg hover:bg-brand-bg transition-all text-brand-primary"
                  title="حفظ البيانات / Save Data"
                >
                  <Receipt size={14} className="text-brand-gold" />
                  حفظ / Save
                </button>
                <label className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-brand-card border border-brand-border rounded-lg hover:bg-brand-bg transition-all text-brand-primary cursor-pointer">
                  <Download size={14} className="rotate-180" />
                  استيراد / Import
                  <input type="file" accept=".json" onChange={importData} className="hidden" />
                </label>
                <button onClick={exportData} className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-brand-card border border-brand-border rounded-lg hover:bg-brand-bg transition-all text-brand-primary">
                  <Download size={14} />
                  تصدير / Export
                </button>
                <button 
                  onClick={logOut}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-red-600/10 border border-red-200 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-95 px-3 sm:px-4"
                  title="تسجيل الخروج / Logout"
                >
                  <LogOut size={16} />
                  خروج / Exit
                </button>
              </div>

              {/* Mobile/Tablet Icons */}
              <div className="flex lg:hidden gap-1">
                <label className="p-2 bg-brand-card border border-brand-border rounded-lg text-brand-primary cursor-pointer hover:bg-brand-bg">
                  <Download size={16} className="rotate-180" />
                  <input type="file" accept=".json" onChange={importData} className="hidden" />
                </label>
                <button onClick={exportData} className="p-2 bg-brand-card border border-brand-border rounded-lg text-brand-primary hover:bg-brand-bg">
                  <Download size={16} />
                </button>
                <button 
                  onClick={logOut}
                  className="p-2 bg-red-600/10 border border-red-200 rounded-lg text-red-600 hover:bg-red-600 hover:text-white"
                  title="خروج"
                >
                  <LogOut size={16} />
                </button>
              </div>

            </div>
          </div>
        </div>
      </header>
      
      <main className="w-full max-w-[1600px] mx-auto px-4 mt-8 space-y-8">
        <div className="bg-zinc-950 p-4 rounded-[2.5rem] border border-zinc-800 no-print shadow-2xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-600/5 to-transparent pointer-events-none" />
          <div className="flex flex-wrap gap-4 items-center justify-center relative z-10">
            {sortedHotels.map(hotel => (
              <div key={hotel.id} className="relative group">
                <button
                  onClick={() => setState(p => ({ ...p, currentHotelId: hotel.id }))}
                  style={{ 
                    backgroundColor: hotel.color || '#ea580c',
                    boxShadow: state.currentHotelId === hotel.id 
                      ? `0 10px 25px -4px ${(hotel.color || '#ea580c')}60` 
                      : 'none'
                  }}
                  className={`px-5 py-2.5 rounded-xl text-sm font-black whitespace-nowrap transition-all flex items-center gap-2 border-2 ${
                    state.currentHotelId === hotel.id 
                    ? 'text-white border-white -translate-y-1 scale-105 active:scale-100 active:translate-y-0 shadow-lg' 
                    : 'text-white/90 border-transparent hover:border-white/30 hover:-translate-y-0.5 opacity-80 hover:opacity-100'
                  }`}
                >
                  <Building2 size={16} className={state.currentHotelId === hotel.id ? 'animate-pulse' : ''} />
                  <span>{hotel.name}</span>
                </button>
                <div className={`absolute -top-3 -left-2 z-20 gap-1 ${
                  state.currentHotelId === hotel.id ? 'flex' : 'hidden group-hover:flex'
                }`}>
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setEditingHotelId(hotel.id); 
                      setNewHotelName(hotel.name); 
                      setNewHotelColor(hotel.color || '#ea580c');
                      setShowHotelModal(true); 
                    }}
                    className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-xl hover:bg-blue-500 scale-100 hover:scale-110 active:scale-90 transition-all border-2 border-zinc-950"
                  >
                    <Edit2 size={12} />
                  </button>
                  <div className="flex flex-col gap-1">
                    <button 
                      onClick={(e) => { e.stopPropagation(); reorderHotel(hotel.id, 'up'); }}
                      className="w-6 h-6 bg-zinc-800 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-zinc-700 transition-colors border border-zinc-700"
                    >
                      <ChevronRight size={14} className="-rotate-90" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); reorderHotel(hotel.id, 'down'); }}
                      className="w-6 h-6 bg-zinc-800 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-zinc-700 transition-colors border border-zinc-700"
                    >
                      <ChevronRight size={14} className="rotate-90" />
                    </button>
                  </div>
                  {state.hotels.length > 1 && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeHotel(hotel.id); }}
                      className="w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center shadow-xl hover:bg-red-500 scale-100 hover:scale-110 active:scale-90 transition-all border-2 border-zinc-950"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button 
              onClick={() => { 
                setEditingHotelId(null); 
                setNewHotelName(''); 
                setNewHotelColor('#ea580c');
                setShowHotelModal(true); 
              }}
              className="w-10 h-10 bg-zinc-900/50 rounded-xl text-zinc-500 hover:bg-white hover:text-black transition-all flex items-center justify-center border border-zinc-800 hover:border-white shadow-sm hover:shadow-lg active:scale-95 group"
              title="إضافة فندق جديد"
            >
              <Plus size={20} className="group-hover:rotate-90 transition-transform" />
            </button>
          </div>
        </div>

        <Dashboard 
          totals={totals} 
          currentFinance={currentFinance} 
          monthInvoices={(() => {
            return Object.entries(state.finance)
              .filter(([key]) => {
                const parts = key.split('-');
                return parts[0] === String(state.year) && parts[1] === String(state.month);
              })
              .flatMap(([key, data]: [string, any]) => {
                const parts = key.split('-');
                const hotelId = parts[2];
                const hotel = state.hotels.find(h => h.id === hotelId);
                return (data.invoices || []).map((inv: any) => ({
                  ...inv,
                  hotelName: hotel?.name || 'Document'
                }));
              });
          })()}
        />

        <section className="no-print">
          <div className="bg-brand-card p-6 rounded-3xl border border-brand-border shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-primary/5 text-brand-primary rounded-xl flex items-center justify-center shadow-sm">
                <CalendarIcon size={20} className="text-brand-accent" />
              </div>
              <h3 className="text-lg font-black text-brand-primary">اختيار شهر العمل / Work Month Selection</h3>
            </div>
            <div className="flex items-center gap-4 bg-brand-bg px-4 py-2 rounded-2xl border border-brand-border group transition-all hover:border-brand-accent/50">
                <button 
                  onClick={() => setState(p => ({ ...p, year: p.year - 1 }))}
                  className="p-1.5 hover:bg-brand-card rounded-lg transition-all text-brand-primary active:scale-90"
                  title="السنة السابقة"
                >
                  <ChevronRight size={18} />
                </button>
                <div className="flex flex-col items-center min-w-20">
                  <span className="text-[10px] font-black text-brand-neutral uppercase tracking-tighter">السنة / Year</span>
                  <span className="font-black text-lg text-brand-primary leading-none">{state.year}</span>
                </div>
                <button 
                  onClick={() => setState(p => ({ ...p, year: p.year + 1 }))}
                  className="p-1.5 hover:bg-brand-card rounded-lg transition-all text-brand-primary active:scale-90"
                  title="السنة التالية"
                >
                  <ChevronLeft size={18} />
                </button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {MONTHS.map((month, index) => (
              <button
                key={month}
                onClick={() => setState(p => ({ ...p, month: index }))}
                className={`py-4 px-4 rounded-xl font-black text-sm transition-all border ${
                  state.month === index
                    ? 'bg-brand-accent text-brand-primary border-brand-accent shadow-lg shadow-brand-accent/20 scale-[1.02]'
                    : 'bg-brand-bg text-brand-primary border-brand-border hover:border-brand-accent/30 hover:bg-brand-card'
                }`}
              >
                {month}
              </button>
            ))}
          </div>
        </div>
      </section>


      <AnimatePresence>
        {activeAdvanceEmpId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 no-print">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveAdvanceEmpId(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-brand-card w-full max-w-md rounded-2xl shadow-2xl p-6 border border-brand-border"
            >
              <h3 className="text-xl font-black mb-6 text-brand-primary">
                سلف ومسحوبات: {currentEmployees.find(e => e.id === activeAdvanceEmpId)?.name}
              </h3>
              
              <div className="space-y-4 max-h-[300px] overflow-y-auto mb-6 pr-1 no-scrollbar">
                {state.advances
                  .filter(a => a.empId === activeAdvanceEmpId && a.month === state.month && a.year === state.year)
                  .map(adv => (
                    <div key={adv.id} className="flex items-center justify-between p-3 bg-brand-bg rounded-xl border border-brand-border">
                      <div>
                        <p className="text-sm font-bold text-brand-primary">{adv.reason}</p>
                        <p className="text-xs text-brand-gold font-black">{adv.amount.toLocaleString()} EGP</p>
                      </div>
                      <button 
                        onClick={() => removeAdvance(adv.id)}
                        className="p-1.5 text-[#c0392b] hover:bg-[#c0392b]/10 rounded-lg transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
              </div>

              <form 
                onSubmit={e => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const amt = parseFloat((form.elements.namedItem('amt') as HTMLInputElement).value);
                  const reason = (form.elements.namedItem('reason') as HTMLInputElement).value;
                  addAdvance(activeAdvanceEmpId!, amt, reason);
                  form.reset();
                }}
                className="space-y-3"
              >
                <div className="flex gap-2">
                  <input name="amt" type="number" placeholder="المبلغ" className="flex-1 px-4 py-2 bg-brand-bg border border-brand-border rounded-xl text-sm font-bold text-brand-primary" required />
                  <input name="reason" type="text" placeholder="السبب (اختياري)" className="flex-[2] px-4 py-2 bg-brand-bg border border-brand-border rounded-xl text-sm text-brand-primary" />
                  <button type="submit" className="px-4 bg-brand-primary text-brand-accent rounded-xl border border-brand-accent/20">
                    <Plus size={18} />
                  </button>
                </div>
              </form>

              <div className="mt-6 flex justify-end">
                <button 
                  onClick={() => setActiveAdvanceEmpId(null)}
                  className="px-6 py-2 bg-brand-bg text-brand-neutral rounded-xl font-bold hover:bg-brand-border transition-all"
                >
                  إغلاق
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHotelModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 no-print">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHotelModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-brand-card w-full max-w-md rounded-2xl shadow-2xl p-6 border border-brand-border"
            >
              <h3 className="text-xl font-black mb-6 text-brand-primary">
                {editingHotelId ? 'تعديل فندق' : 'إضافة فندق جديد'}
              </h3>
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-brand-neutral">اسم الفندق / Hotel Name</label>
                  <input 
                    autoFocus
                    type="text" 
                    value={newHotelName}
                    onChange={e => setNewHotelName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addHotel()}
                    placeholder="مثال: موفنبيك، شيراتون..."
                    className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl font-bold text-brand-primary focus:border-brand-accent transition-colors"
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="text-xs font-bold text-brand-neutral">لون الزر / Button Color</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      '#ea580c', // Orange
                      '#2563eb', // Blue
                      '#059669', // Emerald
                      '#7c3aed', // Violet
                      '#db2777', // Pink
                      '#dc2626', // Red
                      '#d97706', // Amber
                      '#4b5563', // Gray
                      '#000000', // Black
                    ].map(color => (
                      <button
                        key={color}
                        onClick={() => setNewHotelColor(color)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${newHotelColor === color ? 'border-white scale-125 shadow-lg' : 'border-transparent scale-100 hover:scale-110'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    <div className="relative w-8 h-8 rounded-full border-2 border-brand-border overflow-hidden group">
                      <input 
                        type="color" 
                        value={newHotelColor}
                        onChange={e => setNewHotelColor(e.target.value)}
                        className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={addHotel}
                    className="flex-1 py-3 bg-brand-primary text-brand-accent rounded-xl font-black shadow-lg shadow-brand-primary/20 hover:scale-[1.02] transition-all active:scale-95"
                  >
                    {editingHotelId ? 'حفظ التعديلات' : 'إضافة الفندق'}
                  </button>
                  <button 
                    onClick={() => { setShowHotelModal(false); setEditingHotelId(null); setNewHotelName(''); setNewHotelColor('#ea580c'); }}
                    className="px-6 py-3 bg-brand-bg text-brand-neutral rounded-xl font-bold hover:bg-brand-border transition-all border border-brand-border"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

        <AttendanceTable 
          currentEmployees={currentEmployees}
          daysInMonth={daysInMonth}
          state={state}
          cycleAttendance={cycleAttendance}
          setActiveAdvanceEmpId={setActiveAdvanceEmpId}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto w-full pb-12">
          <EmployeeManager 
            currentEmployees={currentEmployees}
            editingEmployeeId={editingEmployeeId}
            setEditingEmployeeId={setEditingEmployeeId}
            updateEmployee={updateEmployee}
            removeEmployee={removeEmployee}
            reorderEmployee={reorderEmployee}
            copyEmployeesFromPreviousMonth={copyEmployeesFromPreviousMonth}
            addEmployee={addEmployee}
            months={MONTHS}
          />

          <ExpenseManager 
            currentExpenses={currentExpenses}
            addExpense={addExpense}
            removeExpense={removeExpense}
          />
        </div>
      </main>

      <AnimatePresence>
        {showSearchPanel && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] no-print"
              onClick={() => setShowSearchPanel(false)}
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-2xl bg-brand-card shadow-2xl z-[151] border-l border-brand-border overflow-y-auto no-scrollbar no-print"
              dir="rtl"
            >
              <div className="sticky top-0 bg-brand-card/90 backdrop-blur-md z-10 flex items-center justify-between p-6 border-b border-brand-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-primary/5 text-brand-primary rounded-xl flex items-center justify-center">
                    <Search size={22} className="text-brand-accent" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-brand-primary">استعلام الموظفين / Employee Search</h3>
                    <p className="text-xs font-bold text-brand-neutral">البحث في سجلات الموظفين والرواتب</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowSearchPanel(false)}
                  className="p-2 hover:bg-brand-bg rounded-xl transition-all text-brand-neutral hover:text-brand-primary group"
                >
                  <Plus className="rotate-45 transition-transform group-hover:scale-110" size={28} />
                </button>
              </div>
              
              <div className="p-6">
                <EmployeeSearch 
                  state={state}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  searchMonth={searchMonth}
                  setSearchMonth={setSearchMonth}
                  searchYear={searchYear}
                  setSearchYear={setSearchYear}
                  months={MONTHS}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <section className="max-w-[1600px] mx-auto px-4 mb-20 no-print">
        <InvoiceForm 
          currentFinance={currentFinance} 
          updateFinance={updateFinance}
          uploadInvoice={uploadInvoice}
          removeInvoiceFile={removeInvoiceFile}
        />
      </section>

      <MonthSummary 
        currentFinance={currentFinance}
        updateFinance={updateFinance}
      />

      <AnimatePresence>
        {showNotificationSettings && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowNotificationSettings(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-brand-card w-full max-w-md rounded-3xl border border-brand-border shadow-2xl p-6 space-y-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-brand-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-gold/10 text-brand-gold rounded-xl flex items-center justify-center">
                    <BellRing size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-brand-primary">إعدادات التنبيهات / Notifications</h3>
                    <p className="text-[10px] font-bold text-brand-neutral">تحكم في التنبيهات الهامة للنظام</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowNotificationSettings(false)}
                  className="p-2 hover:bg-brand-bg rounded-full transition-colors text-brand-neutral"
                >
                  <Plus className="rotate-45" size={24} />
                </button>
              </div>

              <div className="space-y-5">
                <div className="flex items-center justify-between p-4 bg-brand-bg rounded-2xl border border-brand-border">
                  <div>
                    <h4 className="text-sm font-black text-brand-primary">تفعيل التنبيهات / Enable Notifications</h4>
                    <p className="text-[10px] font-bold text-brand-neutral">تلقي تنبيهات على سطح المكتب</p>
                  </div>
                  <button 
                    onClick={toggleNotifications}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${state.notifications?.enabled ? 'bg-brand-gold' : 'bg-brand-neutral/20'}`}
                  >
                    <motion.div 
                      className="w-4 h-4 bg-white rounded-full shadow-sm"
                      animate={{ x: state.notifications?.enabled ? 24 : 0 }}
                    />
                  </button>
                </div>

                <div className={`space-y-4 transition-all ${!state.notifications?.enabled ? 'opacity-40 pointer-events-none' : ''}`}>
                  <div className="flex items-center justify-between p-3 border-b border-brand-border/50">
                    <div className="flex items-center gap-3">
                      <Receipt size={18} className="text-brand-primary" />
                      <span className="text-sm font-bold text-brand-primary">تغيير حالة الفاتورة / Invoice Status Change</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={state.notifications?.onStatusChange}
                      onChange={async (e) => {
                        if (!user) return;
                        await updateDoc(doc(db, 'users', user.uid), {
                          'notifications.onStatusChange': e.target.checked
                        });
                      }}
                      className="w-4 h-4 accent-brand-gold"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border-b border-brand-border/50">
                    <div className="flex items-center gap-3">
                      <DollarSign size={18} className="text-brand-primary" />
                      <span className="text-sm font-bold text-brand-primary">متابعة المستحقات المتاخرة / Overdue Financials</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={state.notifications?.onOverdueFinancials}
                      onChange={async (e) => {
                        if (!user) return;
                        await updateDoc(doc(db, 'users', user.uid), {
                          'notifications.onOverdueFinancials': e.target.checked
                        });
                      }}
                      className="w-4 h-4 accent-brand-gold"
                    />
                  </div>

                  <div className="p-3 bg-brand-primary/5 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <TrendingDown size={18} className="text-[#c0392b]" />
                        <span className="text-sm font-bold text-brand-primary">تنبيه هامش الربح / Low Profit Warning</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={state.notifications?.onLowProfit}
                        onChange={async (e) => {
                          if (!user) return;
                          await updateDoc(doc(db, 'users', user.uid), {
                            'notifications.onLowProfit': e.target.checked
                          });
                        }}
                        className="w-4 h-4 accent-brand-gold"
                      />
                    </div>
                    
                    <div className="space-y-2">
                       <div className="flex justify-between text-[10px] font-black text-brand-neutral">
                         <span>Threshold: {state.notifications?.profitThreshold}%</span>
                         <span>تحذير عند انخفاض الربح عن</span>
                       </div>
                       <input 
                        type="range"
                        min="5"
                        max="50"
                        step="5"
                        value={state.notifications?.profitThreshold}
                        onChange={async (e) => {
                          if (!user) return;
                          await updateDoc(doc(db, 'users', user.uid), {
                            'notifications.profitThreshold': parseInt(e.target.value)
                          });
                        }}
                        className="w-full accent-brand-gold h-1.5 rounded-lg appearance-none bg-brand-border cursor-pointer"
                       />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  onClick={() => setShowNotificationSettings(false)}
                  className="w-full py-3 bg-brand-primary text-brand-accent font-black rounded-xl hover:shadow-lg transition-all"
                >
                  حفظ الإعدادات / Save Settings
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {confirmModal.isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 no-print"
            onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-brand-card w-full max-w-md rounded-3xl border border-brand-border shadow-2xl p-8 text-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-16 h-16 bg-red-500/10 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-black text-brand-primary mb-3">{confirmModal.title}</h3>
              <p className="text-sm font-bold text-brand-neutral leading-relaxed mb-8">
                {confirmModal.message}
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                  className="flex-1 py-3 px-4 rounded-xl border border-brand-border text-brand-primary font-black text-sm hover:bg-brand-bg transition-colors"
                >
                  إلغاء / Cancel
                </button>
                <button 
                  onClick={confirmModal.onConfirm}
                  className="flex-1 py-3 px-4 rounded-xl bg-red-600 text-white font-black text-sm hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all active:scale-95"
                >
                  تأكيد الحذف / Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <FirebaseProvider>
      <AppSwitcher />
    </FirebaseProvider>
  );
}

function AppSwitcher() {
  const { user, loading } = useFirebase();

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-primary" size={40} />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return <AppContent />;
}
