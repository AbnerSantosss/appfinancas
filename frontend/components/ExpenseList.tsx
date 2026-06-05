
import React, { useState } from 'react';
import { Expense } from '../types';
import { formatCurrency, getExpenseProgress, formatMonth } from '../utils';
import { Edit3, Trash2, Search, Filter, Plus, Calendar, Tag, CheckCircle, Clock, MessageSquare, Zap, Droplets, Wifi, CreditCard, ShoppingBag, ShoppingCart, Home, HeartPulse, GraduationCap } from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  onDeleteRequest: (expense: Expense) => void;
  onEdit: (expense: Expense) => void;
  onAddNew: () => void;
}

const getCategoryIcon = (category: string) => {
  switch (category?.toLowerCase()) {
    case 'moradia': return <Home size={18} />;
    case 'saúde': return <HeartPulse size={18} />;
    case 'educação': return <GraduationCap size={18} />;
    case 'energia': return <Zap size={18} />;
    case 'água': return <Droplets size={18} />;
    case 'internet': return <Wifi size={18} />;
    case 'cartão': return <CreditCard size={18} />;
    default: return <ShoppingBag size={18} />;
  }
};

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onDeleteRequest, onEdit, onAddNew }) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'FIXED' | 'INSTALLMENT' | 'ONCE'>('ALL');

  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = e.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'ALL' || e.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="text-lg md:text-2xl font-black text-white tracking-tight">Inventário de Lançamentos</h2>
          <p className="text-slate-500 text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] mt-0.5">Sena Family Finance Database</p>
        </div>
        <button 
          onClick={onAddNew} 
          className="w-full sm:w-auto bg-emerald-500 text-slate-950 px-5 py-3.5 rounded-xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px] hover:bg-emerald-400 transition-all shadow-lg active:scale-95 group"
        >
          <Plus size={18} strokeWidth={3} /> NOVO LANÇAMENTO
        </button>
      </div>

      {/* Search & Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="sm:col-span-2 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-400 transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Procurar registros..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="w-full bg-slate-900/40 border border-white/5 rounded-xl pl-11 pr-4 py-3.5 text-white focus:outline-none focus:border-emerald-500/40 transition-all placeholder:text-slate-700 font-bold text-sm" 
          />
        </div>
        <div className="relative group">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-cyan-400 transition-colors" size={16} />
          <select 
            value={filterType} 
            onChange={e => setFilterType(e.target.value as any)} 
            className="w-full bg-slate-900/40 border border-white/5 rounded-xl pl-11 pr-4 py-3.5 text-white appearance-none focus:outline-none focus:border-cyan-500/40 transition-all font-black uppercase tracking-widest text-[9px]"
          >
            <option value="ALL">Filtro: Todos</option>
            <option value="FIXED">Fixos</option>
            <option value="INSTALLMENT">Parcelados</option>
            <option value="ONCE">Únicos</option>
          </select>
        </div>
      </div>

      {/* Expense Cards */}
      <div className="space-y-3">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/10 rounded-2xl border border-dashed border-white/5">
            <p className="text-slate-700 font-black uppercase tracking-widest text-[9px]">Nada encontrado</p>
          </div>
        ) : (
          filteredExpenses.map(expense => {
            const progress = getExpenseProgress(expense);
            return (
              <div key={expense.id} className={`group bg-slate-900/40 border p-4 rounded-2xl transition-all duration-300 relative overflow-hidden ${progress?.isFinished ? 'border-emerald-500/20 bg-emerald-500/[0.02]' : 'border-white/5'}`}>
                {/* Top row: icon + description + value */}
                <div className="flex items-start gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border-2 transition-all duration-500 ${expense.type === 'FIXED' ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' : expense.type === 'ONCE' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : progress?.isFinished ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'}`}>
                    {progress?.isFinished && expense.type !== 'FIXED' ? <CheckCircle size={20} /> : getCategoryIcon(expense.category)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className={`font-black text-sm leading-tight tracking-tight ${progress?.isFinished ? 'text-emerald-400' : 'text-slate-100'}`}>
                          {expense.description}
                        </h4>
                        {expense.notes && (
                          <p className="text-[9px] text-slate-500 font-medium mt-0.5 italic flex items-start gap-1 leading-snug">
                            <MessageSquare size={9} className="mt-0.5 shrink-0" /> {expense.notes}
                          </p>
                        )}
                      </div>
                      <p className={`text-base font-black tracking-tight shrink-0 ${progress?.isFinished ? 'text-emerald-400/60' : 'text-white'}`}>
                        {formatCurrency(expense.value)}
                      </p>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {expense.type === 'INSTALLMENT' ? (
                        <>
                          <div className="flex items-center overflow-hidden rounded-lg border border-white/5 bg-slate-950">
                             <span className="text-[7px] font-black px-1.5 py-0.5 uppercase tracking-widest text-slate-600">Parc</span>
                             <span className="text-[8px] font-black px-2 py-0.5 text-white">{progress?.paidCount} / {progress?.total}</span>
                          </div>
                          {expense.totalValue && (
                            <div className="flex items-center gap-1 text-[7px] font-black text-indigo-400 bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10 uppercase tracking-widest">
                               <ShoppingCart size={8} /> Total: {formatCurrency(expense.totalValue)}
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-[7px] font-black text-rose-400 bg-rose-500/5 px-2 py-0.5 rounded border border-rose-500/10 uppercase tracking-widest">
                            <Clock size={8} /> Fim: {formatMonth(progress!.endDate)}
                          </div>
                        </>
                      ) : expense.type === 'ONCE' ? (
                        <span className="bg-indigo-500/10 text-indigo-400 text-[7px] font-black px-2 py-0.5 rounded uppercase border border-indigo-500/20 tracking-widest">Gasto Único: {formatMonth(new Date(expense.startMonth))}</span>
                      ) : <span className="bg-cyan-500/10 text-cyan-400 text-[7px] font-black px-2 py-0.5 rounded uppercase border border-cyan-500/20 tracking-widest">Mensal</span>}
                      {expense.type !== 'ONCE' && <span className="text-[7px] font-black text-slate-600 bg-slate-950/20 px-2 py-0.5 rounded uppercase border border-white/5 tracking-widest">Desde {formatMonth(new Date(expense.startMonth))}</span>}
                    </div>
                  </div>
                </div>

                {/* Action buttons — always visible on mobile */}
                <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-white/5">
                  <button 
                    onClick={() => onEdit(expense)} 
                    className="flex items-center gap-1.5 px-3 py-2 text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all active:scale-90" 
                    title="Editar"
                  >
                    <Edit3 size={15} />
                    <span className="text-[8px] font-black uppercase tracking-widest">Editar</span>
                  </button>
                  <button 
                    onClick={() => onDeleteRequest(expense)} 
                    className="flex items-center gap-1.5 px-3 py-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all active:scale-90" 
                    title="Excluir"
                  >
                    <Trash2 size={15} />
                    <span className="text-[8px] font-black uppercase tracking-widest">Excluir</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ExpenseList;
