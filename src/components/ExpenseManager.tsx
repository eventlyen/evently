import React from 'react';
import { Receipt, Plus, Trash2 } from 'lucide-react';
import { Expense } from '../types';

interface ExpenseManagerProps {
  currentExpenses: Expense[];
  addExpense: (description: string, amount: number) => void;
  removeExpense: (id: string) => void;
}

export const ExpenseManager: React.FC<ExpenseManagerProps> = ({
  currentExpenses,
  addExpense,
  removeExpense
}) => {
  return (
    <section className="bg-brand-card p-6 rounded-2xl border border-brand-border shadow-sm h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <Receipt className="text-[#c0392b]" size={20} />
        <h3 className="font-black text-brand-primary">مصروفات الشركة / Company Expenses</h3>
      </div>
      <div className="flex-1 max-h-[350px] overflow-y-auto mb-4 space-y-2 pr-1 no-scrollbar text-brand-primary">
        {currentExpenses.map(ex => (
          <div key={ex.id} className="flex items-center justify-between p-3 bg-brand-bg rounded-xl border border-brand-border">
            <div>
              <p className="text-sm font-bold text-brand-primary">{ex.description}</p>
              <p className="text-[10px] text-brand-neutral">{ex.amount.toLocaleString()} EGP</p>
            </div>
            <button onClick={() => removeExpense(ex.id)} className="p-1.5 text-[#c0392b] hover:bg-[#c0392b]/10 rounded-lg transition-all">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {currentExpenses.length === 0 && (
          <p className="text-xs text-brand-neutral italic text-center py-4">لا يوجد مصروفات حالياً</p>
        )}
      </div>
      <form 
        onSubmit={e => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          const descInput = form.elements.namedItem('desc') as HTMLInputElement;
          const amtInput = form.elements.namedItem('amt') as HTMLInputElement;
          addExpense(descInput.value, parseFloat(amtInput.value));
          form.reset();
        }}
        className="mt-auto pt-4 border-t border-brand-border flex flex-col gap-3"
      >
        <input name="desc" type="text" placeholder="الوصف / Description" className="w-full px-4 py-2 bg-brand-bg border border-brand-border rounded-xl text-sm text-brand-primary font-bold" required />
        <div className="flex gap-2">
          <input name="amt" type="number" placeholder="المبلغ / Amount" className="flex-1 px-4 py-2 bg-brand-bg border border-brand-border rounded-xl text-sm text-brand-primary font-bold" required />
          <button type="submit" className="px-5 bg-brand-primary text-brand-accent rounded-xl border border-brand-accent/20 hover:scale-105 active:scale-95 transition-all">
            <Plus size={18} />
          </button>
        </div>
      </form>
    </section>
  );
};
