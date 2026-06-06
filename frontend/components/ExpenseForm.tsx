import React, { useState } from 'react';
import { Expense, ExpenseType } from '../types';
import { X, Calendar, DollarSign, Tag, MessageSquare, Zap, Droplets, Wifi, CreditCard, Calculator, CheckSquare, Home, HeartPulse, GraduationCap } from 'lucide-react';
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
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-gray-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-panel w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 overflow-hidden max-h-[95vh] sm:max-h-[90vh] flex flex-col border-white/[0.08]">
        
        {/* Header */}
        <div className="p-5 sm:p-5 flex justify-between items-center border-b border-white/[0.04] bg-white/[0.01] shrink-0">
          <h3 className="text-base sm:text-sm font-bold text-white uppercase tracking-wider">
            {initialData ? 'Editar Lançamento' : 'Novo Lançamento'}
          </h3>
          <button 
            onClick={onClose} 
            className="w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center hover:bg-white/5 rounded-xl transition-all active:scale-90 cursor-pointer"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto no-scrollbar flex-1">
          
          {/* Shortcuts */}
          <div className="space-y-2">
            <label className="text-[11px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider">Atalhos Rápidos</label>
            <div className="flex flex-wrap gap-2.5 sm:gap-2">
              {COMMON_SHORTCUTS.map(s => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => handleShortcut(s)}
                  className={`flex items-center gap-2 px-4 py-2.5 sm:px-3 sm:py-2 rounded-xl border transition-all duration-200 active:scale-95 cursor-pointer text-sm sm:text-xs font-semibold ${description === s.label ? 'bg-emerald-500 border-emerald-500 text-gray-950 shadow-[0_2px_10px_rgba(16,185,129,0.2)]' : 'bg-gray-950/60 border-white/[0.04] text-gray-400 hover:border-white/[0.1] hover:bg-gray-950'}`}
                >
                  {s.icon}
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-2 tracking-wider">
              <Tag size={12} className="text-emerald-400" /> Descrição do Lançamento
            </label>
            <input 
              autoFocus 
              required 
              type="text" 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="Ex: Aluguel, Mercado, Assinatura..." 
              className="w-full glass-input" 
            />
          </div>

          {/* Type selector */}
          <div className="flex bg-gray-950/80 p-1.5 sm:p-1 rounded-xl border border-white/[0.04] gap-1">
            <button 
              type="button" 
              onClick={() => setType('FIXED')} 
              className={`flex-1 py-3 sm:py-2 text-[11px] sm:text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all duration-200 cursor-pointer ${type === 'FIXED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.1)]' : 'text-gray-500 hover:text-gray-400'}`}
            >
              Fixo
            </button>
            <button 
              type="button" 
              onClick={() => setType('INSTALLMENT')} 
              className={`flex-1 py-3 sm:py-2 text-[11px] sm:text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all duration-200 cursor-pointer ${type === 'INSTALLMENT' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.1)]' : 'text-gray-500 hover:text-gray-400'}`}
            >
              Parcelado
            </button>
            <button 
              type="button" 
              onClick={() => setType('ONCE')} 
              className={`flex-1 py-3 sm:py-2 text-[11px] sm:text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all duration-200 cursor-pointer ${type === 'ONCE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.1)]' : 'text-gray-500 hover:text-gray-400'}`}
            >
              Único
            </button>
          </div>

          {/* Value + Date grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1.5 tracking-wider">
                <DollarSign size={12} className="text-emerald-400" /> {type === 'FIXED' ? 'Valor Mensal' : 'Valor Parcela'}
              </label>
              <input 
                required 
                type="number" 
                step="0.01" 
                inputMode="decimal"
                value={value} 
                onChange={e => handleValueChange(e.target.value)} 
                placeholder="0,00" 
                className="w-full glass-input" 
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1.5 tracking-wider">
                <Calendar size={12} className="text-emerald-400" /> {type === 'ONCE' ? 'Mês do Gasto' : 'Mês Inicial'}
              </label>
              <input 
                required 
                type="month" 
                value={startMonth} 
                onChange={e => setStartMonth(e.target.value)} 
                className="w-full glass-input" 
              />
            </div>
          </div>

          {/* Installment specific fields */}
          {type === 'INSTALLMENT' && (
            <div className="space-y-3.5 p-4 bg-emerald-500/[0.01] rounded-2xl border border-emerald-500/10 animate-in slide-in-from-top-2 duration-300">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Calculator size={11} /> Valor Total Compra
                  </label>
                  <input 
                    type="number" 
                    step="0.01" 
                    inputMode="decimal"
                    value={totalValue} 
                    onChange={e => handleTotalValueChange(e.target.value)} 
                    placeholder="Opcional" 
                    className="w-full glass-input" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">Quantidade Parcelas</label>
                  <input 
                    required 
                    type="number" 
                    inputMode="numeric"
                    min="1" 
                    max="120" 
                    value={installments} 
                    onChange={e => handleInstallmentsChange(e.target.value)} 
                    className="w-full glass-input" 
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckSquare size={11} /> Quantas parcelas já foram pagas?
                </label>
                <input 
                  type="number" 
                  inputMode="numeric"
                  min="0" 
                  max={installments}
                  value={alreadyPaidCount} 
                  onChange={e => handleAlreadyPaidChange(e.target.value)} 
                  className="w-full glass-input border-emerald-500/20" 
                />
                <p className="text-[9px] text-gray-500 leading-normal pl-1">
                   O sistema recalculará a data de início para corresponder à parcela atual hoje.
                </p>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-2 tracking-wider">
              <MessageSquare size={12} className="text-emerald-400" /> Observações / Notas
            </label>
            <textarea 
              value={notes} 
              onChange={e => setNotes(e.target.value)} 
              placeholder="Opcional: Detalhes sobre a despesa..." 
              rows={2} 
              className="w-full glass-input resize-none" 
            />
          </div>

          {/* Category Selector hidden but synced */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Categoria</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full glass-input"
            >
              <option value="Geral" className="bg-gray-950 text-white">Geral</option>
              <option value="Moradia" className="bg-gray-950 text-white">Moradia</option>
              <option value="Saúde" className="bg-gray-950 text-white">Saúde</option>
              <option value="Educação" className="bg-gray-950 text-white">Educação</option>
              <option value="Energia" className="bg-gray-950 text-white">Energia</option>
              <option value="Água" className="bg-gray-950 text-white">Água</option>
              <option value="Internet" className="bg-gray-950 text-white">Internet</option>
              <option value="Cartão" className="bg-gray-950 text-white">Cartão</option>
            </select>
          </div>

          {/* Form Actions */}
          <div className="pt-4 sm:pt-3 flex gap-3.5 border-t border-white/[0.04] shrink-0">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={isSubmitting} 
              className="flex-1 py-3.5 sm:py-3 text-sm sm:text-xs text-gray-400 hover:text-white font-bold uppercase tracking-wider transition-colors disabled:opacity-50 active:scale-95 cursor-pointer rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-gray-950 text-sm sm:text-xs font-bold uppercase tracking-wider py-3.5 sm:py-3 rounded-xl transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? <div className="loader-spinner" /> : null}
              {initialData ? 'Salvar Alterações' : 'Criar Lançamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;
