
import React from 'react';
import { LayoutDashboard, ReceiptText, PlusCircle, Settings, ShieldCheck, Sliders, LogOut } from 'lucide-react';

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
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, user, onLogout }) => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 pb-28 md:pb-0 md:pl-64 selection:bg-emerald-500/30">
      {/* ── Sidebar Desktop ──────────────────────────── */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-slate-900/40 backdrop-blur-3xl border-r border-white/5 p-6 shadow-2xl z-40">
        <div className="mb-10 group cursor-default">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)] group-hover:rotate-12 transition-transform">
              <ShieldCheck className="text-slate-950" size={18} strokeWidth={3} />
            </div>
            <h1 className="text-lg font-black text-white tracking-tighter">Sena Family Finance</h1>
          </div>
          <p className="text-[9px] text-emerald-500/50 font-black uppercase tracking-[0.2em] pl-1">Gestão Inteligente</p>
        </div>
        
        <nav className="space-y-2">
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
            label="Opções" 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')} 
          />
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5 space-y-3">
           <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
             <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Servidor Próprio</p>
             <p className="text-[9px] font-bold text-slate-500 leading-relaxed italic">Self-Hosted API Ativo.</p>
           </div>

           {user && (
             <div className="px-2">
               <div className="flex items-center justify-between">
                 <div className="min-w-0">
                   <p className="text-[10px] font-black text-white truncate">{user.name || user.email}</p>
                   <p className="text-[7px] font-bold text-slate-600 uppercase tracking-widest">{user.role}</p>
                 </div>
                 {onLogout && (
                   <button
                     onClick={onLogout}
                     className="p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                     title="Sair"
                   >
                     <LogOut size={14} />
                   </button>
                 )}
               </div>
             </div>
           )}
        </div>
      </aside>

      {/* ── Mobile Header (Topo) ─────────────────────── */}
      <header className="md:hidden sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center justify-between safe-top">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.3)]">
            <ShieldCheck className="text-slate-950" size={14} strokeWidth={3} />
          </div>
          <div>
            <h1 className="text-sm font-black text-white tracking-tighter leading-tight">Sena Finance</h1>
            <p className="text-[7px] text-emerald-500/50 font-black uppercase tracking-[0.15em]">Self-Hosted</p>
          </div>
        </div>
        {user && (
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-[9px] font-black text-white leading-tight">{user.name || user.email.split('@')[0]}</p>
              <p className="text-[6px] font-bold text-slate-600 uppercase tracking-widest">{user.role}</p>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all active:scale-90"
                title="Sair"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        )}
      </header>

      {/* ── Main Content ─────────────────────────────── */}
      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
        {children}
      </main>

      {/* ── Mobile Bottom Navigation ─────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-2xl border-t border-white/10 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] z-50 shadow-[0_-4px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <MobileNavItem 
            icon={<LayoutDashboard size={22} />} 
            label="Início"
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <MobileNavItem 
            icon={<ReceiptText size={22} />} 
            label="Faturas"
            active={activeTab === 'expenses'} 
            onClick={() => setActiveTab('expenses')} 
          />
          {/* FAB central */}
          <button 
            onClick={() => setActiveTab('expenses')}
            className="bg-emerald-500 text-slate-950 w-14 h-14 rounded-2xl -mt-7 shadow-[0_4px_20px_rgba(16,185,129,0.4)] active:scale-90 transition-all border-4 border-slate-950 flex items-center justify-center"
          >
            <PlusCircle size={26} strokeWidth={2.5} />
          </button>
          <MobileNavItem 
            icon={<Sliders size={22} />} 
            label="Opções"
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')} 
          />
        </div>
      </nav>
    </div>
  );
};

/* ── Desktop Sidebar Nav Item ────────────────────────── */
const NavItem = ({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all border ${
      active 
        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.05)]' 
        : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'
    }`}
  >
    <div className={`${active ? 'drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]' : ''}`}>
      {icon}
    </div>
    <span className="font-bold uppercase tracking-widest text-[10px]">{label}</span>
  </button>
);

/* ── Mobile Bottom Nav Item ──────────────────────────── */
const MobileNavItem = ({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl transition-all duration-300 active:scale-90 ${
      active 
        ? 'text-emerald-400 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]' 
        : 'text-slate-600'
    }`}
  >
    {icon}
    <span className={`text-[8px] font-black uppercase tracking-wider ${active ? 'text-emerald-400' : 'text-slate-700'}`}>
      {label}
    </span>
  </button>
);

export default Layout;
