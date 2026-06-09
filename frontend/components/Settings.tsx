import React, { useState, useEffect } from 'react';
import { 
  Wallet, PiggyBank, Save, CheckCircle, Mail, RefreshCw, ShieldAlert, 
  Trash2, Eye, EyeOff, KeyRound, User, Pencil, Lock, Server, 
  Zap, Globe, Hash, AtSign, ChevronDown, ChevronUp, AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { authApi, settingsApi, expensesApi, AuthUser } from '../services/api';
import UserManagement from './UserManagement';
import FamilyManagement from './FamilyManagement';

interface SettingsProps {
  user: AuthUser;
  salary: number;
  setSalary: (v: number) => void;
  onSalaryUpdate: () => void;
  isSavingSalary: boolean;
  onLogout: () => void;
  onResetDB: () => void;
  onUserUpdate: (user: AuthUser) => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  user, salary, setSalary, onSalaryUpdate, isSavingSalary, onLogout, onResetDB, onUserUpdate 
}) => {
  // Profile editing
  const [editName, setEditName] = useState(user.name || '');
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);

  // Password change
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [isChangingPw, setIsChangingPw] = useState(false);
  const [pwResult, setPwResult] = useState<{ success: boolean; message: string } | null>(null);

  // SMTP config
  const [isSmtpOpen, setIsSmtpOpen] = useState(false);
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [smtpFrom, setSmtpFrom] = useState('');
  const [smtpConfigured, setSmtpConfigured] = useState(false);
  const [isSavingSmtp, setIsSavingSmtp] = useState(false);
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [smtpResult, setSmtpResult] = useState<{ success: boolean; message: string } | null>(null);

  // Load SMTP config on mount (if admin)
  useEffect(() => {
    if (user.role === 'master') {
      loadSmtpConfig();
    }
  }, []);

  const loadSmtpConfig = async () => {
    try {
      const result = await settingsApi.getSmtp();
      setSmtpConfigured(result.configured);
      if (result.config) {
        setSmtpHost(result.config.host);
        setSmtpPort(result.config.port.toString());
        setSmtpUser(result.config.user);
        setSmtpFrom(result.config.from);
        // Pass is masked from backend
      }
    } catch {
      // Ignore
    }
  };

  const handleSaveName = async () => {
    setIsSavingName(true);
    setNameSuccess(false);
    try {
      const updated = await authApi.updateProfile(editName);
      onUserUpdate(updated);
      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 3000);
    } catch (err: any) {
      alert('Erro: ' + (err.message || 'Falha ao atualizar nome.'));
    } finally {
      setIsSavingName(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwResult({ success: false, message: 'As senhas não coincidem.' });
      return;
    }
    setIsChangingPw(true);
    setPwResult(null);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      setPwResult({ success: true, message: 'Senha alterada com sucesso!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPwResult({ success: false, message: err.message || 'Falha ao alterar senha.' });
    } finally {
      setIsChangingPw(false);
    }
  };

  const handleSaveSmtp = async () => {
    setIsSavingSmtp(true);
    setSmtpResult(null);
    try {
      await settingsApi.updateSmtp({
        host: smtpHost,
        port: parseInt(smtpPort) || 587,
        user: smtpUser,
        pass: smtpPass,
        from: smtpFrom || 'noreply@hubfinanceiro.com',
      });
      setSmtpConfigured(true);
      setSmtpResult({ success: true, message: 'Configuração SMTP salva com sucesso!' });
    } catch (err: any) {
      setSmtpResult({ success: false, message: err.message || 'Falha ao salvar.' });
    } finally {
      setIsSavingSmtp(false);
    }
  };

  const handleTestSmtp = async () => {
    setIsTestingSmtp(true);
    setSmtpResult(null);
    try {
      const result = await settingsApi.testSmtp({
        host: smtpHost,
        port: parseInt(smtpPort) || 587,
        user: smtpUser,
        pass: smtpPass,
        from: smtpFrom || 'noreply@hubfinanceiro.com',
      });
      setSmtpResult(result);
    } catch (err: any) {
      setSmtpResult({ success: false, message: err.message || 'Falha no teste.' });
    } finally {
      setIsTestingSmtp(false);
    }
  };

  return (
    <div className="p-2 sm:p-4 md:p-8 space-y-6 animate-in fade-in zoom-in duration-500">
      <div className="bg-slate-900/60 backdrop-blur-3xl p-4 sm:p-6 md:p-10 rounded-2xl sm:rounded-[2rem] border border-white/5 max-w-2xl mx-auto shadow-2xl">
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="w-11 h-11 sm:w-12 sm:h-12 bg-emerald-500/20 text-emerald-500 rounded-xl flex items-center justify-center">
            <Wallet size={22} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl md:text-xl font-black text-white tracking-tighter">Opções de Conta</h2>
            <p className="text-slate-500 text-[10px] sm:text-[9px] font-bold uppercase tracking-widest">Configurações e Financeiro</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* ─── Salário ─── */}
          <div className="space-y-3">
            <label className="text-[11px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <PiggyBank size={16} className="text-emerald-500" /> Salário Mensal Base (R$)
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
                onClick={onSalaryUpdate}
                disabled={isSavingSalary}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-6 py-3.5 sm:py-3 rounded-xl font-black uppercase tracking-widest text-[11px] sm:text-[10px] flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
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

          {/* ─── Meu Perfil ─── */}
          <div className="pt-4 border-t border-white/5 space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <User size={14} className="text-emerald-500" /> Meu Perfil
            </label>

            <div className="bg-slate-950/60 border border-white/5 rounded-xl px-4 py-3">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-black text-white">{user.email}</p>
                  <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">{user.role === 'master' ? '👑 Admin' : '👤 Usuário'}</p>
                </div>
                <button
                  onClick={onLogout}
                  className="text-[8px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-400 transition-colors cursor-pointer"
                >
                  Sair
                </button>
              </div>

              {/* Name edit */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Pencil size={9} className="text-emerald-500" /> Nome de exibição
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Seu nome"
                    className="flex-1 bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-semibold focus:border-emerald-500/50 outline-none transition-all placeholder:text-slate-600"
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={isSavingName}
                    className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    {isSavingName ? <RefreshCw size={10} className="animate-spin" /> : nameSuccess ? <CheckCircle2 size={10} /> : <Save size={10} />}
                    {nameSuccess ? 'Salvo!' : 'Salvar'}
                  </button>
                </div>
              </div>
            </div>

            {/* Password change */}
            <div>
              <button
                onClick={() => setIsPasswordOpen(!isPasswordOpen)}
                className="w-full flex items-center justify-between cursor-pointer group"
              >
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 cursor-pointer">
                  <Lock size={10} className="text-amber-500" /> Alterar Senha
                </label>
                {isPasswordOpen 
                  ? <ChevronUp size={12} className="text-slate-500 group-hover:text-slate-300 transition-colors" /> 
                  : <ChevronDown size={12} className="text-slate-500 group-hover:text-slate-300 transition-colors" />
                }
              </button>

              {isPasswordOpen && (
                <form onSubmit={handleChangePassword} className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Senha Atual</label>
                    <div className="relative">
                      <input
                        type={showCurrentPw ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-semibold focus:border-emerald-500/50 outline-none transition-all pr-10 placeholder:text-slate-600"
                        placeholder="Sua senha atual"
                      />
                      <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                        {showCurrentPw ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Nova Senha</label>
                    <div className="relative">
                      <input
                        type={showNewPw ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-semibold focus:border-emerald-500/50 outline-none transition-all pr-10 placeholder:text-slate-600"
                        placeholder="Mínimo 6 caracteres"
                      />
                      <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                        {showNewPw ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Confirmar Nova Senha</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-semibold focus:border-emerald-500/50 outline-none transition-all placeholder:text-slate-600"
                      placeholder="Repita a nova senha"
                    />
                  </div>

                  {pwResult && (
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${
                      pwResult.success ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {pwResult.success ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                      {pwResult.message}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isChangingPw}
                    className="w-full bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-50 cursor-pointer border border-amber-500/10"
                  >
                    {isChangingPw ? <RefreshCw size={12} className="animate-spin" /> : <KeyRound size={12} />}
                    Alterar Senha
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* ─── Family Management ─── */}
          <FamilyManagement currentUserId={user.id} />

          {/* ─── User Management (admin only) ─── */}
          {user.role === 'master' && (
            <UserManagement currentUserId={user.id} />
          )}

          {/* ─── SMTP Config (admin only) ─── */}
          {user.role === 'master' && (
            <div id="smtp-config" className="pt-6 border-t border-white/5">
              <button
                onClick={() => setIsSmtpOpen(!isSmtpOpen)}
                className="w-full flex items-center justify-between cursor-pointer group"
              >
                <label className="text-[10px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2 cursor-pointer">
                  <Server size={14} /> Provedor de Email (SMTP)
                  {smtpConfigured && (
                    <span className="text-[7px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded-md font-black">ATIVO</span>
                  )}
                </label>
                {isSmtpOpen 
                  ? <ChevronUp size={14} className="text-slate-500 group-hover:text-slate-300 transition-colors" /> 
                  : <ChevronDown size={14} className="text-slate-500 group-hover:text-slate-300 transition-colors" />
                }
              </button>

              {isSmtpOpen && (
                <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Configure um servidor SMTP para enviar convites e redefinições de senha automaticamente por email. 
                    Provedores populares: <strong className="text-slate-400">Gmail</strong>, <strong className="text-slate-400">Outlook</strong>, <strong className="text-slate-400">SendGrid</strong>, <strong className="text-slate-400">Mailtrap</strong>.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                        <Globe size={9} className="text-cyan-400" /> Servidor SMTP *
                      </label>
                      <input
                        type="text"
                        value={smtpHost}
                        onChange={(e) => setSmtpHost(e.target.value)}
                        placeholder="smtp.gmail.com"
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white font-semibold focus:border-cyan-500/50 outline-none transition-all placeholder:text-slate-600"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                        <Hash size={9} className="text-cyan-400" /> Porta
                      </label>
                      <input
                        type="number"
                        value={smtpPort}
                        onChange={(e) => setSmtpPort(e.target.value)}
                        placeholder="587"
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white font-semibold focus:border-cyan-500/50 outline-none transition-all placeholder:text-slate-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                        <AtSign size={9} className="text-cyan-400" /> Usuário/Email SMTP *
                      </label>
                      <input
                        type="text"
                        value={smtpUser}
                        onChange={(e) => setSmtpUser(e.target.value)}
                        placeholder="seu@email.com"
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white font-semibold focus:border-cyan-500/50 outline-none transition-all placeholder:text-slate-600"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                        <KeyRound size={9} className="text-cyan-400" /> Senha/App Password *
                      </label>
                      <input
                        type="password"
                        value={smtpPass}
                        onChange={(e) => setSmtpPass(e.target.value)}
                        placeholder={smtpConfigured ? '••••••••' : 'Sua senha SMTP'}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white font-semibold focus:border-cyan-500/50 outline-none transition-all placeholder:text-slate-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                      <Mail size={9} className="text-cyan-400" /> Email Remetente
                    </label>
                    <input
                      type="email"
                      value={smtpFrom}
                      onChange={(e) => setSmtpFrom(e.target.value)}
                      placeholder="noreply@seudominio.com"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white font-semibold focus:border-cyan-500/50 outline-none transition-all placeholder:text-slate-600"
                    />
                  </div>

                  {smtpResult && (
                    <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold ${
                      smtpResult.success ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {smtpResult.success ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                      {smtpResult.message}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={handleTestSmtp}
                      disabled={isTestingSmtp || !smtpHost || !smtpUser || !smtpPass}
                      className="flex-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-50 cursor-pointer"
                    >
                      {isTestingSmtp ? <RefreshCw size={12} className="animate-spin" /> : <Zap size={12} />}
                      Testar Conexão
                    </button>
                    <button
                      onClick={handleSaveSmtp}
                      disabled={isSavingSmtp || !smtpHost || !smtpUser || !smtpPass}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-50 cursor-pointer"
                    >
                      {isSavingSmtp ? <RefreshCw size={12} className="animate-spin" /> : <Save size={12} />}
                      Salvar Configuração
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── Zona de Perigo (admin only) ─── */}
          {user.role === 'master' && (
            <div className="pt-6 border-t border-white/5">
              <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                <ShieldAlert size={14} /> Zona de Perigo
              </label>
              <button 
                onClick={onResetDB}
                className="w-full bg-rose-500/10 text-rose-500 border border-rose-500/20 py-3.5 sm:py-4 rounded-xl hover:bg-rose-500 hover:text-white transition-all font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 size={14} /> Resetar Banco de Dados
              </button>
            </div>
          )}
        </div>
        
        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-[7px] md:text-[9px] text-slate-600 font-bold uppercase tracking-[0.3em]">
            HUB FINANCEIRO • v5.0.0 • Self-Hosted
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
