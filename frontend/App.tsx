
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ExpenseList from './components/ExpenseList';
import ExpenseForm from './components/ExpenseForm';
import Settings from './components/Settings';
import { Expense } from './types';
import { startOfMonth } from 'date-fns';
import { AlertTriangle, Trash2, ShieldAlert, X, RefreshCw, LogIn, Mail, KeyRound, Eye, EyeOff, ShieldCheck, ArrowLeft, CheckCircle2, ArrowRight, Hexagon, Send } from 'lucide-react';
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
import { AnimatedBackground } from './components/AnimatedBackground';
import { CardCarousel } from './components/CardCarousel';
import { SignUpScreen } from './components/SignUpScreen';

// ─── Tela de Login ──────────────────────────────────────

const LoginScreen: React.FC<{ onLogin: (user: AuthUser) => void }> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('sena_saved_email');
    const savedPassword = localStorage.getItem('sena_saved_password');
    const savedPasswordDate = localStorage.getItem('sena_saved_password_date');

    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }

    if (savedPassword && savedPasswordDate) {
      const savedDate = new Date(savedPasswordDate);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - savedDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      if (diffDays <= 7) {
        setPassword(savedPassword);
      } else {
        localStorage.removeItem('sena_saved_password');
        localStorage.removeItem('sena_saved_password_date');
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || isLoading) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await authApi.login(email, password);
      
      if (rememberMe) {
        localStorage.setItem('sena_saved_email', email);
        localStorage.setItem('sena_saved_password', password);
        localStorage.setItem('sena_saved_password_date', new Date().toISOString());
      } else {
        localStorage.removeItem('sena_saved_email');
        localStorage.removeItem('sena_saved_password');
        localStorage.removeItem('sena_saved_password_date');
      }

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

  if (isSignUp) {
    return <SignUpScreen onBackToLogin={() => setIsSignUp(false)} />;
  }

  return (
    <>
      {isForgotPassword ? (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6 sm:p-12 overflow-hidden relative">
          <AnimatedBackground />

          {/* Glows de Fundo */}
          <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#34d399]/10 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 bg-[#34d399]/5 blur-[100px] rounded-full pointer-events-none" />

          <div className="w-full max-w-sm relative z-10 space-y-6">
            {/* Header Centralizado */}
            <div className="text-center mb-6 flex flex-col items-center animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="w-16 h-16 sm:w-14 sm:h-14 bg-gray-900 border border-[#34d399]/20 rounded-2xl flex items-center justify-center mb-3 shadow-[0_0_35px_rgba(16,185,129,0.15)]">
                <KeyRound className="text-[#34d399]" size={30} />
              </div>
              <h1 className="text-2xl sm:text-xl font-extrabold text-white tracking-tight">
                Recuperar <span className="text-[#34d399]">Acesso</span>
              </h1>
              <p className="text-[10px] sm:text-[8px] text-[#34d399]/60 font-bold uppercase tracking-[0.15em] mt-1.5">
                Redefina suas credenciais com segurança
              </p>
            </div>

            {/* Formulário de Recuperação */}
            <form onSubmit={handleForgotPasswordSubmit} className="bg-gray-900 border border-white/[0.04] backdrop-blur-2xl rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div>
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
                <div className="bg-[#34d399]/10 border border-[#34d399]/20 rounded-xl px-4 py-3 flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-[#34d399] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#34d399] font-medium leading-relaxed">{success}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Mail size={14} className="text-[#34d399]" /> ENDEREÇO DE EMAIL
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.replace(/\s/g, ''))}
                  placeholder="seu@email.com"
                  required
                  autoFocus
                  className="w-full bg-gray-950 border border-white/5 rounded-xl px-4 py-3 text-white placeholder:text-gray-400/40 focus:border-[#34d399]/50 focus:ring-2 focus:ring-[#34d399]/20 focus:outline-none transition-all duration-300"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#34d399] hover:bg-[#34d399]/90 text-gray-950 py-4 sm:py-3.5 rounded-xl font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-[#34d399]/10 cursor-pointer"
              >
                {isLoading ? <div className="loader-spinner" /> : <Send size={14} />}
                SOLICITAR NOVA SENHA
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setError('');
                  setSuccess('');
                }}
                className="w-full bg-gray-950 hover:bg-gray-950/80 text-gray-400 hover:text-white py-3 rounded-xl font-bold uppercase tracking-wider text-[11px] flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer border border-white/5"
              >
                <ArrowLeft size={14} />
                Voltar para o Login
              </button>
            </form>

            {/* Rodapé */}
            <p className="text-center mt-6 text-[8px] text-gray-400 font-bold uppercase tracking-[0.25em]">
              SELF-HOSTED • V5.0.0 • ENCRYPTION ENABLED
            </p>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-gray-950 flex md:grid md:grid-cols-12 overflow-hidden relative">
          <AnimatedBackground />
          
          {/* ── Painel Esquerdo (Desktop Only - 3D Card Carousel) ── */}
          <div className="hidden md:flex md:col-span-7 lg:col-span-8 bg-gray-900/30 border-r border-white/[0.03] flex-col justify-between relative overflow-hidden">
            {/* Background glow effects - Left Panel */}
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#34d399]/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#34d399]/5 blur-[120px] rounded-full pointer-events-none" />

            {/* 3D Card Carousel - fills the entire panel */}
            <CardCarousel />

            {/* Header overlay on top of the carousel */}
            <div className="absolute top-0 left-0 right-0 p-12 z-20">
              <img src="/logo_hub.png" alt="HUB FINANCEIRO" className="h-12 w-auto object-contain" />
            </div>


          </div>

          {/* ── Painel Direito (Login / Recuperação de Senha) ── */}
          <div className="w-full md:col-span-5 lg:col-span-4 flex flex-col justify-center items-center p-6 sm:p-12 relative overflow-y-auto min-h-screen">
            {/* Glows para Mobile */}
            <div className="md:hidden absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#34d399]/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="md:hidden absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 bg-[#34d399]/5 blur-[100px] rounded-full pointer-events-none" />
            
            {/* Glows para Desktop */}
            <div className="hidden md:block absolute top-1/3 right-10 w-72 h-72 bg-[#34d399]/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="hidden md:block absolute bottom-1/3 right-10 w-72 h-72 bg-[#34d399]/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="w-full max-w-sm relative z-10 space-y-6">
              {/* Header Mobile (Oculto no Desktop) */}
              <div className="md:hidden text-center mb-4 sm:mb-6 flex flex-col items-center">
                <img src="/logo_hub.png" alt="HUB FINANCEIRO" className="h-12 sm:h-14 w-auto object-contain mb-2" />
                <p className="text-[10px] sm:text-[8px] text-[#34d399]/60 font-bold uppercase tracking-[0.15em] mt-1.5">
                  Organize todas suas finanças em um único lugar
                </p>
              </div>

              {/* Header Desktop (Oculto no Mobile) */}
              <div className="hidden md:block mb-4 text-center">
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  Portal de Acesso
                </h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1.5">
                  Insira suas credenciais para entrar
                </p>
              </div>

              {/* Formulários */}
              <form onSubmit={handleSubmit} className="bg-gray-900 border border-white/[0.04] backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-5 sm:p-8 space-y-5 sm:space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                {error && (
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 flex items-start gap-2.5">
                    <AlertTriangle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-rose-400 font-medium leading-relaxed">{error}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Mail size={14} className="text-[#34d399]" /> ENDEREÇO DE EMAIL
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.replace(/\s/g, ''))}
                    placeholder="seu@email.com"
                    required
                    autoFocus
                    className="w-full bg-gray-950 border border-white/5 rounded-xl px-4 py-3.5 sm:py-3 text-white placeholder:text-gray-400/40 focus:border-[#34d399]/50 focus:ring-2 focus:ring-[#34d399]/20 focus:outline-none transition-all duration-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <KeyRound size={14} className="text-[#34d399]" /> SENHA DE ACESSO
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value.trim())}
                      placeholder="Sua senha secreta"
                      required
                      className="w-full bg-gray-950 border border-white/5 rounded-xl px-4 py-3.5 sm:py-3 text-white placeholder:text-gray-400/40 focus:border-[#34d399]/50 focus:ring-2 focus:ring-[#34d399]/20 focus:outline-none transition-all duration-300 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative flex items-center justify-center w-4 h-4">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="peer appearance-none w-4 h-4 border border-white/10 bg-gray-950 rounded cursor-pointer checked:bg-[#34d399] checked:border-[#34d399] transition-all"
                        />
                        <CheckCircle2 size={12} className="absolute text-gray-950 opacity-0 peer-checked:opacity-100 pointer-events-none" strokeWidth={3} />
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 group-hover:text-gray-300 uppercase tracking-wider transition-colors">Lembrar-me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(true);
                        setError('');
                        setSuccess('');
                      }}
                      className="text-[10px] font-bold text-[#34d399] hover:text-[#34d399]/80 uppercase tracking-wider transition-colors cursor-pointer py-1 px-2 -mr-2"
                    >
                      ESQUECI MINHA SENHA
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#34d399] hover:bg-[#34d399]/90 text-gray-950 py-4 sm:py-3.5 rounded-xl font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-[#34d399]/10 cursor-pointer"
                >
                  {isLoading ? <div className="loader-spinner" /> : <ArrowRight size={16} />}
                  ACESSAR PAINEL
                </button>

                <div className="pt-2 text-center">
                  <span className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Ainda não tem conta? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(true);
                      setError('');
                      setSuccess('');
                    }}
                    className="text-[11px] font-bold text-[#34d399] hover:text-[#34d399]/80 uppercase tracking-wider transition-colors cursor-pointer ml-1"
                  >
                    CADASTRE-SE
                  </button>
                </div>
              </form>

              {/* Rodapé */}
              <p className="text-center mt-6 text-[8px] text-gray-400 font-bold uppercase tracking-[0.25em]">
                SELF-HOSTED • V5.0.0 • ENCRYPTION ENABLED
              </p>
            </div>
          </div>
        </div>
      )}
    </>
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
  const [showSmtpOnboarding, setShowSmtpOnboarding] = useState(false);
  
  // States for SMTP onboarding form
  const [smtpForm, setSmtpForm] = useState({ host: '', port: 587, user: '', pass: '', from: '' });
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState<{ success: boolean; message: string } | null>(null);
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

      // Check SMTP for Master Onboarding
      if (user.role === 'master') {
        try {
          const smtpConfig = await settingsApi.getSmtp();
          if (!smtpConfig.configured) {
            setShowSmtpOnboarding(true);
          }
        } catch (e) {
          console.error("Erro ao checar SMTP", e);
        }
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

  const handleTestSmtp = async () => {
    setIsTestingSmtp(true);
    try {
      const result = await settingsApi.testSmtp(smtpForm);
      setSmtpTestResult(result);
    } catch (err: any) {
      setSmtpTestResult({ success: false, message: err.message || 'Falha ao testar SMTP.' });
    } finally {
      setIsTestingSmtp(false);
    }
  };

  const handleSmtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smtpTestResult?.success) {
      alert('Por favor, teste a conexão SMTP com sucesso antes de salvar.');
      return;
    }
    try {
      await settingsApi.updateSmtp(smtpForm);
      setShowSmtpOnboarding(false);
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar configuração SMTP.');
    }
  };

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

      {showSmtpOnboarding && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Configuração Obrigatória</h2>
                <p className="text-sm text-slate-400">Configure o SMTP para habilitar o cadastro de novos usuários</p>
              </div>
            </div>

            <form onSubmit={handleSmtpSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Host SMTP</label>
                  <input type="text" required value={smtpForm.host} onChange={(e) => setSmtpForm({ ...smtpForm, host: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" placeholder="smtp.gmail.com" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Porta</label>
                  <input type="number" required value={smtpForm.port} onChange={(e) => setSmtpForm({ ...smtpForm, port: parseInt(e.target.value) })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Usuário</label>
                  <input type="email" required value={smtpForm.user} onChange={(e) => setSmtpForm({ ...smtpForm, user: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" placeholder="seu@email.com" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Senha (App Password)</label>
                  <input type="password" required value={smtpForm.pass} onChange={(e) => setSmtpForm({ ...smtpForm, pass: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" placeholder="••••••••" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Email de Envio (From)</label>
                  <input type="email" required value={smtpForm.from} onChange={(e) => setSmtpForm({ ...smtpForm, from: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" placeholder="noreply@hubfinanceiro.com" />
                </div>
              </div>

              {smtpTestResult && (
                <div className={`p-3 rounded-lg text-sm flex items-start gap-2 ${smtpTestResult.success ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  {smtpTestResult.success ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
                  {smtpTestResult.message}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-slate-800/50">
                <button type="button" onClick={handleTestSmtp} disabled={isTestingSmtp} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-2">
                  {isTestingSmtp ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  Testar Conexão
                </button>
                <button type="submit" disabled={!smtpTestResult?.success} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium text-sm transition-colors shadow-lg shadow-emerald-500/20">
                  Salvar e Continuar
                </button>
              </div>
            </form>
          </div>
        </div>
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
