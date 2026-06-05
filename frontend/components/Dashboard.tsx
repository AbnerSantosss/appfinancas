
import React, { useState, useMemo } from 'react';
import { Expense } from '../types';
import { calculateMonthTotal, formatCurrency, formatMonth, formatFullMonth, getInstallmentInfo, isExpenseActiveInMonth, isMonthPaid, getExpenseProgress } from '../utils';
import { addMonths, startOfMonth, subMonths, format } from 'date-fns';
import { TrendingUp, Calendar, CheckCircle2, Circle, ChevronLeft, ChevronRight, Wallet, Clock, CreditCard, MessageSquare, Zap, Droplets, Wifi, ShoppingBag, ShoppingCart, Home, HeartPulse, GraduationCap, CheckSquare, Sparkles, TrendingDown, ArrowDownRight, AlertTriangle, Info, X, ChevronsRight, Leaf, PiggyBank, ArrowDown, ChartBarIncreasing, Sparkle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  expenses: Expense[];
  salary: number;
  onTogglePaid: (expenseId: string, month: Date) => void;
  onMarkAllAsPaid: (month: Date) => void;
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
    <div className="relative space-y-6 animate-in fade-in duration-500 min-h-screen">
      
      {/* HEADER SECTION */}
      <header className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg md:text-2xl font-black text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500">
              Painel Financeiro
            </h2>
            <p className="text-slate-500 text-[8px] md:text-[9px] font-bold uppercase tracking-[0.2em]">Gestão de Faturas Sena Family</p>
          </div>

          <button 
            onClick={() => setIsInsightsOpen(true)}
            className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 px-3 py-2.5 rounded-xl transition-all group active:scale-95 shrink-0"
          >
            <Sparkles size={16} className="group-hover:rotate-12 transition-transform" />
            <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">Inteligência</span>
          </button>
        </div>

        <div className="flex items-center justify-center gap-1 bg-slate-900 border border-emerald-500/20 p-1.5 rounded-xl shadow-2xl">
          <button 
            onClick={() => setSelectedMonth(prevMonthDate)} 
            className="w-10 h-10 flex items-center justify-center hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400 rounded-lg transition-all active:scale-90"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="px-4 text-center min-w-[130px]">
            <p className="text-sm font-black text-white capitalize tracking-tight">
              {formatFullMonth(selectedMonth)}
            </p>
          </div>
          <button 
            onClick={() => setSelectedMonth(nextMonthDate)} 
            className="w-10 h-10 flex items-center justify-center hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400 rounded-lg transition-all active:scale-90"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </header>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
        <div className="bg-slate-900/40 border border-rose-500/20 p-3 md:p-4 rounded-2xl flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <div className="bg-rose-500/10 text-rose-400 p-1.5 rounded-lg"><Clock size={14} /></div>
            <span className="text-[7px] font-black text-rose-500/60 uppercase tracking-widest">Pendente</span>
          </div>
          <h3 className="text-base md:text-2xl font-black text-rose-400 tracking-tight">{formatCurrency(selectedUnpaidTotal)}</h3>
          <p className="text-slate-600 text-[7px] md:text-[8px] font-bold uppercase tracking-widest">Em Aberto</p>
        </div>

        <div className="bg-slate-900/40 border border-emerald-500/10 p-3 md:p-4 rounded-2xl flex flex-col justify-between shadow-lg">
          <div className="flex justify-between items-start mb-2">
            <div className="bg-emerald-500/10 text-emerald-400 p-1.5 rounded-lg"><Wallet size={14} /></div>
            <span className="text-[7px] font-black text-emerald-500/60 uppercase tracking-widest">Total</span>
          </div>
          <h3 className="text-base md:text-2xl font-black text-white tracking-tight">{formatCurrency(selectedMonthTotal)}</h3>
          <p className="text-slate-600 text-[7px] md:text-[8px] font-bold uppercase tracking-widest">Previsão</p>
        </div>

        <div className="col-span-2 md:col-span-1 bg-emerald-500 p-3 md:p-4 rounded-2xl flex flex-col justify-between shadow-lg">
          <div className="flex justify-between items-start mb-2">
            <div className="bg-slate-950/20 text-slate-950 p-1.5 rounded-lg"><TrendingUp size={14} /></div>
            <span className="text-[7px] font-black text-slate-900/40 uppercase tracking-widest">Próximo Mês</span>
          </div>
          <h3 className="text-base md:text-2xl font-black text-slate-950 tracking-tight">{formatCurrency(nextMonthForecast)}</h3>
          <p className="text-slate-900/40 text-[7px] md:text-[8px] font-bold uppercase tracking-widest">Previsão {formatMonth(addMonths(today, 1))}</p>
        </div>
      </div>

      {/* MAIN LIST & CHART GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between gap-2 px-1">
            <h3 className="text-[10px] md:text-sm font-black text-white flex items-center gap-2 uppercase tracking-widest">
              <CreditCard size={14} className="text-emerald-400 shrink-0" />
              <span className="truncate">Faturas de {formatFullMonth(selectedMonth)}</span>
            </h3>
            {selectedUnpaidTotal > 0 && (
              <button 
                onClick={() => onMarkAllAsPaid(selectedMonth)}
                className="flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-3 py-2 rounded-lg transition-all text-[8px] font-black uppercase tracking-widest shrink-0 active:scale-95"
              >
                <CheckSquare size={12} /> <span className="hidden sm:inline">Liquidar</span> Tudo
              </button>
            )}
          </div>

          <div className="space-y-2">
            {activeExpenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 bg-slate-900/20 border border-dashed border-slate-800 rounded-2xl">
                <p className="text-slate-600 font-bold uppercase tracking-widest text-[8px]">Nenhum gasto este mês</p>
              </div>
            ) : (
              activeExpenses.map(expense => {
                const paid = isMonthPaid(expense, selectedMonth);
                const info = getInstallmentInfo(expense, selectedMonth);
                
                return (
                  <div key={expense.id} className={`group flex items-center justify-between gap-2 p-3 rounded-xl transition-all border ${paid ? 'bg-slate-900/20 border-emerald-500/10' : 'bg-slate-900/60 border-white/5'}`}>
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <button 
                        onClick={() => onTogglePaid(expense.id, selectedMonth)} 
                        className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-lg transition-all border-2 shrink-0 active:scale-90 ${paid ? 'bg-emerald-500 border-emerald-500 text-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-slate-800 border-white/5 text-slate-600'}`}
                      >
                        {paid ? <CheckCircle2 size={16} strokeWidth={3} /> : <Circle size={16} />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`shrink-0 ${paid ? 'text-emerald-500/50' : 'text-emerald-500'}`}>{getCategoryIcon(expense.category)}</span>
                          <p className={`font-black text-xs md:text-sm leading-tight tracking-tight truncate ${paid ? 'text-slate-500 line-through opacity-70' : 'text-slate-100'}`}>{expense.description}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          {expense.type === 'INSTALLMENT' && info && (
                            <div className="flex items-center overflow-hidden rounded border border-white/5 bg-slate-950/50">
                               <span className="text-[6px] font-black px-1 py-0.5 uppercase tracking-widest text-slate-500">Parc</span>
                               <span className="text-[7px] font-black px-1.5 py-0.5 text-emerald-400">{info.current} / {info.total}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-sm md:text-lg font-black tracking-tight ${paid ? 'text-emerald-500/40' : 'text-white'}`}>{formatCurrency(expense.value)}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-4">
          {/* GRÁFICO 6 MESES */}
          <div className="bg-slate-900/60 backdrop-blur-3xl border border-white/5 p-4 md:p-5 rounded-2xl flex flex-col shadow-xl">
            <h4 className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <TrendingUp size={12} /> Fluxo 6 Meses
            </h4>
            <div className="h-[160px] w-full min-h-[160px]">
              <ResponsiveContainer width="100%" height="100%" minHeight={160}>
                <AreaChart data={chartDataShort} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs><linearGradient id="neonGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" opacity={0.1} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 7, fontWeight: 800 }} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid #10b98120', borderRadius: '8px', padding: '6px' }} itemStyle={{ color: '#10b981', fontWeight: 800, fontSize: '9px' }} labelStyle={{ color: '#64748b', fontSize: '9px' }} />
                  <Area type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} fill="url(#neonGradient)" dot={{ fill: '#10b981', r: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CARD DE REDUÇÃO CUMULATIVA (DIDÁTICO) */}
          <div className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl shadow-xl flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute -right-6 -top-6 opacity-[0.05] group-hover:rotate-12 transition-transform duration-500">
              <PiggyBank size={140} className="text-emerald-500" />
            </div>
            
            <div className="relative z-10 space-y-4">
              <div className="flex justify-between items-start">
                <div className="bg-emerald-500/10 text-emerald-500 p-2 rounded-xl border border-emerald-500/20">
                  <ChartBarIncreasing size={18} />
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-500 text-slate-950 px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-tighter">
                  <Sparkle size={8} fill="currentColor" /> Projeção 12 meses
                </div>
              </div>
              
              <div className="space-y-1">
                <h4 className="text-[11px] font-black text-white uppercase tracking-wider flex items-center gap-2">
                   Redução de Custos
                </h4>
                <p className="text-[9px] text-slate-500 font-bold leading-relaxed">
                  Dinheiro que deixará de sair da sua conta conforme suas parcelas terminarem até o final do ano:
                </p>
              </div>

              <div className="flex flex-col">
                <span className="text-3xl font-black text-emerald-400 tracking-tighter drop-shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  {formatCurrency(insights.cumulativeReduction)}
                </span>
                <span className="text-[8px] text-emerald-500/40 font-black uppercase tracking-widest mt-1">
                  Alívio total acumulado
                </span>
              </div>

              <div className="pt-3 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-white/5 rounded">
                    <Info size={10} className="text-slate-500" />
                  </div>
                  <p className="text-[8px] text-slate-600 font-medium leading-tight italic">
                    Esse valor representa a soma de todas as economias mensais geradas pelo fim dos seus compromissos atuais.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* PAINEL DE ALÍVIO À VISTA (PROJEÇÃO DE MAIS MESES) */}
          <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 p-5 rounded-3xl shadow-xl shadow-emerald-500/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
              <Leaf size={40} className="text-emerald-400" />
            </div>
            
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2">
                <div className="bg-emerald-500 text-slate-950 p-1.5 rounded-lg shadow-lg shadow-emerald-500/20">
                  <TrendingDown size={16} strokeWidth={3} />
                </div>
                <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Linha do Tempo de Alívio</h4>
              </div>

              {insights.reliefTimeline.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-[10px] md:text-xs font-black text-white leading-snug uppercase tracking-widest border-b border-emerald-500/10 pb-2">
                    Próximas reduções de custos:
                  </p>
                  
                  <div className="space-y-3">
                    {insights.reliefTimeline.slice(0, 4).map((relief, idx) => (
                      <div key={idx} className="flex items-center justify-between group/item">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                          <span className="text-[9px] font-black text-slate-100 uppercase tracking-tighter">
                            {formatFullMonth(relief.month)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                           <span className="text-[8px] font-bold text-slate-500 uppercase">Redução:</span>
                           <span className="text-[10px] md:text-xs font-black text-emerald-400">
                             -{formatCurrency(relief.dropAmount)}
                           </span>
                           <div className="bg-emerald-500/10 p-0.5 rounded text-emerald-500 group-hover/item:translate-y-0.5 transition-transform">
                             <ArrowDown size={8} strokeWidth={4} />
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {salary > 0 && insights.reliefTimeline[0] && (
                    <div className="mt-4 pt-4 border-t border-white/5 bg-slate-950/20 -mx-5 px-5 py-3 text-center">
                      <p className="text-[8px] text-emerald-500/60 font-black uppercase tracking-widest">
                        O primeiro alívio libera <span className="text-white">+{((insights.reliefTimeline[0].dropAmount / salary) * 100).toFixed(1)}%</span> do seu rendimento.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-[9px] text-slate-500 font-bold italic uppercase tracking-widest">Estabilidade financeira prevista nos registros atuais.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PAINEL LATERAL DE INTELIGÊNCIA */}
      {isInsightsOpen && (
        <>
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] animate-in fade-in duration-300" 
            onClick={() => setIsInsightsOpen(false)} 
          />
          <aside className="fixed inset-0 sm:left-auto sm:right-0 sm:top-0 sm:bottom-0 w-full sm:max-w-md bg-slate-900 border-l border-white/10 z-[101] shadow-2xl animate-in slide-in-from-right duration-500 overflow-y-auto no-scrollbar">
            <div className="p-6 md:p-8 space-y-8">
              <header className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/20 text-emerald-500 rounded-xl">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white tracking-tight uppercase">Inteligência</h3>
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Projeções Financeiras</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsInsightsOpen(false)}
                  className="p-2 hover:bg-white/5 text-slate-500 hover:text-white rounded-lg transition-all"
                >
                  <X size={20} />
                </button>
              </header>

              {salary > 0 && (
                <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                  <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                    <PiggyBank size={12} /> Saúde do Orçamento
                  </p>
                  <p className="text-xl font-black text-white tracking-tight mb-3">
                    Sobra estimada: <span className="text-emerald-400">{formatCurrency(salary - currentMonthForecast)}</span>
                  </p>
                  <div className="w-full bg-slate-950/50 h-2 rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (currentMonthForecast / salary) * 100)}%` }} />
                  </div>
                  <p className="text-[7px] text-slate-500 font-bold uppercase mt-2 tracking-widest">Gastos comprometem {(currentMonthForecast / salary * 100).toFixed(1)}% do salário base</p>
                </div>
              )}

              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <TrendingUp size={14} className="text-emerald-500" /> Projeção de 1 ano
                </h4>
                <div className="h-[220px] w-full bg-slate-950/40 p-4 rounded-2xl border border-white/5">
                  <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                    <AreaChart data={insights.projection12} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="insightsGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 8, fontWeight: 800 }} />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#020617', border: '1px solid #10b98130', borderRadius: '12px' }} 
                        itemStyle={{ color: '#10b981', fontWeight: 900, fontSize: '11px' }} 
                      />
                      <Area type="monotone" dataKey="total" stroke="#10b981" strokeWidth={3} fill="url(#insightsGrad)" dot={{ fill: '#10b981', r: 3 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="p-5 bg-slate-950 border border-white/5 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <TrendingDown size={16} />
                    <span className="text-[8px] font-black uppercase tracking-widest">Resumo de Redução</span>
                  </div>
                  {insights.reliefTimeline.length > 0 ? (
                    <>
                      <p className="text-xs font-black text-white">Ao longo do ano, suas faturas vão cair um total de <span className="text-emerald-400">{formatCurrency(insights.cumulativeReduction)}</span>.</p>
                      <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">Baseado no término das parcelas atuais.</p>
                    </>
                  ) : (
                    <p className="text-xs font-black text-slate-500 italic">Estabilidade total prevista.</p>
                  )}
                </div>

                <div className="p-5 bg-slate-950 border border-white/5 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-rose-500">
                    <AlertTriangle size={16} />
                    <span className="text-[8px] font-black uppercase tracking-widest">Maior Gasto do Mês</span>
                  </div>
                  {insights.heaviest ? (
                    <>
                      <p className="text-sm font-black text-white tracking-tight">{insights.heaviest.description}</p>
                      <p className="text-xl font-black text-rose-500 tracking-tighter">{formatCurrency(insights.heaviest.value)}</p>
                      <span className="inline-block px-2 py-0.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[7px] font-black rounded uppercase tracking-tighter">Impacto Individual</span>
                    </>
                  ) : (
                    <p className="text-xs font-black text-slate-500 italic">Sem registros para análise.</p>
                  )}
                </div>
              </div>

              <footer className="pt-8 border-t border-white/5 text-center">
                 <button 
                  onClick={() => setIsInsightsOpen(false)}
                  className="text-slate-500 hover:text-white text-[9px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2 mx-auto"
                 >
                   Fechar Inteligência <ChevronsRight size={12} />
                 </button>
              </footer>
            </div>
          </aside>
        </>
      )}
    </div>
  );
};

export default Dashboard;
