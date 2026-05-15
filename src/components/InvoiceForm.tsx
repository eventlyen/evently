import React, { useState } from 'react';
import { CreditCard, FileUp, FileText, Image as ImageIcon, Eye, FileDown, X, Loader2, FileSpreadsheet } from 'lucide-react';
import { FinanceData, InvoiceFile } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface InvoiceFormProps {
  currentFinance: FinanceData;
  updateFinance: (updates: Partial<FinanceData>) => void;
  uploadInvoice: (file: File) => Promise<void>;
  removeInvoiceFile: (id: string) => Promise<void>;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({ currentFinance, updateFinance, uploadInvoice, removeInvoiceFile }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [isContractValueVisible, setIsContractValueVisible] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf', 
      'image/jpeg', 
      'image/png', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      alert('صيغة الملف غير مدعومة. يرجى رفع PDF, JPG, PNG, Word أو Excel. / Unsupported file format.');
      return;
    }

    try {
      setIsUploading(true);
      await uploadInvoice(file);
      alert('تم رفع الفاتورة بنجاح / Invoice uploaded successfully');
    } catch (error) {
      console.error("Upload failed in form:", error);
      // Error message is already shown in App.tsx uploadInvoice
    } finally {
      setIsUploading(false);
      // Clear input
      if (e.target) e.target.value = '';
    }
  };

  const applyWhtPercentage = (percentage: number) => {
    const base = currentFinance.contractValue || 0;
    const wht = base * (percentage / 100);
    
    updateFinance({ whtAmount: wht });
  };

  const getFileIcon = (file: InvoiceFile) => {
    if (file.type.includes('image')) return <ImageIcon size={14} />;
    if (file.type.includes('pdf')) return <FileText size={14} className="text-red-500" />;
    if (file.type.includes('spreadsheet') || file.type.includes('excel')) return <FileSpreadsheet size={14} className="text-green-600" />;
    return <FileText size={14} className="text-blue-500" />;
  };

  const invoices = [...(currentFinance.invoices || [])];
  
  // Handing legacy single invoice from previous version
  if (currentFinance.invoiceUrl && !invoices.some(inv => inv.url === currentFinance.invoiceUrl)) {
    invoices.unshift({
      id: 'legacy',
      url: currentFinance.invoiceUrl,
      name: currentFinance.invoiceFileName || 'الفاتورة السابقة / Previous Invoice',
      type: currentFinance.invoiceUrl.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
      createdAt: Date.now()
    });
  }

  return (
    <section className="bg-brand-card p-6 rounded-2xl border border-brand-border shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2">
          <CreditCard className="text-brand-primary" size={20} />
          <h3 className="font-black text-brand-primary">بيانات الفاتورة / Invoice Data</h3>
        </div>
        
        <label className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-brand-accent rounded-xl font-bold text-xs cursor-pointer hover:bg-black transition-all shadow-lg shadow-black/10">
          {isUploading ? <Loader2 size={14} className="animate-spin" /> : <FileUp size={14} />}
          <span>{isUploading ? 'جاري الرفع...' : 'رفع فاتورة / Upload Invoice'}</span>
          <input 
            type="file" 
            className="hidden" 
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
            disabled={isUploading}
          />
        </label>
      </div>

      {/* Invoices List */}
      {invoices.length > 0 && (
        <div className="mb-6 p-4 bg-brand-bg rounded-xl border border-brand-border">
          <h4 className="text-[10px] font-black text-brand-neutral uppercase mb-3 flex items-center gap-2">
            <FileText size={12} />
            الفواتير المرفقة / Attached Invoices ({invoices.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {invoices.map((inv) => (
              <div key={inv.id} className="relative group">
                <div className="flex items-center justify-between p-2 bg-brand-card border border-brand-border rounded-lg transition-all hover:border-brand-primary">
                  <div className="flex items-center gap-2 overflow-hidden flex-1">
                    {getFileIcon(inv)}
                    <span className="text-[10px] font-bold text-brand-primary truncate" title={inv.name}>
                      {inv.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <a 
                      href={inv.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-1.5 bg-brand-bg rounded-lg text-brand-primary hover:bg-brand-primary hover:text-brand-accent transition-all"
                      title="فتح / Open"
                    >
                      <Eye size={14} />
                    </a>
                    <a 
                      href={inv.url} 
                      download={inv.name}
                      className="p-1.5 bg-brand-bg rounded-lg text-brand-primary hover:bg-brand-primary hover:text-brand-accent transition-all"
                      title="تحميل / Download"
                    >
                      <FileDown size={14} />
                    </a>
                    <button 
                      onClick={() => removeInvoiceFile(inv.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-1"
                      title="حذف / Delete"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {previewId === inv.id && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 overflow-hidden"
                    >
                      <div className="p-2 bg-brand-bg border border-brand-border rounded-lg space-y-3">
                        <div className="aspect-video bg-white rounded-md overflow-hidden border border-brand-border flex items-center justify-center">
                          {inv.type.includes('image') ? (
                            <img src={inv.url} alt={inv.name} className="w-full h-full object-contain" />
                          ) : (
                            <div className="flex flex-col items-center gap-2 text-brand-neutral text-center p-4">
                              {getFileIcon(inv)}
                              <span className="text-[10px] font-bold">{inv.name}</span>
                              <span className="text-[9px] opacity-60">لا يمكن عرض المعاينة لهذا النوع / Direct preview not available</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <a 
                            href={inv.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-brand-primary text-brand-accent rounded-lg text-[9px] font-black hover:bg-black transition-all"
                          >
                            <Eye size={12} />
                            فتح في نافذة جديدة / Open in New Tab
                          </a>
                          <a 
                            href={inv.url} 
                            download={inv.name}
                            className="flex items-center justify-center p-2 px-3 bg-brand-card border border-brand-border rounded-lg text-brand-primary hover:bg-brand-border transition-all"
                            title="تحميل / Download"
                          >
                            <FileDown size={14} />
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-brand-neutral">اجمالي فاتورة التعاقد / Total Contract Invoice</label>
            <button 
              onClick={() => setIsContractValueVisible(!isContractValueVisible)}
              className="p-1 hover:bg-brand-bg rounded-md transition-colors text-brand-neutral"
            >
              {isContractValueVisible ? <Eye size={14} className="text-brand-primary" /> : <Eye size={14} className="opacity-40" />}
            </button>
          </div>
          <div className="relative">
            <input 
              type={isContractValueVisible ? "number" : "password"} 
              value={currentFinance.contractValue || ''} 
              onChange={e => {
                const val = parseFloat(e.target.value) || 0;
                updateFinance({ 
                  contractValue: val
                });
              }}
              className={`w-full px-4 py-2 bg-brand-bg border border-brand-border rounded-xl text-brand-primary font-bold ${!isContractValueVisible ? 'tracking-[0.5em]' : ''}`}
            />
          </div>
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
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-brand-neutral">الضرائب / Tax (%)</label>
              <button 
                onClick={() => updateFinance({ taxRate: 14 })}
                className="text-[10px] font-black text-brand-gold hover:underline"
              >
                تطبيق 14% / Apply 14%
              </button>
            </div>
            <input 
              type="number" 
              value={currentFinance.taxRate || ''} 
              onChange={e => {
                const tax = parseFloat(e.target.value) || 0;
                updateFinance({ 
                  taxRate: tax
                });
              }}
              className="w-full px-4 py-2 bg-brand-bg border border-brand-border rounded-xl text-brand-primary font-bold"
            />
            {currentFinance.taxRate > 0 && currentFinance.contractValue > 0 && (
              <div className="text-[10px] font-bold text-brand-primary mt-1">
                قيمة الضريبة: {(currentFinance.contractValue * (currentFinance.taxRate / 100)).toLocaleString()}
              </div>
            )}
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
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-brand-neutral">ضريبة الخصم و التحصيل / WHT Amount</label>
            <div className="flex gap-3">
              <button 
                onClick={() => applyWhtPercentage(3)}
                className="text-[10px] font-black text-brand-gold hover:underline"
              >
                تطبيق 3% / Apply 3%
              </button>
              <button 
                onClick={() => applyWhtPercentage(5)}
                className="text-[10px] font-black text-brand-gold hover:underline"
              >
                تطبيق 5% / Apply 5%
              </button>
            </div>
          </div>
          <input 
            type="number" 
            value={currentFinance.whtAmount || ''} 
            onChange={e => {
              const wht = parseFloat(e.target.value) || 0;
              updateFinance({ whtAmount: wht });
            }}
            className="w-full px-4 py-2 bg-brand-bg border border-brand-border rounded-xl text-brand-primary font-bold"
            placeholder="0.00"
          />
          {currentFinance.whtAmount > 0 && currentFinance.contractValue > 0 && (
            <div className="text-[10px] font-bold text-brand-primary mt-1">
              الصافي بعد الخصم: {( (currentFinance.contractValue * (1 + (currentFinance.taxRate || 0) / 100)) - currentFinance.whtAmount).toLocaleString()}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

