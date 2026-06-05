import React, { useState } from 'react';
import { LayoutDashboard, ReceiptText, PlusCircle, Settings, ShieldCheck, Sliders, LogOut } from 'lucide-react';
import { ProfileModal } from './ProfileModal';

interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user?: AuthUser;
  onLogout?: () => void;
  onUserUpdate?: (user: AuthUser) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, user, onLogout, onUserUpdate }) => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 pb-24 md:pb-0 md:pl-64 selection:bg-emerald-500/20">
      
      {/* ── Sidebar Desktop (Premium Glassmorphic) ─────── */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-gray-900/40 backdrop-blur-2xl border-r border-white/[0.04] p-6 shadow-2xl z-40">
        <div className="mb-10 group cursor-default">
          <div className="flex items-center gap-3 mb-1.5">
            <div className="w-9 h-9 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.35)] group-hover:rotate-12 transition-transform duration-300 border border-emerald-400/20">
              <ShieldCheck className="text-gray-950" size={20} strokeWidth={2.5} />
            </div>
            <h1 className="text-md font-bold text-white tracking-tight leading-tight">
              Sena <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-300">Finance</span>
            </h1>
          </div>
          <p className="text-[9px] text-emerald-400/50 font-bold uppercase tracking-[0.25em] pl-1 animate-pulse-subtle">Gestão Familiar Self-Hosted</p>
        </div>
        
        <nav className="space-y-1.5">
          <NavItem 
            icon={<LayoutDashboard size={18} />} 
            label="Início" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <NavItem 
            icon={<ReceiptText size={18} />} 
            label="Lançamentos" 
            active={activeTab === 'expenses'} 
            onClick={() => setActiveTab('expenses')} 
          />
          <NavItem 
            icon={<Sliders size={18} />} 
            label="Configurações" 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')} 
          />
        </nav>

        {/* User profile & server status */}
        <div className="mt-auto pt-6 border-t border-white/[0.04] space-y-4">
          <div className="p-3.5 bg-white/[0.02] border border-white/[0.04] rounded-2xl">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              <p className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest">Servidor Online</p>
            </div>
            <p className="text-[9px] font-medium text-gray-500 leading-normal">Ambiente seguro hospedado localmente.</p>
          </div>

          {user && (
            <div className="px-2">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold text-white truncate">{user.name || user.email}</p>
                  <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">{user.role}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setIsProfileModalOpen(true)}
                    className="p-2 text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all duration-200 cursor-pointer"
                    title="Editar Perfil"
                  >
                    <Settings size={14} />
                  </button>
                  {onLogout && (
                    <button
                      onClick={onLogout}
                      className="p-2 text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all duration-200 cursor-pointer"
                      title="Sair da Conta"
                    >
                      <LogOut size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ── Mobile Header (Premium Style) ─────────────── */}
      <header className="md:hidden sticky top-0 z-40 bg-gray-950/80 backdrop-blur-xl border-b border-white/[0.04] px-4 py-3 flex items-center justify-between safe-top">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)] border border-emerald-400/20">
            <ShieldCheck className="text-gray-950" size={18} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight leading-none">Sena Finance</h1>
            <p className="text-[9px] text-emerald-400/60 font-bold uppercase tracking-[0.15em] mt-0.5">Self-Hosted</p>
          </div>
        </div>
        {user && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-bold text-white leading-none">{user.name || user.email.split('@')[0]}</p>
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">{user.role}</p>
            </div>
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all duration-200 cursor-pointer"
              title="Editar Perfil"
            >
              <Settings size={15} />
            </button>
            {onLogout && (
              <button
                onClick={onLogout}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all duration-200 cursor-pointer"
                title="Sair"
              >
                <LogOut size={15} />
              </button>
            )}
          </div>
        )}
      </header>

      {/* ── Main Content ─────────────────────────────── */}
      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
        {children}
      </main>

      {/* ── Mobile Bottom Navigation (Floating Dock) ───── */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 bg-gray-900/75 backdrop-blur-2xl border border-white/[0.08] px-3 py-2 rounded-2xl z-50 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
        <div className="flex items-center justify-around max-w-md mx-auto relative">
          <MobileNavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Início"
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          
          {/* FAB Central flutuante */}
          <div className="relative -mt-6">
            <button 
              onClick={() => setActiveTab('expenses')}
              className="bg-gradient-to-tr from-emerald-500 to-teal-400 text-gray-950 w-12 h-12 rounded-xl shadow-[0_4px_20px_rgba(16,185,129,0.35)] active:scale-95 transition-all flex items-center justify-center border border-emerald-400/20 cursor-pointer"
              title="Novo Lançamento"
            >
              <PlusCircle size={24} strokeWidth={2} />
            </button>
          </div>

          <MobileNavItem 
            icon={<ReceiptText size={20} />} 
            label="Lançamentos"
            active={activeTab === 'expenses'} 
            onClick={() => setActiveTab('expenses')} 
          />
          <MobileNavItem 
            icon={<Sliders size={20} />} 
            label="Configurações"
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')} 
          />
        </div>
      </nav>

      {/* ── Profile Edit Modal ───────────────────────── */}
      {user && onUserUpdate && (
        <ProfileModal
          user={user}
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          onUserUpdate={onUserUpdate}
        />
      )}
    </div>
  );
};

/* ── Desktop Sidebar Nav Item ────────────────────────── */
const NavItem = ({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 border cursor-pointer ${
      active 
        ? 'bg-emerald-500/10 border-emerald-500/15 text-emerald-400 shadow-[0_2px_10px_rgba(16,185,129,0.02)] font-semibold' 
        : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/[0.03]'
    }`}
  >
    <div className={`transition-transform duration-200 ${active ? 'scale-110 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'text-gray-400'}`}>
      {icon}
    </div>
    <span className="text-xs tracking-wide">{label}</span>
  </button>
);

/* ── Mobile Bottom Nav Item ──────────────────────────── */
const MobileNavItem = ({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-0.5 min-w-[50px] py-1 px-2.5 rounded-xl transition-all duration-200 active:scale-90 cursor-pointer ${
      active 
        ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]' 
        : 'text-gray-500'
    }`}
  >
    <div className={`transition-transform duration-200 ${active ? 'scale-105' : ''}`}>
      {icon}
    </div>
    <span className={`text-[10px] mt-0.5 font-bold tracking-wide ${active ? 'text-emerald-400' : 'text-gray-500'}`}>
      {label}
    </span>
  </button>
);

export default Layout;
