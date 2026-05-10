import React, { useState } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Receipt, 
  Activity,
  PieChart as PieChartIcon,
  BarChart3,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion } from 'motion/react';
import { FinanceData } from '../types';

interface DashboardProps {
  totals: {
    salaries: number;
    expenses: number;
    tax: number;
    costs: number;
    profit: number;
  };
  currentFinance: FinanceData;
}

export const Dashboard: React.FC<DashboardProps> = ({ totals, currentFinance }) => {
  const [isBlurred, setIsBlurred] = useState(true);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-brand-primary">لوحة التحكم / Dashboard</h2>
          <p className="text-xs font-bold text-brand-neutral">نظرة عامة على الأداء المالي لهذا الشهر</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsBlurred(!isBlurred)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all font-black text-xs ${
              isBlurred 
                ? 'bg-brand-accent text-brand-primary border-brand-accent shadow-lg shadow-brand-accent/20' 
                : 'bg-brand-card text-brand-primary border-brand-border hover:bg-brand-bg shadow-sm'
            }`}
          >
            {isBlurred ? <EyeOff size={16} /> : <Eye size={16} />}
            <span>{isBlurred ? 'إظهار البيانات / Show' : 'إخفاء البيانات / Hide'}</span>
          </button>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-brand-primary/5 rounded-full border border-brand-primary/10">
            <Activity size={14} className="text-brand-primary animate-pulse" />
            <span className="text-[10px] font-black text-brand-primary uppercase">Live Updates</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'إجمالي التعاقد / Total Contract', value: totals.tax + totals.costs + totals.profit, icon: Wallet, color: 'text-brand-primary', bg: 'bg-brand-primary/10', sub: 'القيمة الكلية قبل الخصومات' },
          { label: 'صافي الربح / Net Profit', value: totals.profit, icon: TrendingUp, color: 'text-[#2e7d32]', bg: 'bg-[#2e7d32]/10', sub: 'الربح بعد المصروفات والضرائب' },
          { label: 'إجمالي التكاليف / Total Costs', value: totals.costs, icon: TrendingDown, color: 'text-[#c0392b]', bg: 'bg-[#c0392b]/10', sub: 'المرتبات والمصروفات الإدارية' },
          { label: 'حالة الفاتورة / Inv. Status', value: currentFinance.status, icon: Receipt, color: 'text-brand-gold', bg: 'bg-brand-gold/10', isStatus: true, sub: 'آخر تحديث لدورة التحصيل' }
        ].map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label} 
            className="bg-brand-card p-5 rounded-2xl border border-brand-border shadow-sm flex flex-col gap-4 hover:border-brand-primary/30 transition-all group"
          >
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
              <stat.icon size={22} />
            </div>
            <div>
              <p className="text-[10px] font-black text-brand-neutral uppercase tracking-wider mb-1">{stat.label}</p>
              <div className={`text-xl font-black ${stat.color} leading-none mb-2 transition-all duration-500 ${isBlurred && !stat.isStatus ? 'blur-md select-none' : ''}`}>
                {stat.isStatus ? stat.value : `${Math.round(stat.value).toLocaleString()} EGP`}
              </div>
              <p className="text-[9px] font-bold text-brand-neutral/60">{stat.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
