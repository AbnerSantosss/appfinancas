import React, { useState, useEffect } from 'react';
import { familyApi, FamilyMember } from '../services/api';
import { Users, UserPlus, Trash2, Mail, KeyRound, AlertTriangle, RefreshCw, CheckCircle2, MailWarning } from 'lucide-react';

interface FamilyManagementProps {
  currentUserId: string;
}

const FamilyManagement: React.FC<FamilyManagementProps> = ({ currentUserId }) => {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Formulário de convite
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePassword, setInvitePassword] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const data = await familyApi.listMembers();
      setMembers(data);
    } catch (err: any) {
      setError('Erro ao carregar membros da família.');
    } finally {
      setIsLoading(false);
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
    let newPassword = '';
    for (let i = 0; i < 8; i++) {
      newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setInvitePassword(newPassword);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !invitePassword) return;

    setIsInviting(true);
    setInviteResult(null);

    try {
      await familyApi.inviteMember(inviteEmail, invitePassword, inviteName);
      setInviteResult({ success: true, message: 'Membro adicionado e convite enviado!' });
      setInviteEmail('');
      setInvitePassword('');
      setInviteName('');
      setShowInviteForm(false);
      fetchMembers();
      
      setTimeout(() => setInviteResult(null), 5000);
    } catch (err: any) {
      setInviteResult({ success: false, message: err.message || 'Erro ao convidar.' });
    } finally {
      setIsInviting(false);
    }
  };

  const handleResendVerification = async (userId: string) => {
    try {
      const res = await familyApi.resendVerification(userId);
      setInviteResult({ success: true, message: res.message || 'E-mail de verificação reenviado.' });
      setTimeout(() => setInviteResult(null), 5000);
    } catch (err: any) {
      setInviteResult({ success: false, message: err.message || 'Erro ao reenviar verificação.' });
    }
  };

  return (
    <div className="pt-6 border-t border-white/5 space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Users size={14} className="text-emerald-500" /> Membros da Família
        </label>
        <button
          onClick={() => { setShowInviteForm(!showInviteForm); if (!invitePassword) generatePassword(); }}
          className="text-[9px] font-black text-emerald-500 uppercase tracking-widest hover:text-emerald-400 transition-colors flex items-center gap-1"
        >
          <UserPlus size={12} /> Adicionar
        </button>
      </div>

      {inviteResult && (
        <div className={`p-3 rounded-xl flex items-start gap-2 text-xs font-semibold ${inviteResult.success ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
          {inviteResult.success ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
          {inviteResult.message}
        </div>
      )}

      {showInviteForm && (
        <form onSubmit={handleInvite} className="bg-slate-950/60 border border-emerald-500/20 rounded-xl p-4 space-y-3 animate-in fade-in slide-in-from-top-2">
          <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-3">Novo Membro</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Nome (Opcional)</label>
              <input type="text" value={inviteName} onChange={(e) => setInviteName(e.target.value)} className="w-full bg-slate-900 border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500/50 outline-none" placeholder="Nome" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1"><Mail size={10} /> Email</label>
              <input type="email" required value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="w-full bg-slate-900 border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500/50 outline-none" placeholder="email@exemplo.com" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1 justify-between">
                <span className="flex items-center gap-1"><KeyRound size={10} /> Senha Temporária</span>
                <button type="button" onClick={generatePassword} className="text-emerald-500 hover:text-emerald-400">Gerar Nova</button>
              </label>
              <input type="text" required value={invitePassword} onChange={(e) => setInvitePassword(e.target.value)} className="w-full bg-slate-900 border border-white/5 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-emerald-500/50 outline-none" />
            </div>
          </div>
          
          <div className="pt-2 flex justify-end gap-2">
            <button type="button" onClick={() => setShowInviteForm(false)} className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase hover:text-slate-300">Cancelar</button>
            <button type="submit" disabled={isInviting} className="bg-emerald-500 text-slate-950 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 hover:bg-emerald-400 disabled:opacity-50">
              {isInviting ? <RefreshCw size={12} className="animate-spin" /> : <UserPlus size={12} />} Convidar
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="flex justify-center p-4"><RefreshCw className="animate-spin text-slate-600" size={16} /></div>
      ) : error ? (
        <div className="text-rose-500 text-xs p-3 bg-rose-500/10 rounded-xl">{error}</div>
      ) : (
        <div className="space-y-2">
          {members.map(member => (
            <div key={member.id} className="bg-slate-950/40 border border-white/5 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white flex items-center gap-2">
                  {member.name || member.email}
                  {member.id === currentUserId && <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded uppercase font-bold">Você</span>}
                  {!member.isEmailVerified && (
                    <span className="text-[8px] text-amber-400 font-bold uppercase tracking-widest bg-amber-500/10 px-1.5 py-0.5 rounded flex items-center gap-1" title="E-mail não confirmado">
                      <AlertTriangle size={8} /> Pendente
                    </span>
                  )}
                </p>
                <p className="text-[10px] text-slate-500 font-mono">{member.email}</p>
              </div>
              <div className="flex items-center gap-1">
                {member.id !== currentUserId && !member.isEmailVerified && (
                  <button
                    onClick={() => handleResendVerification(member.id)}
                    title="Reenviar E-mail de Verificação"
                    className="p-2 rounded-lg text-amber-500/60 hover:text-amber-400 hover:bg-amber-500/10 transition-all cursor-pointer"
                  >
                    <MailWarning size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FamilyManagement;
