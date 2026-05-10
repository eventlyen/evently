import React from 'react';
import { Users, Plus } from 'lucide-react';
import { Employee, AppState } from '../types';
import { calculateEmployeeSalaryStats } from '../lib/salaryUtils';

interface AttendanceTableProps {
  currentEmployees: Employee[];
  daysInMonth: number;
  state: Pick<AppState, 'attendance' | 'advances' | 'month' | 'year' | 'currentHotelId'>;
  cycleAttendance: (empId: string, day: number) => void;
  setActiveAdvanceEmpId: (id: string) => void;
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({
  currentEmployees,
  daysInMonth,
  state,
  cycleAttendance,
  setActiveAdvanceEmpId
}) => {
  return (
    <section className="bg-brand-card rounded-2xl border border-brand-border shadow-sm overflow-hidden transition-all">
      <div className="p-6 border-b border-brand-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="text-[#437a22]" size={20} />
          <h3 className="font-black text-brand-primary">جدول الحضور / Attendance Table</h3>
        </div>
      </div>
      <div className="overflow-x-auto no-scrollbar scroll-smooth">
        <table className="w-full border-collapse table-fixed">
          <thead>
            <tr className="bg-brand-bg">
              <th className="sticky right-0 z-20 bg-brand-bg px-2 py-3 text-right text-[10px] font-black text-brand-neutral border-b border-l border-brand-border w-[110px]">الموظف / Employee</th>
              {Array.from({ length: daysInMonth }, (_, i) => (
                <th key={i} className="px-0.5 py-3 text-center text-[9px] font-black text-brand-neutral border-b border-brand-border min-w-[24px]">{i + 1}</th>
              ))}
              <th className="px-0.5 py-3 text-center text-[9px] font-black text-[#437a22] border-b border-brand-border min-w-[24px]">D</th>
              <th className="px-0.5 py-3 text-center text-[9px] font-black text-[#da7101] border-b border-brand-border min-w-[24px]">O</th>
              <th className="px-0.5 py-3 text-center text-[9px] font-black text-[#c0392b] border-b border-brand-border min-w-[24px]">A</th>
              <th className="px-0.5 py-3 text-center text-[9px] font-black text-brand-primary border-b border-brand-border min-w-[45px]">المستحق / Gross</th>
              <th className="px-0.5 py-3 text-center text-[9px] font-black text-[#da7101] border-b border-brand-border min-w-[55px]">سلف / Advance</th>
              <th className="sticky left-0 z-20 bg-brand-bg px-2 py-3 text-center text-[10px] font-black text-brand-neutral border-b border-r border-brand-border w-[80px]">الصافي / Net</th>
            </tr>
          </thead>
          <tbody>
            {currentEmployees.map(emp => {
              const stats = calculateEmployeeSalaryStats(emp, state);
              return (
                <tr key={emp.id} className="hover:bg-brand-bg transition-colors">
                  <td className="sticky right-0 z-10 bg-brand-card px-2 py-2.5 text-xs font-bold border-b border-l border-brand-border truncate text-brand-primary">
                    {emp.name}
                  </td>
                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const status = state.attendance[`${state.year}-${state.month}-${emp.id}-${i+1}`] || '';
                    const colors: Record<string, string> = {
                      'D': 'bg-[#437a22]/10 text-[#437a22] border-[#437a22]/30',
                      'A': 'bg-[#c0392b]/10 text-[#c0392b] border-[#c0392b]/30',
                      'O': 'bg-[#da7101]/10 text-[#da7101] border-[#da7101]/30',
                      '': 'border-transparent'
                    };
                    return (
                      <td key={i} onClick={() => cycleAttendance(emp.id, i + 1)} className="p-0.5 border-b border-brand-border cursor-pointer">
                        <div className={`w-5 h-5 mx-auto flex items-center justify-center text-[8px] font-black rounded-md border ${colors[status] || 'border-transparent'}`}>
                          {status}
                        </div>
                      </td>
                    );
                  })}
                  <td className="px-0.5 border-b border-brand-border">
                    <div className="w-full text-center text-[9px] font-black text-[#437a22]">{stats.dutyDays}</div>
                  </td>
                  <td className="px-0.5 border-b border-brand-border">
                    <div className="w-full text-center text-[9px] font-black text-[#da7101]">{stats.offDays}</div>
                  </td>
                  <td className="px-0.5 border-b border-brand-border">
                    <div className="w-full text-center text-[9px] font-black text-[#c0392b]">{stats.absentDays}</div>
                  </td>
                  <td className="px-0.5 border-b border-brand-border">
                    <div className="w-full text-center text-[9px] font-black text-brand-primary">{Math.round(stats.grossSalary).toLocaleString()}</div>
                  </td>
                  <td className="px-1 border-b border-brand-border">
                    <button 
                      onClick={() => setActiveAdvanceEmpId(emp.id)}
                      className="w-full flex items-center justify-between px-1 py-0.5 bg-brand-bg border border-brand-border rounded-md group hover:border-brand-accent transition-all"
                    >
                      <span className="text-[9px] font-black text-brand-primary">{stats.advanceAmount.toLocaleString()}</span>
                      <Plus size={8} className="text-brand-gold group-hover:scale-125 transition-transform no-print" />
                    </button>
                  </td>
                  <td className="sticky left-0 z-10 bg-brand-card px-2 py-2.5 text-center text-[11px] font-black text-brand-primary border-b border-r border-brand-border">
                    {Math.round(stats.netSalary).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};
