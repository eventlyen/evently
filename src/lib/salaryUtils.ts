import { Employee, AppState, AttendanceStatus } from '../types';

export const calculateEmployeeSalaryStats = (
  emp: Employee, 
  state: Pick<AppState, 'attendance' | 'advances' | 'month' | 'year'>,
  customMonth?: number, 
  customYear?: number
) => {
  const targetMonth = customMonth ?? state.month;
  const targetYear = customYear ?? state.year;
  
  const dInM = new Date(targetYear, targetMonth + 1, 0).getDate();
  
  const dailyRate = emp.salary / dInM;
  let dutyDays = 0;
  let absentDays = 0;
  let offDays = 0;
  
  for (let d = 1; d <= dInM; d++) {
    const status = state.attendance[`${targetYear}-${targetMonth}-${emp.id}-${d}`];
    if (status === 'D') dutyDays++;
    if (status === 'A') absentDays++;
    if (status === 'O') offDays++;
  }
  
  const employeeAdvances = state.advances.filter(adv => 
    adv.empId === emp.id && 
    adv.month === targetMonth && 
    adv.year === targetYear
  );
  const totalAdvanceAmount = employeeAdvances.reduce((sum, adv) => sum + adv.amount, 0);
  
  const paidDays = dutyDays + Math.min(offDays, 4);
  const grossSalary = paidDays * dailyRate;
  const netSalary = Math.max(0, grossSalary - totalAdvanceAmount);

  return {
    dutyDays,
    absentDays,
    offDays,
    advanceAmount: totalAdvanceAmount,
    employeeAdvances,
    absenceDeductions: emp.salary - grossSalary,
    grossSalary,
    netSalary
  };
};

export const calculateEmployeeSalary = (
  emp: Employee,
  state: Pick<AppState, 'attendance' | 'advances' | 'month' | 'year'>
) => {
  return calculateEmployeeSalaryStats(emp, state).netSalary;
};
