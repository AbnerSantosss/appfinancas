import React, { useState, useMemo } from 'react';
import { Expense } from '../types';
import { calculateMonthTotal, formatCurrency, formatMonth, formatFullMonth, getInstallmentInfo, isExpenseActiveInMonth, isMonthPaid } from '../utils';
import { addMonths, startOfMonth, subMonths } from 'date-fns';
import { TrendingUp, Calendar, CheckCircle2, Circle, ChevronLeft, ChevronRight, Wallet, Clock, CreditCard, Zap, Droplets, Wifi, ShoppingBag, Home, HeartPulse, GraduationCap, CheckSquare, Sparkles, TrendingDown, AlertTriangle, Info, X, ChevronsRight, Leaf, PiggyBank, ArrowDown, ChartBarIncreasing, Sparkle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  expenses: Expense[];
  onTogglePaid: (expenseId: string, month: Date) => void;
  onMarkAllAsPaid: (month: Date) => void;
  salary: number;
}

const getCategoryIcon = (category: string) => {
  switch (category?.toLowerCase()) {
    case 'moradia': return <Home size={14} />;
    case 'saúde': return <HeartPulse size={14} />;
    case 'educação': return <GraduationCap size={14} />;
    case 'energia': return <Zap size={14} />;
    case 'água': return <Droplets size={14} />;
    case 'internet': return <Wifi size={14} />;
    case 'cartão': return <CreditCard size={14} />;
    default: return <ShoppingBag size={14} />;
  }
};

const Dashboard: React.FC<DashboardProps> = ({ expenses, salary, onTogglePaid, onMarkAllAsPaid }) => {
  const today = startOfMonth(new Date());
  const [selectedMonth, setSelectedMonth] = useState(today);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  
  const nextMonthDate = addMonths(selectedMonth, 1);
  const prevMonthDate = subMonths(selectedMonth, 1);
  
  const selectedMonthTotal = calculateMonthTotal(expenses, selectedMonth);
  const selectedUnpaidTotal = calculateMonthTotal(expenses, selectedMonth, true);
  const selectedPaidTotal = selectedMonthTotal - selectedUnpaidTotal;

  const currentMonthForecast = calculateMonthTotal(expenses, today);
  const nextMonthForecast = calculateMonthTotal(expenses, addMonths(today, 1));

  const activeExpenses = expenses
    .filter(e => isExpenseActiveInMonth(e, selectedMonth))
    .sort((a, b) => {
      const aPaid = isMonthPaid(a, selectedMonth);
      const bPaid = isMonthPaid(b, selectedMonth);
      if (aPaid === bPaid) return 0;
      return aPaid ? 1 : -1;
    });

  // Insights Data
  const insights = useMemo(() => {
    const projection12 = Array.from({ length: 12 }).map((_, i) => {
      const m = addMonths(today, i);
      const total = calculateMonthTotal(expenses, m);
      return { 
         name: formatMonth(m), 
         total,
         originalDate: m,
      };
    });

    const reliefTimeline = [];
    for (let i = 0; i < projection12.length - 1; i++) {
      const drop = projection12[i].total - projection12[i + 1].total;
      if (drop > 1) {
        reliefTimeline.push({
          month: projection12[i + 1].originalDate,
          dropAmount: drop,
          newTotal: projection12[i + 1].total
        });
      }
    }

    const cumulativeReduction = reliefTimeline.reduce((acc, curr) => acc + curr.dropAmount, 0);
    const heaviest = [...activeExpenses].sort((a, b) => b.value - a.value)[0];

    return { projection12, heaviest, reliefTimeline, cumulativeReduction };
  }, [expenses, today, activeExpenses]);

  const chartDataShort = Array.from({ length: 6 }).map((_, i) => {
    const monthDate = addMonths(today, i);
    return {
      name: formatMonth(monthDate),
      total: calculateMonthTotal(expenses, monthDate),
    };
  });

  return (
    <div className="relative space-y-6 animate-in fade-in duration-500">
      
      {/* HEADER SECTION */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Painel <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-300">Financeiro</span>
          </h2>
          <p className="text-gray-500 text-xs mt-0.5 font-medium">Controle de faturas e planejamento de gastos familiares.</p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-center">
          <button 
            onClick={() => setIsInsightsOpen(true)}
            className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-4 py-2.5 sm:px-4 sm:py-2.5 rounded-xl transition-all duration-200 group active:scale-95 shrink-0 cursor-pointer"
          >
            <Sparkles size={16} className="group-hover:rotate-12 transition-transform duration-300 sm:w-4 sm:h-4" />
            <span className="text-xs font-semibold">Previsões e Insights</span>
          </button>
        </div>
      </header>

      {/* MONTH SELECTOR BAR */}
      <div className="glass-panel p-2 rounded-2xl flex items-center justify-between shadow-lg max-w-md">
        <button 
          onClick={() => setSelectedMonth(prevMonthDate)} 
          className="w-10 h-10 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-white/5 text-gray-400 hover:text-emerald-400 rounded-xl transition-all duration-200 active:scale-90 cursor-pointer"
          title="Mês anterior"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
          <p className="text-sm sm:text-sm font-bold text-white capitalize tracking-tight flex items-center gap-1.5 justify-center">
             <Calendar className="text-emerald-400 w-4 h-4" /> {formatFullMonth(selectedMonth)}
          </p>
        </div>
        <button 
          onClick={() => setSelectedMonth(nextMonthDate)} 
          className="w-10 h-10 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-white/5 text-gray-400 hover:text-emerald-400 rounded-xl transition-all duration-200 active:scale-90 cursor-pointer"
          title="Próximo mês"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* SUMMARY CARDS */}
      {/* SUMMARY CARDS — horizontal scroll on mobile, grid on desktop */}
      <div className="snap-scroll-x sm:grid sm:grid-cols-3 sm:gap-4">
        {/* Unpaid Card */}
        <div className="snap-card glass-panel border-rose-500/15 p-4 sm:p-5 rounded-2xl flex flex-col justify-between shadow-lg relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-rose-500/[0.02] blur-xl rounded-full -z-10" />
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <div className="bg-rose-500/10 text-rose-400 p-2.5 rounded-xl border border-rose-500/10">
              <Clock size={16} />
            </div>
            <span className="text-[10px] font-bold text-rose-400/80 uppercase tracking-wider bg-rose-500/10 px-2 py-0.5 rounded-md">Pendente</span>
          </div>
          <div>
            <p className="text-gray-400 text-xs font-semibold mb-1">A pagar em {formatMonth(selectedMonth)}</p>
            <h3 className="text-2xl sm:text-2xl font-bold text-rose-400 tracking-tight">{formatCurrency(selectedUnpaidTotal)}</h3>
          </div>
        </div>

        {/* Total Month Card */}
        <div className="snap-card glass-panel border-emerald-500/10 p-4 sm:p-5 rounded-2xl flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/[0.02] blur-xl rounded-full -z-10" />
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <div className="bg-emerald-500/10 text-emerald-400 p-2.5 rounded-xl border border-emerald-500/10">
              <Wallet size={16} />
            </div>
            <span className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-md">Previsão Total</span>
          </div>
          <div>
            <p className="text-gray-400 text-xs font-semibold mb-1">Soma de lançamentos</p>
            <h3 className="text-2xl sm:text-2xl font-bold text-white tracking-tight">{formatCurrency(selectedMonthTotal)}</h3>
          </div>
        </div>

        {/* Next Month Forecast Card */}
        <div className="snap-card glass-panel border-cyan-500/10 p-4 sm:p-5 rounded-2xl flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-cyan-500/[0.02] blur-xl rounded-full -z-10" />
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <div className="bg-cyan-500/10 text-cyan-400 p-2.5 rounded-xl border border-cyan-500/10">
              <TrendingUp size={16} />
            </div>
            <span className="text-[10px] font-bold text-cyan-400/80 uppercase tracking-wider bg-cyan-500/10 px-2 py-0.5 rounded-md">Próximo Mês</span>
          </div>
          <div>
            <p className="text-gray-400 text-xs font-semibold mb-1">Previsão para {formatMonth(addMonths(today, 1))}</p>
            <h3 className="text-2xl sm:text-2xl font-bold text-white tracking-tight">{formatCurrency(nextMonthForecast)}</h3>
          </div>
        </div>
      </div>

      {/* MAIN LIST & CHART GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        
        {/* Expenses List column */}
        <div className="lg:col-span-8 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[13px] sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
              <CreditCard size={16} className="text-emerald-400 shrink-0" />
              <span className="truncate">Lançamentos de {formatFullMonth(selectedMonth)}</span>
            </h3>
            {selectedUnpaidTotal > 0 && (
              <button 
                onClick={() => onMarkAllAsPaid(selectedMonth)}
                className="flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-3 py-2 sm:px-3.5 sm:py-1.5 rounded-xl transition-all duration-200 text-xs font-bold shrink-0 active:scale-95 cursor-pointer"
              >
                <CheckSquare size={14} /> <span className="hidden sm:inline">Liquidar</span> Mês
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {activeExpenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 bg-gray-900/20 border border-dashed border-white/[0.05] rounded-3xl">
                <p className="text-gray-500 text-xs font-medium">Nenhum gasto registrado para este mês.</p>
              </div>
            ) : (
              activeExpenses.map(expense => {
                const paid = isMonthPaid(expense, selectedMonth);
                const info = getInstallmentInfo(expense, selectedMonth);
                
                return (
                  <div key={expense.id} className={`glass-panel p-3.5 sm:p-3.5 rounded-2xl transition-all duration-300 flex items-center justify-between gap-2.5 ${paid ? 'border-emerald-500/10 opacity-75 bg-emerald-500/[0.01]' : 'hover:border-white/[0.1] bg-gray-900/30'}`}>
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <button 
                        onClick={() => onTogglePaid(expense.id, selectedMonth)} 
                        className={`w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl transition-all duration-300 border-2 shrink-0 cursor-pointer ${paid ? 'bg-emerald-500 border-emerald-500 text-gray-950 shadow-[0_0_12px_rgba(16,185,129,0.35)]' : 'bg-gray-950/40 border-white/10 text-gray-600 hover:border-emerald-500/40'}`}
                      >
                        {paid ? <CheckCircle2 size={16} strokeWidth={2.5} /> : <Circle size={16} />}
                      </button>
                      
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`shrink-0 ${paid ? 'text-emerald-500/40' : 'text-emerald-400'}`}>
                            {getCategoryIcon(expense.category)}
                          </span>
                          <p className={`font-semibold text-[15px] sm:text-sm leading-tight tracking-tight truncate ${paid ? 'text-gray-500 line-through' : 'text-gray-100'}`}>
                            {expense.description}
                          </p>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5 pl-5">
                          {expense.type === 'INSTALLMENT' && info && (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 uppercase tracking-wider">
                              Parcela {info.current}/{info.total}
                            </span>
                          )}
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${expense.type === 'FIXED' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/25' : expense.type === 'ONCE' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'}`}>
                            {expense.type === 'FIXED' ? 'Fixo' : expense.type === 'ONCE' ? 'Único' : 'Parcelado'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right shrink-0">
                      <p className={`text-base sm:text-md font-bold tracking-tight ${paid ? 'text-emerald-400/50' : 'text-white'}`}>
                        {formatCurrency(expense.value)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Sidebar Statistics & Charts Column */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-5">
          
          {/* 6 MONTH FLOW CHART */}
          <div className="glass-panel p-4 sm:p-5 rounded-2xl flex flex-col shadow-xl">
            <h4 className="text-[11px] sm:text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 sm:mb-4 flex items-center gap-1.5">
              <TrendingUp size={13} /> Fluxo de Despesas (6 meses)
            </h4>
            <div className="h-[130px] sm:h-[150px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartDataShort} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                  <defs>
                    <linearGradient id="neonGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.001}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" opacity={0.15} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 9, fontWeight: 600 }} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px' }} 
                    itemStyle={{ color: '#10b981', fontWeight: 700, fontSize: '11px' }} 
                    labelStyle={{ color: '#9ca3af', fontSize: '10px', fontWeight: 600 }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#10b981" 
                    strokeWidth={2} 
                    fill="url(#neonGradient)" 
                    dot={{ fill: '#10b981', stroke: '#030712', strokeWidth: 2, r: 4 }} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* COST REDUCTION WIDGET */}
          <div className="glass-panel p-5 rounded-2xl shadow-xl flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute -right-6 -top-6 opacity-[0.03] group-hover:rotate-6 transition-transform duration-500 pointer-events-none">
              <PiggyBank size={130} className="text-emerald-400" />
            </div>
            
            <div className="relative z-10 space-y-4">
              <div className="flex justify-between items-start">
                <div className="bg-emerald-500/10 text-emerald-400 p-2.5 rounded-xl border border-emerald-500/15">
                  <ChartBarIncreasing size={16} />
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                  <Sparkle size={10} fill="currentColor" /> Projeção Ativa
                </div>
              </div>
              
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                   Redução de Custos Prevista
                </h4>
                <p className="text-gray-400 text-[11px] leading-relaxed">
                  Total acumulado que deixará de sair do seu orçamento à medida que as parcelas atuais expirarem:
                </p>
              </div>

              <div>
                <span className="text-3xl font-extrabold text-emerald-400 tracking-tight drop-shadow-[0_0_15px_rgba(16,185,129,0.25)]">
                  {formatCurrency(insights.cumulativeReduction)}
                </span>
                <span className="block text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-1.5">
                  Alívio total acumulado
                </span>
              </div>

              <div className="pt-3.5 border-t border-white/[0.04] flex items-start gap-2.5">
                <Info size={14} className="text-gray-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-gray-500 italic leading-snug">
                  Cálculo gerado com base no término de todas as parcelas atualmente registradas.
                </p>
              </div>
            </div>
          </div>

          {/* RELIEF TIMELINE DOCK */}
          <div className="glass-panel p-5 rounded-2xl shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Leaf size={44} className="text-emerald-400" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="bg-emerald-500/10 text-emerald-400 p-2 rounded-lg border border-emerald-500/15">
                  <TrendingDown size={15} />
                </div>
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Linha do Tempo de Alívio</h4>
              </div>

              {insights.reliefTimeline.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-white uppercase tracking-wider border-b border-white/[0.04] pb-2">
                     Próximas quedas mensais:
                  </p>
                  
                  <div className="space-y-3 pl-1">
                    {insights.reliefTimeline.slice(0, 4).map((relief, idx) => (
                      <div key={idx} className="flex items-center justify-between group/item">
                        <div className="flex items-center gap-2.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                          <span className="text-xs font-semibold text-gray-200 capitalize">
                            {formatFullMonth(relief.month)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                           <span className="text-[10px] font-bold text-gray-500 uppercase">Economia:</span>
                           <span className="text-xs font-bold text-emerald-400">
                             -{formatCurrency(relief.dropAmount)}
                           </span>
                           <ArrowDown size={10} className="text-emerald-400" strokeWidth={3} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {salary > 0 && insights.reliefTimeline[0] && (
                    <div className="mt-3 pt-3 border-t border-white/[0.04] bg-white/[0.01] rounded-lg p-2.5 text-center">
                      <p className="text-[10px] text-emerald-400/80 font-bold uppercase tracking-wide leading-normal">
                        Primeiro alívio liberará <span className="text-white">+{((insights.reliefTimeline[0].dropAmount / salary) * 100).toFixed(1)}%</span> da sua receita mensal.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic font-medium pt-2">Estabilidade orçamentária prevista para os próximos meses.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* INTELLIGENCE DRAWER PANEL */}
      {isInsightsOpen && (
        <>
          <div 
            className="fixed inset-0 bg-gray-950/70 backdrop-blur-sm z-[100] animate-in fade-in duration-300" 
            onClick={() => setIsInsightsOpen(false)} 
          />
          <aside className="fixed inset-y-0 right-0 w-full sm:max-w-md bg-gray-900 border-l border-white/[0.08] z-[101] shadow-2xl animate-in slide-in-from-right duration-300 overflow-y-auto no-scrollbar flex flex-col">
            <div className="p-6 md:p-8 space-y-6 flex-1">
              <header className="flex justify-between items-center border-b border-white/[0.04] pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/15">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="text-md font-bold text-white tracking-tight uppercase">Inteligência Financeira</h3>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Análise e Previsões de 12 Meses</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsInsightsOpen(false)}
                  className="p-2 hover:bg-white/5 text-gray-400 hover:text-white rounded-xl transition-all duration-200 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </header>

              {salary > 0 && (
                <div className="p-4.5 bg-emerald-500/[0.02] border border-emerald-500/15 rounded-2xl space-y-3">
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                    <PiggyBank size={12} /> Saúde do Orçamento
                  </p>
                  <p className="text-lg font-bold text-white tracking-tight leading-none">
                    Sobra estimada: <span className="text-emerald-400">{formatCurrency(salary - currentMonthForecast)}</span>
                  </p>
                  <div className="w-full bg-gray-950 h-2 rounded-full overflow-hidden border border-white/[0.04]">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${((currentMonthForecast / salary) * 100) > 85 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                      style={{ width: `${Math.min(100, (currentMonthForecast / salary) * 100)}%` }} 
                    />
                  </div>
                  <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">
                     Despesas comprometem <span className="text-white">{(currentMonthForecast / salary * 100).toFixed(1)}%</span> da receita base.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp size={14} className="text-emerald-400" /> Curva Projetada (1 ano)
                </h4>
                <div className="h-[210px] w-full bg-gray-950/40 p-4 rounded-2xl border border-white/[0.04]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={insights.projection12} margin={{ top: 10, right: 5, left: -30, bottom: 0 }}>
                      <defs>
                        <linearGradient id="insightsGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.001}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 9, fontWeight: 600 }} />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px' }} 
                        itemStyle={{ color: '#10b981', fontWeight: 700, fontSize: '11px' }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="total" 
                        stroke="#10b981" 
                        strokeWidth={2} 
                        fill="url(#insightsGrad)" 
                        dot={{ fill: '#10b981', stroke: '#030712', strokeWidth: 1.5, r: 3 }} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                <div className="p-4 bg-gray-950/50 border border-white/[0.04] rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <TrendingDown size={15} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Resumo de Redução</span>
                  </div>
                  {insights.reliefTimeline.length > 0 ? (
                    <>
                      <p className="text-xs font-semibold text-gray-200 leading-normal">
                         Ao longo dos próximos 12 meses, suas saídas fixas serão reduzidas em <span className="text-emerald-400">{formatCurrency(insights.cumulativeReduction)}</span>.
                      </p>
                      <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Com base na expiração dos lançamentos parcelados cadastrados.</p>
                    </>
                  ) : (
                    <p className="text-xs text-gray-500 italic font-medium">Nenhum alívio financeiro projetado nos registros ativos.</p>
                  )}
                </div>

                <div className="p-4 bg-gray-950/50 border border-white/[0.04] rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-rose-400">
                    <AlertTriangle size={15} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Maior Compromisso Financeiro</span>
                  </div>
                  {insights.heaviest ? (
                    <>
                      <p className="text-xs font-bold text-gray-200">{insights.heaviest.description}</p>
                      <p className="text-xl font-extrabold text-rose-400 leading-none">{formatCurrency(insights.heaviest.value)}</p>
                      <span className="inline-block px-2.5 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/15 text-[8px] font-bold rounded-md uppercase tracking-wider">Maior valor unitário do mês</span>
                    </>
                  ) : (
                    <p className="text-xs text-gray-500 italic font-medium">Nenhum lançamento no período.</p>
                  )}
                </div>
              </div>
            </div>

            <footer className="p-6 border-t border-white/[0.04] bg-gray-950/20 text-center">
              <button 
                onClick={() => setIsInsightsOpen(false)}
                className="text-gray-400 hover:text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 mx-auto cursor-pointer"
              >
                Concluir Análise <ChevronsRight size={14} />
              </button>
            </footer>
          </aside>
        </>
      )}
    </div>
  );
};

export default Dashboard;
