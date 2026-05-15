export type AttendanceStatus = 'D' | 'A' | 'O' | ''; // Duty, Absent, Off

export interface Hotel {
  id: string;
  name: string;
}

export interface SalaryHistory {
  amount: number;
  month: number;
  year: number;
  date: string;
}

export interface Employee {
  id: string;
  name: string;
  position?: string;
  salary: number;
  salaryHistory?: SalaryHistory[];
  hotelId: string;
  month: number;
  year: number;
  order?: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  month: number;
  year: number;
  hotelId: string;
}

export interface InvoiceFile {
  id: string;
  url: string;
  name: string;
  type: string;
  createdAt: number;
}

export interface FinanceData {
  contractValue: number;
  invoiceNumber: string;
  taxRate: number;
  status: 'لم تصدر' | 'تم الإصدار' | 'متأخر' | 'تم التحصيل';
  manualNetSalaries?: number;
  manualNetProfit?: number;
  manualSavedTaxes?: number;
  manualSourceTaxPaid?: number;
  manualNotes?: string;
  issuedInvoiceTotal?: number;
  whtAmount?: number;
  invoiceUrl?: string; // Keep for backward compatibility
  invoiceFileName?: string; // Keep for backward compatibility
  invoices?: InvoiceFile[];
  invoiceDate?: string;
  paymentDate?: string;
}

export interface Advance {
  id: string;
  empId: string;
  amount: number;
  reason: string;
  month: number;
  year: number;
}

export interface NotificationSettings {
  enabled: boolean;
  onStatusChange: boolean;
  onLowProfit: boolean;
  onOverdueFinancials: boolean;
  profitThreshold: number;
}

export interface AppState {
  month: number;
  year: number;
  hotels: Hotel[];
  currentHotelId: string;
  employees: Employee[];
  attendance: Record<string, AttendanceStatus>; // key: `${year}-${month}-${empId}-${day}`
  finance: Record<string, FinanceData>; // key: `${year}-${month}-${hotelId}`
  advances: Advance[];
  expenses: Expense[];
  theme: 'light' | 'dark';
  notifications?: NotificationSettings;
}
