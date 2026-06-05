
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ExpenseList from './components/ExpenseList';
import ExpenseForm from './components/ExpenseForm';
import { Expense } from './types';
import { startOfMonth } from 'date-fns';
import { LayoutDashboard, AlertTriangle, Trash2, ShieldAlert, Lock, X, RefreshCw, Wallet, PiggyBank, Save, CheckCircle, CloudOff, LogIn, Mail, KeyRound, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { isExpenseActiveInMonth, isMonthPaid } from './utils';
import {
  authApi,
  expensesApi,
  settingsApi,
  isAuthenticated,
  getStoredUser,
  clearAuth,
  AuthUser,
} from './services/api';

// ─── Tela de Login ──────────────────────────────────────

const LoginScreen: React.FC<{ onLogin: (user: AuthUser) => void }> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || isLoading) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await authApi.login(email, password);
      onLogin(result.user);
    } catch (err: any) {
      setError(err.message || 'Falha na autenticação.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
            <ShieldCheck className="text-slate-950" size={32} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tighter">Sena Family Finance</h1>
          <p className="text-[9px] text-emerald-500/60 font-black uppercase tracking-[0.3em] mt-1">Acesso Seguro</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-slate-900/60 backdrop-blur-3xl border border-white/5 rounded-[2rem] p-8 shadow-2xl space-y-5">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
              <AlertTriangle size={14} className="text-rose-500 shrink-0" />
              <p className="text-[10px] text-rose-400 font-bold">{error}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <Mail size={10} /> Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              autoFocus
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3.5 text-white font-bold text-sm focus:border-emerald-500/50 outline-none transition-all placeholder:text-slate-800"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <KeyRound size={10} /> Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3.5 pr-12 text-white font-bold text-sm focus:border-emerald-500/50 outline-none transition-all placeholder:text-slate-800"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-slate-600 hover:text-slate-400 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-4 rounded-xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-emerald-500/20"
          >
            {isLoading ? <RefreshCw size={14} className="animate-spin" /> : <LogIn size={14} />}
            Entrar
          </button>
        </form>

        <p className="text-center mt-6 text-[7px] text-slate-700 font-bold uppercase tracking-[0.3em]">
          Self-Hosted • v5.0.0 • Secured
        </p>
      </div>
    </div>
  );
};

// ─── App Principal ──────────────────────────────────────

const App: React.FC = () => {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [salary, setSalary] = useState<number>(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>();
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingSalary, setIsSavingSalary] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Se não autenticado, mostra login
  if (!isAuthenticated() || !user) {
    return <LoginScreen onLogin={(u) => setUser(u)} />;
  }

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch Expenses
      const expensesData = await expensesApi.list();
      
      const mappedData: Expense[] = expensesData.map(item => ({
        id: item.id,
        description: item.description,
        value: item.value,
        totalValue: item.totalValue ?? undefined,
        type: item.type as Expense['type'],
        installments: item.installments ?? undefined,
        startMonth: item.startMonth,
        category: item.category,
        paidMonths: item.paidMonths || [],
        notes: item.notes ?? undefined,
      }));
      setExpenses(mappedData);

      // Fetch Salary
      try {
        const { salary: serverSalary } = await settingsApi.getSalary();
        setSalary(serverSalary);
      } catch {
        const saved = localStorage.getItem('sena_family_salary');
        if (saved) setSalary(parseFloat(saved));
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateSalaryDB = async () => {
    setIsSavingSalary(true);
    localStorage.setItem('sena_family_salary', salary.toString());
    
    try {
      await settingsApi.updateSalary(salary);
      alert("Salário sincronizado com sucesso!");
    } catch (err: any) {
      console.warn("Erro ao salvar salário:", err);
      alert("Salvo localmente no navegador.");
    } finally {
      setIsSavingSalary(false);
    }
  };

  const handleAddExpense = async (newExpense: Omit<Expense, 'id'>) => {
    await expensesApi.create({
      description: newExpense.description,
      value: newExpense.value,
      totalValue: newExpense.totalValue ?? null,
      type: newExpense.type,
      installments: newExpense.installments ?? null,
      startMonth: newExpense.startMonth,
      category: newExpense.category,
      paidMonths: newExpense.paidMonths || [],
      notes: newExpense.notes ?? null,
    });
    await fetchData();
  };

  const handleUpdateExpense = async (updatedData: Omit<Expense, 'id'>) => {
    if (!editingExpense) return;
    
    await expensesApi.update(editingExpense.id, {
      description: updatedData.description,
      value: updatedData.value,
      totalValue: updatedData.totalValue ?? null,
      type: updatedData.type,
      installments: updatedData.installments ?? null,
      startMonth: updatedData.startMonth,
      category: updatedData.category,
      paidMonths: updatedData.paidMonths,
      notes: updatedData.notes ?? null,
    });
    await fetchData();
    setEditingExpense(undefined);
  };

  const confirmDelete = async () => {
    if (!expenseToDelete) return;
    await expensesApi.delete(expenseToDelete.id);
    setExpenseToDelete(null);
    await fetchData();
  };

  const togglePaidStatus = async (expenseId: string, month: Date) => {
    const monthISO = startOfMonth(month).toISOString();
    const expense = expenses.find(e => e.id === expenseId);
    if (!expense) return;

    const currentPaid = expense.paidMonths || [];
    const isPaid = currentPaid.includes(monthISO);
    const newPaid = isPaid ? currentPaid.filter(m => m !== monthISO) : [...currentPaid, monthISO];

    // Optimistic update
    setExpenses(prev => prev.map(e => e.id === expenseId ? { ...e, paidMonths: newPaid } : e));
    await expensesApi.togglePaid(expenseId, monthISO);
  };

  const markAllAsPaid = async (month: Date) => {
    const monthISO = startOfMonth(month).toISOString();
    const expensesToUpdate = expenses.filter(e => isExpenseActiveInMonth(e, month) && !isMonthPaid(e, month));
    if (expensesToUpdate.length === 0) return;

    await expensesApi.markAllPaid(monthISO);
    await fetchData();
  };

  const handleLogout = () => {
    authApi.logout();
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-24 md:py-32 space-y-3">
          <RefreshCw className="animate-spin text-emerald-500" size={32} />
          <p className="text-slate-500 font-black uppercase tracking-widest text-[8px] md:text-[10px]">Sincronizando com o Servidor...</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard expenses={expenses} salary={salary} onTogglePaid={togglePaidStatus} onMarkAllAsPaid={markAllAsPaid} />;
      case 'expenses':
        return (
          <ExpenseList 
            expenses={expenses} 
            onDeleteRequest={(expense) => setExpenseToDelete(expense)} 
            onEdit={(exp) => { setEditingExpense(exp); setIsFormOpen(true); }}
            onAddNew={() => { setEditingExpense(undefined); setIsFormOpen(true); }}
          />
        );
      case 'settings':
        return (
          <div className="p-4 md:p-8 space-y-6 animate-in fade-in zoom-in duration-500">
             <div className="bg-slate-900/60 backdrop-blur-3xl p-6 md:p-10 rounded-[2rem] border border-white/5 max-w-2xl mx-auto shadow-2xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-emerald-500/20 text-emerald-500 rounded-xl flex items-center justify-center">
                     <Wallet size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-black text-white tracking-tighter">Opções de Conta</h2>
                    <p className="text-slate-500 text-[8px] md:text-[9px] font-bold uppercase tracking-widest">Configurações e Financeiro</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <PiggyBank size={14} className="text-emerald-500" /> Salário Mensal Base (R$)
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <input 
                          type="number" 
                          value={salary || ''} 
                          onChange={(e) => setSalary(parseFloat(e.target.value) || 0)}
                          placeholder="Ex: 5000"
                          className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white font-black focus:border-emerald-500/50 outline-none transition-all"
                        />
                      </div>
                      <button 
                        onClick={handleUpdateSalaryDB}
                        disabled={isSavingSalary}
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                      >
                        {isSavingSalary ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                        Salvar
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                       <span className="text-[7px] text-emerald-500 font-black uppercase tracking-widest flex items-center gap-1">
                         <CheckCircle size={8} /> Conectado ao Servidor
                       </span>
                    </div>
                  </div>

                  {/* Info do usuário logado */}
                  <div className="pt-4 border-t border-white/5 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Mail size={14} className="text-emerald-500" /> Sessão Ativa
                    </label>
                    <div className="bg-slate-950 border border-white/5 rounded-xl px-4 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-black text-white">{user.email}</p>
                        <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">{user.role} • {user.name || 'Sem nome'}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="text-[8px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-400 transition-colors"
                      >
                        Sair
                      </button>
                    </div>
                  </div>

                  {user.role === 'master' && (
                    <div className="pt-6 border-t border-white/5">
                      <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                        <ShieldAlert size={14} /> Zona de Perigo
                      </label>
                      <button 
                        onClick={() => setIsResetModalOpen(true)}
                        className="w-full bg-rose-500/10 text-rose-500 border border-rose-500/20 py-4 rounded-xl hover:bg-rose-500 hover:text-white transition-all font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
                      >
                        <Trash2 size={14} /> Resetar Banco de Dados
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="mt-8 pt-6 border-t border-white/5 text-center">
                  <p className="text-[7px] md:text-[9px] text-slate-600 font-bold uppercase tracking-[0.3em]">
                    Sena Family Finance • v5.0.0 • Self-Hosted
                  </p>
                </div>
             </div>
          </div>
        );
      default:
        return <Dashboard expenses={expenses} salary={salary} onTogglePaid={togglePaidStatus} onMarkAllAsPaid={markAllAsPaid} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} user={user} onLogout={handleLogout}>
      {renderContent()}

      {isFormOpen && (
        <ExpenseForm 
          onClose={() => { setIsFormOpen(false); setEditingExpense(undefined); }} 
          onSave={editingExpense ? handleUpdateExpense : handleAddExpense}
          initialData={editingExpense}
        />
      )}

      {expenseToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-rose-500/30 w-full max-w-sm rounded-[2rem] shadow-2xl animate-in zoom-in duration-300 p-6 md:p-8 text-center">
            <div className="w-12 h-12 bg-rose-500/20 text-rose-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-black text-white mb-1">Confirmar Exclusão?</h3>
            <p className="text-slate-400 text-[10px] mb-6">Remover permanentemente do servidor?</p>
            <div className="flex gap-2">
              <button onClick={() => setExpenseToDelete(null)} className="flex-1 py-3.5 bg-slate-800 text-slate-400 font-black rounded-xl uppercase tracking-widest text-[10px] active:scale-95 transition-all">Não</button>
              <button onClick={confirmDelete} className="flex-1 py-3.5 bg-rose-500 text-slate-950 font-black rounded-xl uppercase tracking-widest text-[10px] active:scale-95 transition-all">Sim, Excluir</button>
            </div>
          </div>
        </div>
      )}

      {isResetModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-rose-500/30 w-full max-w-sm rounded-[2rem] shadow-2xl p-6 md:p-8 text-center">
            <div className="w-12 h-12 bg-rose-500/20 text-rose-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <ShieldAlert size={24} />
            </div>
            <h3 className="text-lg font-black text-white mb-1">Resetar Banco?</h3>
            <p className="text-slate-500 text-[9px] font-bold uppercase mb-6 tracking-widest">Todas as despesas serão apagadas permanentemente.</p>
            <div className="flex gap-2">
              <button onClick={() => setIsResetModalOpen(false)} className="flex-1 py-3.5 bg-slate-800 text-slate-400 font-black rounded-xl uppercase tracking-widest text-[10px] active:scale-95 transition-all">Cancelar</button>
              <button 
                onClick={async () => {
                  try {
                    await expensesApi.resetAll();
                    setExpenses([]);
                    setIsResetModalOpen(false);
                    alert("Banco resetado com sucesso.");
                  } catch (err: any) {
                    alert("Erro: " + (err.message || "Permissão insuficiente."));
                  }
                }}
                className="flex-1 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-[10px] uppercase tracking-widest transition-all active:scale-95"
              >
                Confirmar Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
