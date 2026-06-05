import React, { useState } from 'react';
import { X, User, Pencil, Lock, KeyRound, Eye, EyeOff, Save, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { authApi, AuthUser } from '../services/api';

interface ProfileModalProps {
  user: AuthUser;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdate: (user: AuthUser) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ user, isOpen, onClose, onUserUpdate }) => {
  // Profile editing
  const [editName, setEditName] = useState(user.name || '');
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);
  const [nameError, setNameError] = useState('');

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [isChangingPw, setIsChangingPw] = useState(false);
  const [pwResult, setPwResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingName(true);
    setNameSuccess(false);
    setNameError('');
    try {
      const updated = await authApi.updateProfile(editName);
      onUserUpdate(updated);
      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 3000);
    } catch (err: any) {
      setNameError(err.message || 'Falha ao atualizar nome.');
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-md rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300 border border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-slate-900/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-500/20">
              <User size={20} />
            </div>
            <div>
              <h3 className="text-md font-bold text-white tracking-tight">Editar Perfil</h3>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-gray-300 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {/* Nome Section */}
          <form onSubmit={handleSaveName} className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Pencil size={12} className="text-emerald-500" /> Nome de Exibição
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Seu nome"
                required
                className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white font-semibold focus:border-emerald-500/50 outline-none transition-all placeholder:text-slate-600"
              />
              <button
                type="submit"
                disabled={isSavingName}
                className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer border border-emerald-500/10 min-w-[90px]"
              >
                {isSavingName ? <RefreshCw size={10} className="animate-spin" /> : nameSuccess ? <CheckCircle2 size={10} /> : <Save size={10} />}
                {nameSuccess ? 'Salvo!' : 'Salvar'}
              </button>
            </div>
            {nameError && (
              <p className="text-[10px] text-rose-400 font-semibold flex items-center gap-1">
                <AlertTriangle size={10} /> {nameError}
              </p>
            )}
          </form>

          {/* Senha Section */}
          <div className="pt-6 border-t border-white/5 space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Lock size={12} className="text-amber-500" /> Alterar Senha de Acesso
            </label>
            <form onSubmit={handleChangePassword} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Senha Atual</label>
                <div className="relative">
                  <input
                    type={showCurrentPw ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white font-semibold focus:border-emerald-500/50 outline-none transition-all pr-10 placeholder:text-slate-600"
                    placeholder="Sua senha atual"
                  />
                  <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                    {showCurrentPw ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Nova Senha</label>
                <div className="relative">
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white font-semibold focus:border-emerald-500/50 outline-none transition-all pr-10 placeholder:text-slate-600"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                    {showNewPw ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Confirmar Nova Senha</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white font-semibold focus:border-emerald-500/50 outline-none transition-all placeholder:text-slate-600"
                  placeholder="Repita a nova senha"
                />
              </div>

              {pwResult && (
                <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold border ${
                  pwResult.success ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}>
                  {pwResult.success ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                  <span className="leading-tight">{pwResult.message}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isChangingPw}
                className="w-full bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-50 cursor-pointer border border-amber-500/10 mt-2"
              >
                {isChangingPw ? <RefreshCw size={12} className="animate-spin" /> : <KeyRound size={12} />}
                Alterar Senha
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
