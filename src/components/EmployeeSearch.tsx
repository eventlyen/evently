import React from 'react';
import { Search } from 'lucide-react';
import { motion } from 'motion/react';
import { Employee, AppState } from '../types';
import { calculateEmployeeSalaryStats } from '../lib/salaryUtils';

interface EmployeeSearchProps {
  state: AppState;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchMonth: number;
  setSearchMonth: (m: number) => void;
  searchYear: number;
  setSearchYear: (y: number) => void;
  months: string[];
}

export const EmployeeSearch: React.FC<EmployeeSearchProps> = ({
  state,
  searchQuery,
  setSearchQuery,
  searchMonth,
  setSearchMonth,
  searchYear,
  setSearchYear,
  months
}) => {
  return (
    <section className="w-full no-print">
      <div className="bg-brand-card space-y-6">
        <div className="flex flex-col gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-neutral" />
            <input 
              type="text"
              placeholder="ابحث عن موظف بالاسم... / Search by name..."
              className="w-full pl-10 pr-4 py-3 bg-brand-bg border border-brand-border rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-accent/50 outline-none transition-all placeholder:text-brand-neutral/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select 
              value={searchMonth} 
              onChange={(e) => setSearchMonth(parseInt(e.target.value))}
              className="px-4 py-3 bg-brand-bg border border-brand-border rounded-2xl text-xs font-black focus:ring-2 focus:ring-brand-accent/50 outline-none cursor-pointer appearance-none text-brand-primary"
            >
              {months.map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>
            <select 
              value={searchYear} 
              onChange={(e) => setSearchYear(parseInt(e.target.value))}
              className="px-4 py-3 bg-brand-bg border border-brand-border rounded-2xl text-xs font-black focus:ring-2 focus:ring-brand-accent/50 outline-none cursor-pointer appearance-none text-brand-primary"
            >
              {Array.from({ length: 15 }, (_, i) => 2021 + i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-2xl border border-brand-border overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-brand-bg">
                  <th className="px-4 py-3 text-right text-[10px] font-black text-brand-neutral border-b border-brand-border min-w-[120px] uppercase">الموظف / Employee</th>
                  <th className="px-2 py-3 text-center text-[10px] font-black text-brand-neutral border-b border-brand-border uppercase">الفندق</th>
                  <th className="px-2 py-3 text-center text-[10px] font-black text-brand-neutral border-b border-brand-border uppercase">المستحق</th>
                  <th className="px-2 py-3 text-center text-[10px] font-black text-brand-neutral border-b border-brand-border uppercase">صافي المرتب</th>
                </tr>
              </thead>
              <tbody>
                {state.employees
                  .filter(emp => (searchQuery && emp.name.toLowerCase().includes(searchQuery.toLowerCase())) && emp.month === searchMonth && emp.year === searchYear)
                  .map(emp => {
                    const stats = calculateEmployeeSalaryStats(emp, state, searchMonth, searchYear);
                    const hotel = state.hotels.find(h => h.id === emp.hotelId);
                    return (
                      <motion.tr 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        key={emp.id} 
                        className="hover:bg-brand-bg/50 transition-colors text-brand-primary"
                      >
                        <td className="px-4 py-3 text-right border-b border-brand-border">
                          <div className="text-sm font-black text-brand-primary leading-tight">{emp.name}</div>
                          <div className="text-[9px] text-brand-neutral font-bold">{emp.position}</div>
                        </td>
                        <td className="px-2 py-3 text-center text-[10px] font-bold border-b border-brand-border text-brand-primary">
                          {hotel?.name || '---'}
                        </td>
                        <td className="px-2 py-3 text-center text-[10px] font-black border-b border-brand-border text-brand-primary">
                          {Math.round(stats.grossSalary).toLocaleString()}
                        </td>
                        <td className="px-2 py-3 text-center border-b border-brand-border">
                          <span className="inline-block px-2 py-1 bg-brand-primary text-brand-accent rounded-lg text-[10px] font-black whitespace-nowrap">
                            {Math.round(stats.netSalary).toLocaleString()}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                {(!searchQuery || state.employees.filter(emp => (emp.name.toLowerCase().includes(searchQuery.toLowerCase())) && emp.month === searchMonth && emp.year === searchYear).length === 0) && (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-brand-neutral font-bold text-xs">
                      {searchQuery ? `لا توجد نتائج لشهر ${searchMonth + 1}/${searchYear}` : 'ابدأ بالبحث عن موظف...'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};
