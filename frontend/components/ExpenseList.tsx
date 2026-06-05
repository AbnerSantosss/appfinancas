import React, { useState } from 'react';
import { Expense } from '../types';
import { formatCurrency, getExpenseProgress, formatMonth } from '../utils';
import { Edit3, Trash2, Search, Filter, Plus, Clock, MessageSquare, Zap, Droplets, Wifi, CreditCard, ShoppingBag, ShoppingCart, Home, HeartPulse, GraduationCap, ArrowDown } from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  onDeleteRequest: (expense: Expense) => void;
  onEdit: (expense: Expense) => void;
  onAddNew: () => void;
}

const getCategoryIcon = (category: string) => {
  switch (category?.toLowerCase()) {
    case 'moradia': return <Home size={16} />;
    case 'saúde': return <HeartPulse size={16} />;
    case 'educação': return <GraduationCap size={16} />;
    case 'energia': return <Zap size={16} />;
    case 'água': return <Droplets size={16} />;
    case 'internet': return <Wifi size={16} />;
    case 'cartão': return <CreditCard size={16} />;
    default: return <ShoppingBag size={16} />;
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
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Banco de <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-300">Lançamentos</span>
          </h2>
          <p className="text-gray-500 text-xs mt-0.5 font-medium">Histórico geral de custos fixos, únicos e parcelas ativas.</p>
        </div>
        
        <button 
          onClick={onAddNew} 
          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-gray-950 px-5 py-3 rounded-xl flex items-center justify-center gap-2 font-bold uppercase tracking-wider text-xs transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/10 cursor-pointer"
        >
          <Plus size={16} strokeWidth={2.5} /> Novo Lançamento
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input 
            type="text" 
            placeholder="Procurar lançamentos..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="w-full glass-input pl-11" 
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
          <select 
            value={filterType} 
            onChange={e => setFilterType(e.target.value as any)} 
            className="w-full glass-input pl-11 pr-8 appearance-none cursor-pointer font-medium"
          >
            <option value="ALL" className="bg-gray-950 text-white">Todos os tipos</option>
            <option value="FIXED" className="bg-gray-950 text-white">Mensais Fixos</option>
            <option value="INSTALLMENT" className="bg-gray-950 text-white">Parcelados</option>
            <option value="ONCE" className="bg-gray-950 text-white">Gastos Únicos</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
            <ArrowDown size={14} />
          </div>
        </div>
      </div>

      {/* Expense Cards List */}
      <div className="space-y-3">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-16 bg-gray-900/10 rounded-2xl border border-dashed border-white/[0.04]">
            <p className="text-gray-500 text-xs font-medium">Nenhum lançamento corresponde à busca.</p>
          </div>
        ) : (
          filteredExpenses.map(expense => {
            const progress = getExpenseProgress(expense);
            return (
              <div key={expense.id} className={`glass-panel p-4 rounded-2xl glass-card-hover relative overflow-hidden border ${progress?.isFinished ? 'border-emerald-500/20 bg-emerald-500/[0.01]' : 'border-white/[0.04]'}`}>
                {/* Upper line: icon + details */}
                <div className="flex items-start gap-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 ${expense.type === 'FIXED' ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]' : expense.type === 'ONCE' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : progress?.isFinished ? 'bg-emerald-500/25 border-emerald-500/40 text-emerald-400' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'}`}>
                    {getCategoryIcon(expense.category)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h4 className={`font-bold text-sm leading-tight tracking-tight ${progress?.isFinished ? 'text-emerald-400' : 'text-white'}`}>
                          {expense.description}
                        </h4>
                        {expense.notes && (
                          <p className="text-[11px] text-gray-500 mt-1 flex items-start gap-1.5 leading-relaxed font-medium">
                            <MessageSquare size={12} className="mt-0.5 shrink-0 text-gray-600" /> {expense.notes}
                          </p>
                        )}
                      </div>
                      <p className={`text-md font-bold tracking-tight shrink-0 ${progress?.isFinished ? 'text-emerald-400/80' : 'text-white'}`}>
                        {formatCurrency(expense.value)}
                      </p>
                    </div>

                    {/* Metadata tags */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {expense.type === 'INSTALLMENT' ? (
                        <>
                          <span className="bg-gray-950 border border-white/[0.04] text-gray-300 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1.5">
                            Parcelas: <strong className="text-cyan-400">{progress?.paidCount} de {progress?.total}</strong>
                          </span>
                          {expense.totalValue && (
                            <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                               <ShoppingCart size={11} /> Total: {formatCurrency(expense.totalValue)}
                            </span>
                          )}
                          <span className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Clock size={11} /> Fim: {formatMonth(progress!.endDate)}
                          </span>
                        </>
                      ) : expense.type === 'ONCE' ? (
                        <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          Gasto Único: {formatMonth(new Date(expense.startMonth))}
                        </span>
                      ) : (
                        <span className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          Mensal Recorrente
                        </span>
                      )}
                      
                      {expense.type !== 'ONCE' && (
                        <span className="text-[10px] font-semibold text-gray-500 bg-white/[0.01] px-2 py-0.5 rounded-md border border-white/[0.03]">
                          Início: {formatMonth(new Date(expense.startMonth))}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom line: action triggers */}
                <div className="flex items-center justify-end gap-2 mt-4 pt-3.5 border-t border-white/[0.04] shrink-0">
                  <button 
                    onClick={() => onEdit(expense)} 
                    className="flex items-center gap-1.5 px-3 py-1.5 text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all duration-200 cursor-pointer text-xs font-semibold" 
                    title="Editar Lançamento"
                  >
                    <Edit3 size={14} /> Editar
                  </button>
                  <button 
                    onClick={() => onDeleteRequest(expense)} 
                    className="flex items-center gap-1.5 px-3 py-1.5 text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all duration-200 cursor-pointer text-xs font-semibold" 
                    title="Excluir Lançamento"
                  >
                    <Trash2 size={14} /> Excluir
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
