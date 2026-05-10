import React from 'react';
import { CreditCard } from 'lucide-react';
import { FinanceData } from '../types';

interface InvoiceFormProps {
  currentFinance: FinanceData;
  updateFinance: (updates: Partial<FinanceData>) => void;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({ currentFinance, updateFinance }) => {
  return (
    <section className="bg-brand-card p-6 rounded-2xl border border-brand-border shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <CreditCard className="text-brand-primary" size={20} />
        <h3 className="font-black text-brand-primary">بيانات الفاتورة / Invoice Data</h3>
      </div>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-brand-neutral">قيمة التعاقد / Contract Value</label>
          <input 
            type="number" 
            value={currentFinance.contractValue || ''} 
            onChange={e => updateFinance({ contractValue: parseFloat(e.target.value) || 0 })}
            className="w-full px-4 py-2 bg-brand-bg border border-brand-border rounded-xl text-brand-primary font-bold"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-brand-neutral">رقم الفاتورة / Invoice No.</label>
          <input 
            type="text" 
            value={currentFinance.invoiceNumber} 
            onChange={e => updateFinance({ invoiceNumber: e.target.value })}
            className="w-full px-4 py-2 bg-brand-bg border border-brand-border rounded-xl text-brand-primary font-bold"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-brand-neutral">الضرائب / Tax (%)</label>
            <input 
              type="number" 
              value={currentFinance.taxRate || ''} 
              onChange={e => updateFinance({ taxRate: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2 bg-brand-bg border border-brand-border rounded-xl text-brand-primary font-bold"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-brand-neutral">حالة الفاتورة / Status</label>
            <select 
              value={currentFinance.status} 
              onChange={e => updateFinance({ status: e.target.value as any })}
              className={`w-full px-4 py-2 bg-brand-bg border rounded-xl font-black outline-none transition-all ${
                currentFinance.status === 'متأخر' ? 'border-red-500 text-red-600' : 
                currentFinance.status === 'تم التحصيل' ? 'border-green-500 text-green-600' :
                'border-brand-border text-brand-primary'
              }`}
            >
              <option value="لم تصدر">لم تصدر</option>
              <option value="تم الإصدار">تم الإصدار</option>
              <option value="متأخر">متأخر</option>
              <option value="تم التحصيل">تم التحصيل</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-brand-neutral">اجمالي الفاتورة الصادرة / Issued Inv. Total</label>
          <input 
            type="number" 
            value={currentFinance.issuedInvoiceTotal || ''} 
            onChange={e => updateFinance({ issuedInvoiceTotal: parseFloat(e.target.value) || 0 })}
            className="w-full px-4 py-2 bg-brand-bg border border-brand-border rounded-xl text-brand-primary font-bold"
            placeholder="0.00"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-brand-neutral">ضريبة الخصم و التحصيل / WHT Amount</label>
          <input 
            type="number" 
            value={currentFinance.whtAmount || ''} 
            onChange={e => updateFinance({ whtAmount: parseFloat(e.target.value) || 0 })}
            className="w-full px-4 py-2 bg-brand-bg border border-brand-border rounded-xl text-brand-primary font-bold"
            placeholder="0.00"
          />
        </div>
      </div>
    </section>
  );
};
