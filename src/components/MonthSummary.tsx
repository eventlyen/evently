import React from 'react';
import { FileText, Save } from 'lucide-react';
import { FinanceData } from '../types';

interface MonthSummaryProps {
  currentFinance: FinanceData;
  updateFinance: (updates: Partial<FinanceData>) => void;
}

export const MonthSummary: React.FC<MonthSummaryProps> = ({ currentFinance, updateFinance }) => {
  return (
    <section className="max-w-[1600px] mx-auto px-4 mb-20">
      <div className="bg-brand-card rounded-2xl border border-brand-border p-6 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-brand-primary/10 rounded-lg">
            <FileText size={24} className="text-brand-primary" />
          </div>
          <div>
            <h2 className="text-xl font-black text-brand-primary">ملخص يدوي للشهر / Monthly Manual Summary</h2>
            <p className="text-xs font-bold text-brand-neutral">إدخال البيانات المالية النهائية يدوياً</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-brand-border">
            <thead>
              <tr className="bg-brand-bg">
                <th className="px-4 py-3 text-center text-xs font-black text-brand-primary border border-brand-border">الصافي النهائي للمرتبات / Net Salaries</th>
                <th className="px-4 py-3 text-center text-xs font-black text-brand-primary border border-brand-border">صافي الربح / Net Profit</th>
                <th className="px-4 py-3 text-center text-xs font-black text-brand-primary border border-brand-border">الضرائب المحفوظة / Saved Taxes</th>
                <th className="px-4 py-3 text-center text-xs font-black text-brand-primary border border-brand-border">ضريبة المنبع / Source Tax</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border border-brand-border">
                  <input 
                    type="number"
                    className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-lg text-sm font-bold text-center text-brand-primary outline-none focus:ring-1 focus:ring-brand-primary"
                    placeholder="0.00"
                    value={currentFinance.manualNetSalaries !== undefined && currentFinance.manualNetSalaries !== null ? currentFinance.manualNetSalaries : ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateFinance({ manualNetSalaries: val === '' ? null : (parseFloat(val) || 0) });
                    }}
                  />
                </td>
                <td className="p-2 border border-brand-border">
                  <input 
                    type="number"
                    className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-lg text-sm font-bold text-center text-brand-primary outline-none focus:ring-1 focus:ring-brand-primary"
                    placeholder="0.00"
                    value={currentFinance.manualNetProfit !== undefined && currentFinance.manualNetProfit !== null ? currentFinance.manualNetProfit : ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateFinance({ manualNetProfit: val === '' ? null : (parseFloat(val) || 0) });
                    }}
                  />
                </td>
                <td className="p-2 border border-brand-border">
                  <input 
                    type="number"
                    className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-lg text-sm font-bold text-center text-brand-primary outline-none focus:ring-1 focus:ring-brand-primary"
                    placeholder="0.00"
                    value={currentFinance.manualSavedTaxes !== undefined && currentFinance.manualSavedTaxes !== null ? currentFinance.manualSavedTaxes : ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateFinance({ manualSavedTaxes: val === '' ? null : (parseFloat(val) || 0) });
                    }}
                  />
                </td>
                <td className="p-2 border border-brand-border">
                  <input 
                    type="number"
                    className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-lg text-sm font-bold text-center text-brand-primary outline-none focus:ring-1 focus:ring-brand-primary"
                    placeholder="0.00"
                    value={currentFinance.manualSourceTaxPaid !== undefined && currentFinance.manualSourceTaxPaid !== null ? currentFinance.manualSourceTaxPaid : ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateFinance({ manualSourceTaxPaid: val === '' ? null : (parseFloat(val) || 0) });
                    }}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6">
          <label className="block text-xs font-black text-brand-primary mb-2 mr-1">ملاحظات إضافية / Additional Notes</label>
          <textarea 
            className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl text-sm font-bold text-right text-brand-primary outline-none focus:ring-2 focus:ring-brand-primary transition-all min-h-[120px]"
            placeholder="اكتب ملاحظاتك هنا... / Type your notes here..."
            value={currentFinance.manualNotes || ''}
            onChange={(e) => updateFinance({ manualNotes: e.target.value })}
          />
        </div>
      </div>
    </section>
  );
};
