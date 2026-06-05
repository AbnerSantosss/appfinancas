
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ExpenseList from './components/ExpenseList';
import ExpenseForm from './components/ExpenseForm';
import Settings from './components/Settings';
import { Expense } from './types';
import { startOfMonth } from 'date-fns';
import { AlertTriangle, Trash2, ShieldAlert, X, RefreshCw, LogIn, Mail, KeyRound, Eye, EyeOff, ShieldCheck, ArrowLeft, CheckCircle2 } from 'lucide-react';
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
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || isLoading) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await authApi.login(email, password);
      onLogin(result.user);
    } catch (err: any) {
      setError(err.message || 'Falha na autenticação.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isLoading) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await authApi.forgotPassword(email);
      setSuccess(result.message || 'Uma nova senha temporária foi enviada para o seu e-mail.');
    } catch (err: any) {
      setError(err.message || 'Falha ao solicitar nova senha.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(16,185,129,0.3)] border border-emerald-400/20">
            <ShieldCheck className="text-gray-950" size={30} strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight leading-tight">
            Sena Family <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-300">Finance</span>
          </h1>
          <p className="text-[10px] text-emerald-400/70 font-bold uppercase tracking-[0.2em] mt-1.5">Portal de Acesso Seguro</p>
        </div>

        {/* Form */}
        {isForgotPassword ? (
          <form onSubmit={handleForgotPasswordSubmit} className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div>
              <h2 className="text-md font-bold text-white tracking-tight">Recuperar Senha</h2>
              <p className="text-[10px] text-gray-400 leading-relaxed mt-1">
                Insira o seu e-mail cadastrado. Geraremos uma nova senha temporária e a enviaremos para o seu e-mail (requer SMTP configurado).
              </p>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 flex items-start gap-2.5">
                <AlertTriangle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                <p className="text-xs text-rose-400 font-medium leading-relaxed">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-400 font-medium leading-relaxed">{success}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Mail size={12} className="text-emerald-400" /> Endereço de Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                autoFocus
                className="w-full glass-input"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-gray-950 py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-emerald-500/10 cursor-pointer"
            >
              {isLoading ? <div className="loader-spinner" /> : <RefreshCw size={15} />}
              Enviar Senha Temporária
            </button>

            <button
              type="button"
              onClick={() => {
                setIsForgotPassword(false);
                setError('');
                setSuccess('');
              }}
              className="w-full bg-slate-900/60 hover:bg-slate-900 text-gray-300 py-2.5 rounded-xl font-bold uppercase tracking-wider text-[9px] flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer border border-white/5"
            >
              <ArrowLeft size={12} />
              Voltar para o Login
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 flex items-start gap-2.5">
                <AlertTriangle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                <p className="text-xs text-rose-400 font-medium leading-relaxed">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Mail size={12} className="text-emerald-400" /> Endereço de Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                autoFocus
                className="w-full glass-input"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <KeyRound size={12} className="text-emerald-400" /> Senha de Acesso
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(true);
                    setError('');
                    setSuccess('');
                  }}
                  className="text-[9px] font-bold text-emerald-400 hover:text-emerald-300 uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Esqueci minha senha
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha secreta"
                  required
                  className="w-full glass-input pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-gray-950 py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-emerald-500/10 cursor-pointer"
            >
              {isLoading ? <div className="loader-spinner" /> : <LogIn size={15} />}
              Acessar Painel
            </button>
          </form>
        )}

        <p className="text-center mt-6 text-[8px] text-gray-600 font-bold uppercase tracking-[0.25em]">
          Self-Hosted • v5.0.0 • Encryption Enabled
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
  const fetchData = async () => {
    if (!user) return;
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
    if (user) {
      fetchData();
    }
  }, [user]);

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

  // Se não autenticado, mostra login
  if (!isAuthenticated() || !user) {
    return <LoginScreen onLogin={(u) => setUser(u)} />;
  }

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
          <Settings
            user={user}
            salary={salary}
            setSalary={setSalary}
            onSalaryUpdate={handleUpdateSalaryDB}
            isSavingSalary={isSavingSalary}
            onLogout={handleLogout}
            onResetDB={() => setIsResetModalOpen(true)}
            onUserUpdate={(updatedUser) => setUser(updatedUser)}
          />
        );
      default:
        return <Dashboard expenses={expenses} salary={salary} onTogglePaid={togglePaidStatus} onMarkAllAsPaid={markAllAsPaid} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} user={user} onLogout={handleLogout} onUserUpdate={(updatedUser) => setUser(updatedUser)}>
      {renderContent()}

      {isFormOpen && (
        <ExpenseForm 
          onClose={() => { setIsFormOpen(false); setEditingExpense(undefined); }} 
          onSave={editingExpense ? handleUpdateExpense : handleAddExpense}
          initialData={editingExpense}
        />
      )}

      {expenseToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-sm rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300 p-6 md:p-8 text-center border-rose-500/20">
            <div className="w-14 h-14 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 tracking-tight">Confirmar Exclusão?</h3>
            <p className="text-gray-400 text-xs mb-6 leading-relaxed">Você está prestes a remover esta despesa permanentemente do servidor. Deseja continuar?</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setExpenseToDelete(null)} 
                className="flex-1 py-3 bg-gray-800/80 hover:bg-gray-800 text-gray-300 font-semibold rounded-xl text-xs transition-all active:scale-[0.97] cursor-pointer"
              >
                Voltar
              </button>
              <button 
                onClick={confirmDelete} 
                className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-rose-500/10 transition-all active:scale-[0.97] cursor-pointer"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {isResetModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-sm rounded-3xl shadow-2xl p-6 md:p-8 text-center border-rose-500/20">
            <div className="w-14 h-14 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
              <ShieldAlert size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 tracking-tight">Resetar Banco?</h3>
            <p className="text-gray-400 text-xs mb-6 leading-relaxed">Atenção: todas as despesas e lançamentos cadastrados serão apagados permanentemente. Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsResetModalOpen(false)} 
                className="flex-1 py-3 bg-gray-800/80 hover:bg-gray-800 text-gray-300 font-semibold rounded-xl text-xs transition-all active:scale-[0.97] cursor-pointer"
              >
                Cancelar
              </button>
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
                className="flex-1 py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-red-500/10 transition-all active:scale-[0.97] cursor-pointer"
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
