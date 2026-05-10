import React from 'react';
import { Users, Plus, Trash2, Activity } from 'lucide-react';
import { Employee } from '../types';

interface EmployeeManagerProps {
  currentEmployees: Employee[];
  editingEmployeeId: string | null;
  setEditingEmployeeId: (id: string | null) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  removeEmployee: (id: string) => void;
  copyEmployeesFromPreviousMonth: () => void;
  addEmployee: (name: string, salary: number, position?: string) => void;
  months: string[];
}

export const EmployeeManager: React.FC<EmployeeManagerProps> = ({
  currentEmployees,
  editingEmployeeId,
  setEditingEmployeeId,
  updateEmployee,
  removeEmployee,
  copyEmployeesFromPreviousMonth,
  addEmployee,
  months
}) => {
  return (
    <section className="bg-brand-card p-6 rounded-2xl border border-brand-border shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="text-brand-primary" size={20} />
          <h3 className="font-black text-brand-primary">إدارة الموظفين / Employees Mgt.</h3>
        </div>
        <button 
          onClick={copyEmployeesFromPreviousMonth}
          className="px-3 py-1.5 bg-brand-bg text-brand-primary rounded-lg text-[10px] font-bold hover:bg-brand-primary hover:text-brand-accent transition-all flex items-center gap-1 border border-brand-border"
          title="نسخ من الشهر السابق / Copy Prev."
        >
          <Plus size={12} />
          نسخ السابق / Copy Prev.
        </button>
      </div>
      
      <div className="flex-1 max-h-[350px] overflow-y-auto mb-4 space-y-2 pr-1 no-scrollbar">
        {currentEmployees.map(emp => (
          <div key={emp.id} className="p-3 bg-brand-bg rounded-xl border border-brand-border transition-all">
            {editingEmployeeId === emp.id ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-brand-neutral">الموظف / Name</label>
                  <input 
                    autoFocus
                    className="w-full px-3 py-1.5 text-sm bg-brand-card border border-brand-border rounded-lg font-bold text-brand-primary"
                    value={emp.name}
                    onChange={(e) => updateEmployee(emp.id, { name: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && setEditingEmployeeId(null)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-brand-neutral">المسمى الوظيفي / Position</label>
                  <input 
                    className="w-full px-3 py-1.5 text-sm bg-brand-card border border-brand-border rounded-lg font-bold text-brand-primary"
                    value={emp.position || ''}
                    onChange={(e) => updateEmployee(emp.id, { position: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && setEditingEmployeeId(null)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-brand-neutral">المرتب / Salary</label>
                  <input 
                    type="number"
                    className="w-full px-3 py-1.5 text-sm bg-brand-card border border-brand-border rounded-lg font-bold text-brand-primary"
                    value={emp.salary || ''}
                    onChange={(e) => updateEmployee(emp.id, { salary: parseFloat(e.target.value) || 0 })}
                    onKeyDown={(e) => e.key === 'Enter' && setEditingEmployeeId(null)}
                  />
                </div>

                {/* Salary History Section */}
                <div className="pt-2 mt-2 border-t border-brand-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity size={12} className="text-brand-gold" />
                    <p className="text-[10px] font-black text-brand-neutral uppercase">سجل الرواتب / Salary History</p>
                  </div>
                  <div className="space-y-1 max-h-[100px] overflow-y-auto pr-1">
                    {emp.salaryHistory?.map((h, idx) => (
                      <div key={idx} className="flex items-center justify-between p-1.5 bg-brand-bg/50 rounded-lg text-[9px] border border-brand-border/30">
                        <div className="flex flex-col">
                          <span className="font-bold text-brand-primary">{months[h.month]} {h.year}</span>
                          <span className="text-brand-neutral opacity-60 text-[8px]">{h.date}</span>
                        </div>
                        <span className="font-black text-brand-gold">{h.amount.toLocaleString()} EGP</span>
                      </div>
                    ))}
                    {(!emp.salaryHistory || emp.salaryHistory.length === 0) && (
                      <p className="text-[9px] text-brand-neutral italic opacity-50 py-1 text-center">لا يوجد سجل حالياً / No history</p>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => setEditingEmployeeId(null)}
                  className="w-full py-2 text-xs font-bold bg-brand-primary text-brand-accent rounded-lg shadow-sm border border-brand-accent/20"
                >
                  حفظ / Save
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div 
                  className="flex-1 cursor-pointer group"
                  onClick={() => setEditingEmployeeId(emp.id)}
                >
                  <p className="text-sm font-bold text-brand-primary group-hover:text-brand-gold transition-colors">{emp.name}</p>
                  <p className="text-[10px] text-brand-neutral">{emp.position || 'بدون مسمى'} • {emp.salary.toLocaleString()} EGP</p>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setEditingEmployeeId(emp.id)} 
                    className="p-1.5 text-brand-neutral hover:bg-brand-primary/10 hover:text-brand-primary rounded-lg transition-all"
                    title="تعديل"
                  >
                    <Plus size={14} className="rotate-45" />
                  </button>
                  <button 
                    onClick={() => removeEmployee(emp.id)} 
                    className="p-1.5 text-[#c0392b] hover:bg-[#c0392b]/10 rounded-lg transition-all"
                    title="حذف"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <form 
        onSubmit={e => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          const nameInput = form.elements.namedItem('name') as HTMLInputElement;
          const positionInput = form.elements.namedItem('position') as HTMLInputElement;
          const salInput = form.elements.namedItem('sal') as HTMLInputElement;
          
          addEmployee(nameInput.value, parseFloat(salInput.value), positionInput.value);
          form.reset();
        }}
        className="mt-auto pt-4 border-t border-brand-border flex flex-col gap-3"
      >
        <input name="name" type="text" placeholder="الموظف / Name" className="w-full px-4 py-2 bg-brand-bg border border-brand-border rounded-xl text-sm text-brand-primary font-bold" required />
        <input name="position" type="text" placeholder="المسمى الوظيفي / Position" className="w-full px-4 py-2 bg-brand-bg border border-brand-border rounded-xl text-sm text-brand-primary font-bold" />
        <div className="flex gap-2">
           <input name="sal" type="number" placeholder="المرتب / Salary" className="flex-1 px-4 py-2 bg-brand-bg border border-brand-border rounded-xl text-sm text-brand-primary font-bold" required />
           <button type="submit" className="px-5 bg-brand-primary text-brand-accent rounded-xl border border-brand-accent/20 hover:scale-105 active:scale-95 transition-all">
             <Plus size={18} />
           </button>
         </div>
       </form>
    </section>
  );
};
