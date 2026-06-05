
import React, { useState, useEffect } from 'react';
import { Expense, ExpenseType } from '../types';
import { X, Calendar, DollarSign, Tag, MessageSquare, Loader2, Zap, Droplets, Wifi, CreditCard, Calculator, CheckSquare, Home, HeartPulse, GraduationCap } from 'lucide-react';
import { startOfMonth, format, parseISO, addMonths, subMonths } from 'date-fns';

interface ExpenseFormProps {
  onSave: (expense: Omit<Expense, 'id'>) => Promise<void>;
  onClose: () => void;
  initialData?: Expense;
}

const COMMON_SHORTCUTS = [
  { label: 'Aluguel', icon: <Home size={14} />, category: 'Moradia' },
  { label: 'Saúde', icon: <HeartPulse size={14} />, category: 'Saúde' },
  { label: 'Educação', icon: <GraduationCap size={14} />, category: 'Educação' },
  { label: 'Luz', icon: <Zap size={14} />, category: 'Energia' },
  { label: 'Internet', icon: <Wifi size={14} />, category: 'Internet' },
  { label: 'Cartão', icon: <CreditCard size={14} />, category: 'Cartão' },
];

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSave, onClose, initialData }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [description, setDescription] = useState(initialData?.description || '');
  const [value, setValue] = useState(initialData?.value?.toString() || '');
  const [totalValue, setTotalValue] = useState(initialData?.totalValue?.toString() || '');
  const [type, setType] = useState<ExpenseType>(initialData?.type || 'FIXED');
  const [installments, setInstallments] = useState(initialData?.installments?.toString() || '1');
  const [alreadyPaidCount, setAlreadyPaidCount] = useState('0');
  const [startMonth, setStartMonth] = useState(
    initialData?.startMonth ? format(parseISO(initialData.startMonth), 'yyyy-MM') : format(new Date(), 'yyyy-MM')
  );
  const [category, setCategory] = useState(initialData?.category || 'Geral');
  const [notes, setNotes] = useState(initialData?.notes || '');

  // Lógica de cálculo: Valor da Parcela -> Valor Total
  const handleValueChange = (val: string) => {
    setValue(val);
    if (type === 'INSTALLMENT') {
      const numVal = parseFloat(val);
      const numInst = parseInt(installments);
      if (!isNaN(numVal) && !isNaN(numInst)) {
        setTotalValue((numVal * numInst).toFixed(2));
      }
    }
  };

  // Lógica de cálculo: Valor Total -> Valor da Parcela
  const handleTotalValueChange = (val: string) => {
    setTotalValue(val);
    if (type === 'INSTALLMENT') {
      const numTotal = parseFloat(val);
      const numInst = parseInt(installments);
      if (!isNaN(numTotal) && !isNaN(numInst) && numInst > 0) {
        setValue((numTotal / numInst).toFixed(2));
      }
    }
  };

  // Lógica de ajuste inteligente da data baseada em parcelas já pagas
  const handleAlreadyPaidChange = (val: string) => {
    setAlreadyPaidCount(val);
    const count = parseInt(val);
    if (!isNaN(count) && count > 0 && type === 'INSTALLMENT') {
      const suggestedDate = subMonths(startOfMonth(new Date()), count - 1);
      setStartMonth(format(suggestedDate, 'yyyy-MM'));
    }
  };

  const handleInstallmentsChange = (val: string) => {
    setInstallments(val);
    const numInst = parseInt(val);
    if (type === 'INSTALLMENT' && !isNaN(numInst) && numInst > 0) {
      if (value && !totalValue) {
        setTotalValue((parseFloat(value) * numInst).toFixed(2));
      } else if (totalValue) {
        setValue((parseFloat(totalValue) / numInst).toFixed(2));
      }
    }
  };

  const handleShortcut = (shortcut: typeof COMMON_SHORTCUTS[0]) => {
    setDescription(shortcut.label);
    setCategory(shortcut.category);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !value || parseFloat(value) <= 0 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const dateObj = new Date(startMonth + '-01T12:00:00');
      const startMonthISO = startOfMonth(dateObj).toISOString();

      let prePaidMonths: string[] = [];
      const numPrePaid = parseInt(alreadyPaidCount);
      const totalInst = type === 'INSTALLMENT' ? parseInt(installments) : 1;
      
      if (type === 'INSTALLMENT' && numPrePaid > 0) {
        const count = Math.min(numPrePaid, totalInst);
        for (let i = 0; i < count; i++) {
          prePaidMonths.push(startOfMonth(addMonths(dateObj, i)).toISOString());
        }
      }

      await onSave({
        description,
        value: parseFloat(value),
        totalValue: type === 'INSTALLMENT' && totalValue ? parseFloat(totalValue) : undefined,
        type,
        installments: type === 'INSTALLMENT' ? totalInst : (type === 'ONCE' ? 1 : undefined),
        startMonth: startMonthISO,
        category,
        paidMonths: prePaidMonths.length > 0 ? prePaidMonths : (initialData?.paidMonths || []),
        notes: notes.trim() || undefined
      });
      onClose();
    } catch (err: any) {
      console.error("Erro no envio:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-slate-950/90 backdrop-blur-md">
      <div className="bg-slate-900 border border-white/10 w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom sm:zoom-in duration-300 overflow-hidden max-h-[95vh] sm:max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 flex justify-between items-center border-b border-white/5 bg-white/5 shrink-0">
          <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-widest">
            {initialData ? 'Editar Lançamento' : 'Novo Lançamento'}
          </h3>
          <button 
            onClick={onClose} 
            className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-xl transition-colors active:scale-90"
          >
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        {/* Form body — scrollable */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto no-scrollbar flex-1">
          
          {/* Atalhos */}
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Atalhos Rápidos</label>
            <div className="flex flex-wrap gap-2">
              {COMMON_SHORTCUTS.map(s => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => handleShortcut(s)}
                  className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border transition-all active:scale-95 ${category === s.category ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'bg-slate-950 border-white/5 text-slate-400 hover:border-white/20'}`}
                >
                  {s.icon}
                  <span className="text-[9px] font-black uppercase">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1.5 tracking-widest"><Tag size={10} /> Descrição</label>
            <input 
              autoFocus 
              required 
              type="text" 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="Ex: Aluguel, Compra Mercado..." 
              className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-800" 
            />
          </div>

          {/* Tipo selector */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-white/5 gap-1">
            <button type="button" onClick={() => setType('FIXED')} className={`flex-1 py-2.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${type === 'FIXED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'text-slate-600'}`}>Fixo</button>
            <button type="button" onClick={() => setType('INSTALLMENT')} className={`flex-1 py-2.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${type === 'INSTALLMENT' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'text-slate-600'}`}>Parcelado</button>
            <button type="button" onClick={() => setType('ONCE')} className={`flex-1 py-2.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${type === 'ONCE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'text-slate-600'}`}>Único</button>
          </div>

          {/* Valor + Data */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1.5 tracking-widest">
                <DollarSign size={10} /> {type === 'FIXED' ? 'Valor Mensal' : 'Valor'}
              </label>
              <input 
                required 
                type="number" 
                step="0.01" 
                inputMode="decimal"
                value={value} 
                onChange={e => handleValueChange(e.target.value)} 
                placeholder="0,00" 
                className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all font-black" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1.5 tracking-widest"><Calendar size={10} /> {type === 'ONCE' ? 'Mês do Gasto' : 'Mês Inicial'}</label>
              <input 
                required 
                type="month" 
                value={startMonth} 
                onChange={e => setStartMonth(e.target.value)} 
                className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-3 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-all font-bold uppercase" 
              />
            </div>
          </div>

          {/* Installment fields */}
          {type === 'INSTALLMENT' && (
            <div className="space-y-3 p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 animate-in slide-in-from-top-2 duration-300">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-emerald-500/70 uppercase tracking-widest flex items-center gap-1.5">
                    <Calculator size={10} /> Valor Total
                  </label>
                  <input 
                    type="number" 
                    step="0.01" 
                    inputMode="decimal"
                    value={totalValue} 
                    onChange={e => handleTotalValueChange(e.target.value)} 
                    placeholder="Total da compra" 
                    className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all font-black" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-emerald-500/70 uppercase tracking-widest">Qtd Parcelas</label>
                  <input 
                    required 
                    type="number" 
                    inputMode="numeric"
                    min="1" 
                    max="120" 
                    value={installments} 
                    onChange={e => handleInstallmentsChange(e.target.value)} 
                    className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all font-black" 
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                  <CheckSquare size={10} /> Já foram pagas quantas?
                </label>
                <input 
                  type="number" 
                  inputMode="numeric"
                  min="0" 
                  max={installments}
                  value={alreadyPaidCount} 
                  onChange={e => handleAlreadyPaidChange(e.target.value)} 
                  className="w-full bg-slate-950 border border-emerald-500/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all font-black" 
                />
                <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest pl-1 mt-1">O sistema recalcula o início para você estar na parcela correta hoje.</p>
              </div>
            </div>
          )}

          {/* Notas */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1.5 tracking-widest"><MessageSquare size={10} /> Notas</label>
            <textarea 
              value={notes} 
              onChange={e => setNotes(e.target.value)} 
              placeholder="Opcional: Detalhes sobre este lançamento..." 
              rows={2} 
              className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium resize-none placeholder:text-slate-800" 
            />
          </div>

          {/* Submit buttons */}
          <div className="pt-2 flex gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={isSubmitting} 
              className="flex-1 py-3.5 text-[10px] text-slate-500 font-black uppercase tracking-widest hover:text-white transition-colors disabled:opacity-50 active:scale-95 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-black uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : null}
              {initialData ? 'Atualizar' : 'Finalizar Lançamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;
