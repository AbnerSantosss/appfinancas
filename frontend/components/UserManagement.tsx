import React, { useState, useEffect } from 'react';
import { adminApi, AdminUser } from '../services/api';
import { 
  UserPlus, Users, RefreshCw, Mail, KeyRound, Eye, EyeOff, 
  Trash2, Key, AlertTriangle, CheckCircle, X, Copy, Shield, 
  Clock, Database, Send, User, ChevronDown, ChevronUp, Ban, CheckCircle2,
  MailWarning
} from 'lucide-react';

interface UserManagementProps {
  currentUserId: string;
}

const UserManagement: React.FC<UserManagementProps> = ({ currentUserId }) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Invite form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [invitePassword, setInvitePassword] = useState('');
  const [showInvitePassword, setShowInvitePassword] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ success: boolean; message: string; emailSent?: boolean } | null>(null);

  // Reset password
  const [resetTarget, setResetTarget] = useState<AdminUser | null>(null);
  const [resetResult, setResetResult] = useState<{ newPassword: string; emailSent: boolean; userEmail: string } | null>(null);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Expand sections
  const [isInviteSectionOpen, setIsInviteSectionOpen] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.listUsers();
      setUsers(data);
    } catch (err: any) {
      console.error('Erro ao carregar usuários:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !invitePassword || isInviting) return;

    setIsInviting(true);
    setInviteResult(null);

    try {
      const result = await adminApi.inviteUser(inviteEmail, invitePassword, inviteName || undefined);
      setInviteResult({
        success: true,
        message: result.emailSent
          ? `Convite enviado por email para ${inviteEmail}!`
          : `Usuário criado! O SMTP não está configurado — informe as credenciais manualmente.`,
        emailSent: result.emailSent,
      });
      setInviteEmail('');
      setInviteName('');
      setInvitePassword('');
      await fetchUsers();
    } catch (err: any) {
      setInviteResult({ success: false, message: err.message || 'Erro ao convidar usuário.' });
    } finally {
      setIsInviting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetTarget) return;
    try {
      const result = await adminApi.resetPassword(resetTarget.id);
      setResetResult(result);
      setResetTarget(null);
    } catch (err: any) {
      alert('Erro: ' + (err.message || 'Falha ao resetar senha.'));
      setResetTarget(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await adminApi.deleteUser(deleteTarget.id);
      setDeleteTarget(null);
      await fetchUsers();
    } catch (err: any) {
      alert('Erro: ' + (err.message || 'Falha ao remover usuário.'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (user: AdminUser) => {
    try {
      await adminApi.toggleStatus(user.id);
      await fetchUsers();
    } catch (err: any) {
      alert('Erro: ' + (err.message || 'Falha ao alterar status.'));
    }
  };

  const handleResendVerification = async (userId: string) => {
    try {
      const res = await adminApi.resendVerification(userId);
      alert(res.message || 'E-mail de verificação reenviado.');
    } catch (err: any) {
      alert('Erro: ' + (err.message || 'Falha ao reenviar e-mail de verificação.'));
    }
  };

  const isOnline = (lastActiveAt?: string | null) => {
    if (!lastActiveAt) return false;
    const diff = new Date().getTime() - new Date(lastActiveAt).getTime();
    return diff < 5 * 60 * 1000; // 5 minutos
  };

  // Agrupar usuários: Heads (sem familyId) e Membros
  const headUsers = users.filter(u => !u.familyId || u.id === u.familyId);
  const familyMembers = users.filter(u => u.familyId && u.id !== u.familyId);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* ─── Convidar Novo Usuário ─── */}
      <div className="pt-6 border-t border-white/5">
        <button
          onClick={() => setIsInviteSectionOpen(!isInviteSectionOpen)}
          className="w-full flex items-center justify-between cursor-pointer group"
        >
          <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2 cursor-pointer">
            <UserPlus size={14} /> Convidar Novo Usuário
          </label>
          {isInviteSectionOpen 
            ? <ChevronUp size={14} className="text-slate-500 group-hover:text-slate-300 transition-colors" /> 
            : <ChevronDown size={14} className="text-slate-500 group-hover:text-slate-300 transition-colors" />
          }
        </button>

        {isInviteSectionOpen && (
          <form onSubmit={handleInvite} className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Mail size={10} className="text-emerald-500" /> Email *
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="usuario@email.com"
                  required
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white font-semibold focus:border-emerald-500/50 outline-none transition-all placeholder:text-slate-600"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <User size={10} className="text-emerald-500" /> Nome (opcional)
                </label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Nome do usuário"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white font-semibold focus:border-emerald-500/50 outline-none transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <KeyRound size={10} className="text-emerald-500" /> Senha de Acesso *
              </label>
              <div className="relative">
                <input
                  type={showInvitePassword ? 'text' : 'password'}
                  value={invitePassword}
                  onChange={(e) => setInvitePassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white font-semibold focus:border-emerald-500/50 outline-none transition-all pr-10 placeholder:text-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowInvitePassword(!showInvitePassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showInvitePassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isInviting}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-50 cursor-pointer"
            >
              {isInviting ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
              Enviar Convite
            </button>

            {inviteResult && (
              <div className={`flex items-start gap-2.5 px-4 py-3 rounded-xl border ${
                inviteResult.success 
                  ? 'bg-emerald-500/10 border-emerald-500/20' 
                  : 'bg-rose-500/10 border-rose-500/20'
              }`}>
                {inviteResult.success 
                  ? <CheckCircle size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  : <AlertTriangle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                }
                <div>
                  <p className={`text-xs font-semibold ${inviteResult.success ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {inviteResult.message}
                  </p>
                  {inviteResult.success && !inviteResult.emailSent && (
                    <p className="text-[10px] text-amber-400 mt-1 font-medium">
                      ⚠️ SMTP não configurado.{' '}
                      <button 
                        type="button"
                        onClick={() => {
                          const el = document.getElementById('smtp-config');
                          if (el) {
                            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            // Trigger click on the SMTP section header to open it
                            const btn = el.querySelector('button');
                            if (btn) setTimeout(() => btn.click(), 500);
                          }
                        }}
                        className="underline hover:text-amber-300 transition-colors cursor-pointer font-bold"
                      >
                        Configurar provedor de email →
                      </button>
                    </p>
                  )}
                </div>
                <button onClick={() => setInviteResult(null)} className="text-slate-500 hover:text-slate-300 shrink-0 ml-auto">
                  <X size={12} />
                </button>
              </div>
            )}
          </form>
        )}
      </div>

      {/* ─── Lista de Usuários ─── */}
      <div className="pt-6 border-t border-white/5">
        <div className="flex items-center justify-between mb-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Users size={14} className="text-emerald-500" /> Usuários Cadastrados
          </label>
          <button
            onClick={fetchUsers}
            disabled={isLoading}
            className="text-[9px] font-bold text-slate-500 hover:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw size={10} className={isLoading ? 'animate-spin' : ''} /> Atualizar
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw size={20} className="animate-spin text-emerald-500" />
          </div>
        ) : users.length === 0 ? (
          <p className="text-xs text-slate-600 text-center py-6">Nenhum usuário encontrado.</p>
        ) : (
          <div className="space-y-4">
            {headUsers.map(head => {
              const members = familyMembers.filter(m => m.familyId === head.id);
              return (
                <div key={head.id} className="space-y-2">
                  {/* Titular da Conta */}
                  <div className={`bg-slate-950/60 border rounded-xl px-3.5 py-3 sm:px-4 sm:py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${
                    head.id === currentUserId 
                      ? 'border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.05)]' 
                      : !head.isActive ? 'border-rose-500/20 opacity-75' : 'border-white/5 hover:border-white/10'
                  }`}>
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        head.role === 'master' 
                          ? 'bg-amber-500/15 text-amber-400' 
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {head.role === 'master' ? <Shield size={14} /> : <User size={14} />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-[11px] sm:text-xs font-bold truncate ${!head.isActive ? 'text-slate-400 line-through' : 'text-white'}`}>
                            {head.email}
                          </p>
                          {head.id === currentUserId && (
                            <span className="text-[7px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-1.5 py-0.5 rounded-md shrink-0">Você</span>
                          )}
                          <div className={`w-2 h-2 rounded-full ${isOnline(head.lastActiveAt) ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-600'}`} title={isOnline(head.lastActiveAt) ? 'Online' : 'Offline'} />
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-0.5">
                          <span className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">
                            {head.role === 'master' ? '👑 Admin' : '👤 Titular'}
                          </span>
                          {head.name && (
                            <span className="text-[8px] text-slate-500 font-semibold truncate max-w-[100px]">{head.name}</span>
                          )}
                          <span className="text-[8px] text-slate-600 flex items-center gap-0.5">
                            <Database size={8} /> {head.expenseCount} desp.
                          </span>
                          {!head.isActive && (
                            <span className="text-[8px] text-rose-400 font-bold uppercase tracking-widest flex items-center gap-1 bg-rose-500/10 px-1.5 py-0.5 rounded">
                              <Ban size={8} /> Bloqueado
                            </span>
                          )}
                          {!head.isEmailVerified && (
                            <span className="text-[8px] text-amber-400 font-bold uppercase tracking-widest flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 rounded" title="E-mail não confirmado">
                              <AlertTriangle size={8} /> Pendente
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {head.id !== currentUserId && head.role !== 'master' && (
                      <div className="flex flex-wrap items-center gap-0.5 shrink-0 self-end sm:self-auto">
                        {!head.isEmailVerified && (
                          <button
                            onClick={() => handleResendVerification(head.id)}
                            title="Reenviar E-mail de Verificação"
                            className="p-2.5 rounded-lg text-amber-500/60 hover:text-amber-400 hover:bg-amber-500/10 transition-all cursor-pointer"
                          >
                            <MailWarning size={13} />
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleStatus(head)}
                          title={head.isActive ? "Bloquear Acesso" : "Desbloquear Acesso"}
                          className={`p-2.5 rounded-lg transition-all cursor-pointer ${
                            head.isActive ? 'text-amber-500/60 hover:text-amber-400 hover:bg-amber-500/10' : 'text-emerald-500/60 hover:text-emerald-400 hover:bg-emerald-500/10'
                          }`}
                        >
                          {head.isActive ? <Ban size={13} /> : <CheckCircle2 size={13} />}
                        </button>
                        <button
                          onClick={() => setResetTarget(head)}
                          title="Resetar Senha"
                          className="p-2.5 rounded-lg text-amber-500/60 hover:text-amber-400 hover:bg-amber-500/10 transition-all cursor-pointer"
                        >
                          <Key size={13} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(head)}
                          title="Remover Usuário"
                          className="p-2.5 rounded-lg text-rose-500/60 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Membros da Família */}
                  {members.length > 0 && (
                    <div className="pl-6 space-y-2 border-l border-white/5 ml-3">
                      {members.map(member => (
                        <div key={member.id} className={`bg-slate-950/40 border rounded-xl px-3 sm:px-4 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${
                          !member.isActive ? 'border-rose-500/10 opacity-75' : 'border-white/5'
                        }`}>
                          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                            <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 bg-slate-900 text-slate-500">
                              <Users size={12} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className={`text-[10px] sm:text-[11px] font-bold truncate ${!member.isActive ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                                  {member.email}
                                </p>
                                <div className={`w-1.5 h-1.5 rounded-full ${isOnline(member.lastActiveAt) ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]' : 'bg-slate-700'}`} title={isOnline(member.lastActiveAt) ? 'Online' : 'Offline'} />
                              </div>
                              <div className="flex flex-wrap items-center gap-2 mt-0.5">
                                <span className="text-[7px] text-slate-600 font-bold uppercase tracking-widest">Membro</span>
                                {member.name && (
                                  <span className="text-[7px] text-slate-500 font-semibold truncate max-w-[80px]">{member.name}</span>
                                )}
                                {!member.isActive && (
                                  <span className="text-[7px] text-rose-500 font-bold uppercase tracking-widest">Bloqueado</span>
                                )}
                                {!member.isEmailVerified && (
                                  <span className="text-[7px] text-amber-500 font-bold uppercase tracking-widest bg-amber-500/10 px-1 py-0.5 rounded">Pendente</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-0.5 shrink-0 self-end sm:self-auto">
                            {!member.isEmailVerified && (
                              <button
                                onClick={() => handleResendVerification(member.id)}
                                title="Reenviar E-mail de Verificação"
                                className="p-2 rounded-lg text-amber-500/60 hover:text-amber-400 hover:bg-amber-500/10 transition-all cursor-pointer"
                              >
                                <MailWarning size={11} />
                              </button>
                            )}
                            <button
                              onClick={() => handleToggleStatus(member)}
                              title={member.isActive ? "Bloquear Acesso" : "Desbloquear Acesso"}
                              className={`p-2 rounded-lg transition-all cursor-pointer ${
                                member.isActive ? 'text-amber-500/60 hover:text-amber-400 hover:bg-amber-500/10' : 'text-emerald-500/60 hover:text-emerald-400 hover:bg-emerald-500/10'
                              }`}
                            >
                              {member.isActive ? <Ban size={11} /> : <CheckCircle2 size={11} />}
                            </button>
                            <button
                              onClick={() => setResetTarget(member)}
                              title="Resetar Senha"
                              className="p-2 rounded-lg text-amber-500/60 hover:text-amber-400 hover:bg-amber-500/10 transition-all cursor-pointer"
                            >
                              <Key size={11} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(member)}
                              title="Remover Usuário"
                              className="p-2 rounded-lg text-rose-500/60 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Modal: Confirmar Reset de Senha ─── */}
      {resetTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-sm rounded-3xl shadow-2xl p-6 md:p-8 text-center border-amber-500/20 animate-in zoom-in-95 duration-300">
            <div className="w-14 h-14 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
              <Key size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 tracking-tight">Resetar Senha?</h3>
            <p className="text-gray-400 text-xs mb-2 leading-relaxed">
              Uma nova senha aleatória será gerada para:
            </p>
            <p className="text-emerald-400 font-bold text-sm mb-6">{resetTarget.email}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setResetTarget(null)}
                className="flex-1 py-3 bg-gray-800/80 hover:bg-gray-800 text-gray-300 font-semibold rounded-xl text-xs transition-all active:scale-[0.97] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleResetPassword}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-gray-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/10 transition-all active:scale-[0.97] cursor-pointer"
              >
                Confirmar Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal: Resultado do Reset ─── */}
      {resetResult && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-sm rounded-3xl shadow-2xl p-6 md:p-8 text-center border-emerald-500/20 animate-in zoom-in-95 duration-300">
            <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
              <CheckCircle size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 tracking-tight">Senha Resetada!</h3>
            <p className="text-gray-400 text-xs mb-4">Usuário: <strong className="text-white">{resetResult.userEmail}</strong></p>
            
            <div className="bg-slate-950 border border-white/10 rounded-xl p-4 mb-2">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Nova Senha</span>
              <div className="flex items-center justify-center gap-2 mt-2">
                <code className="text-emerald-400 font-mono font-bold text-lg tracking-wider">{resetResult.newPassword}</code>
                <button
                  onClick={() => copyToClipboard(resetResult.newPassword)}
                  title="Copiar"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>

            {resetResult.emailSent ? (
              <p className="text-[10px] text-emerald-400 font-medium mb-4">
                ✅ Email enviado com a nova senha.
              </p>
            ) : (
              <p className="text-[10px] text-amber-400 font-medium mb-4">
                ⚠️ SMTP não configurado — copie e envie a senha manualmente.
              </p>
            )}

            <button
              onClick={() => setResetResult(null)}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold rounded-xl text-xs transition-all active:scale-[0.97] cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* ─── Modal: Confirmar Exclusão ─── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-sm rounded-3xl shadow-2xl p-6 md:p-8 text-center border-rose-500/20 animate-in zoom-in-95 duration-300">
            <div className="w-14 h-14 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 tracking-tight">Remover Usuário?</h3>
            <p className="text-gray-400 text-xs mb-1 leading-relaxed">
              Todas as despesas deste usuário serão removidas permanentemente:
            </p>
            <p className="text-rose-400 font-bold text-sm mb-1">{deleteTarget.email}</p>
            <p className="text-[10px] text-slate-600 mb-6">{deleteTarget.expenseCount} despesa(s) serão excluídas</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-3 bg-gray-800/80 hover:bg-gray-800 text-gray-300 font-semibold rounded-xl text-xs transition-all active:scale-[0.97] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-rose-500/10 transition-all active:scale-[0.97] disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? <RefreshCw size={14} className="animate-spin mx-auto" /> : 'Sim, Remover'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
