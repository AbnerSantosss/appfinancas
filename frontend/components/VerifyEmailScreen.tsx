import React, { useEffect, useState } from 'react';
import { authApi } from '../services/api';
import { CheckCircle2, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import { AnimatedBackground } from './AnimatedBackground';

export const VerifyEmailScreen: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Token de verificação ausente ou inválido.');
        return;
      }

      try {
        const res = await authApi.verifyEmail(token);
        setStatus('success');
        setMessage(res.message);
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || 'Ocorreu um erro ao verificar seu e-mail.');
      }
    };

    verifyToken();
  }, []);

  const goToLogin = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col justify-center items-center p-6 relative overflow-hidden">
      <AnimatedBackground />

      {/* Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#34d399]/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 bg-[#34d399]/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 flex flex-col items-center">
          <img src="/logo_hub.png" alt="HUB FINANCEIRO" className="h-14 w-auto object-contain mb-2" />
        </div>

        <div className="glass-panel p-8 rounded-3xl shadow-2xl text-center border-white/5 relative overflow-hidden group">
          {/* subtle border top highlight */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#34d399]/50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

          {status === 'loading' && (
            <div className="flex flex-col items-center">
              <Loader2 className="w-12 h-12 text-[#34d399] animate-spin mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Verificando e-mail...</h2>
              <p className="text-sm text-gray-400">Aguarde um momento enquanto validamos seu token.</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
              <div className="w-16 h-16 bg-[#34d399]/10 rounded-full flex items-center justify-center mb-6 border border-[#34d399]/20 shadow-[0_0_30px_rgba(52,211,153,0.15)]">
                <CheckCircle2 className="w-8 h-8 text-[#34d399]" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">E-mail Confirmado!</h2>
              <p className="text-sm text-gray-400 mb-8 leading-relaxed">
                {message || 'Sua conta foi ativada com sucesso. Você já pode acessar a plataforma.'}
              </p>
              
              <button
                onClick={goToLogin}
                className="w-full bg-[#34d399] hover:bg-[#34d399]/90 text-gray-950 py-3.5 rounded-xl font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-[#34d399]/10"
              >
                <ArrowRight size={16} />
                ACESSAR CONTA
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
              <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mb-6 border border-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.15)]">
                <AlertTriangle className="w-8 h-8 text-rose-500" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Ops, algo deu errado!</h2>
              <p className="text-sm text-rose-400/80 mb-8 leading-relaxed px-4">
                {message}
              </p>
              
              <button
                onClick={goToLogin}
                className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3.5 rounded-xl font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] border border-white/5"
              >
                <ArrowRight size={16} />
                VOLTAR AO LOGIN
              </button>
            </div>
          )}
        </div>

        <p className="text-center mt-8 text-[10px] text-gray-500 font-bold uppercase tracking-[0.25em]">
          HUB FINANCEIRO • SELF-HOSTED
        </p>
      </div>
    </div>
  );
};
