import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, 
  PiggyBank, 
  Wallet, 
  CreditCard, 
  ShieldCheck, 
  Calendar, 
  FileText, 
  Activity, 
  Sparkles, 
  Percent, 
  Lock, 
  BarChart3, 
  DollarSign, 
  Receipt, 
  Sliders
} from 'lucide-react';

// ─── Animation speed constant ───────────────────────────
const ANIMATION_SPEED = 0.0085;

// ─── Card content (15 finance phrases and emerald themes) 
const CARD_CONTENT = [
  {
    title: 'Organize sua vida financeira com total controle',
    phrase: 'Acompanhe despesas, parcelamentos e economias com relatórios inteligentes e máxima segurança.',
    icon: Wallet,
    gradient: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)', // Emerald Deep
    accentColor: '#34d399',
  },
  {
    title: 'Seu dinheiro organizado de forma simples',
    phrase: 'Controle gastos fixos, acompanhe parcelas e visualize tudo em um só lugar.',
    icon: PiggyBank,
    gradient: 'linear-gradient(135deg, #0f766e 0%, #022c22 100%)', // Teal to Deep Green
    accentColor: '#2dd4bf',
  },
  {
    title: 'Mais controle financeiro para o seu dia a dia',
    phrase: 'Gerencie despesas, planeje objetivos e acompanhe sua evolução com facilidade.',
    icon: TrendingUp,
    gradient: 'linear-gradient(135deg, #047857 0%, #064e3b 100%)', // Forest to Emerald
    accentColor: '#34d399',
  },
  {
    title: 'Tenha suas finanças sempre sob controle',
    phrase: 'Monitore gastos, organize pagamentos e acompanhe relatórios personalizados.',
    icon: CreditCard,
    gradient: 'linear-gradient(135deg, #115e59 0%, #022c22 100%)', // Teal Deep
    accentColor: '#2dd4bf',
  },
  {
    title: 'Planeje hoje, economize amanhã',
    phrase: 'Visualize suas despesas, acompanhe parcelamentos e tome decisões melhores.',
    icon: Calendar,
    gradient: 'linear-gradient(135deg, #14532d 0%, #022c22 100%)', // Dark Green
    accentColor: '#10b981',
  },
  {
    title: 'Controle suas finanças com praticidade',
    phrase: 'Tenha acesso a relatórios completos, gastos organizados e privacidade garantida.',
    icon: FileText,
    gradient: 'linear-gradient(135deg, #065f46 0%, #022c22 100%)', // Medium Emerald/Deep
    accentColor: '#34d399',
  },
  {
    title: 'Tudo que você precisa para organizar seu dinheiro',
    phrase: 'Acompanhe despesas, metas financeiras e parcelamentos de forma inteligente.',
    icon: Activity,
    gradient: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)', // Teal Pure
    accentColor: '#2dd4bf',
  },
  {
    title: 'Organize despesas e alcance seus objetivos',
    phrase: 'Tenha uma visão clara das suas finanças com relatórios completos e seguros.',
    icon: ShieldCheck,
    gradient: 'linear-gradient(135deg, #166534 0%, #14532d 100%)', // Bright Forest Green
    accentColor: '#10b981',
  },
  {
    title: 'Sua central de organização financeira',
    phrase: 'Controle receitas, despesas e pagamentos recorrentes com total tranquilidade.',
    icon: Sparkles,
    gradient: 'linear-gradient(135deg, #0d9488 0%, #0f766e 50%, #022c22 100%)', // Teal Mint
    accentColor: '#2dd4bf',
  },
  {
    title: 'Mais organização, menos preocupação',
    phrase: 'Gerencie seus gastos e visualize suas finanças de forma rápida e segura.',
    icon: Sliders,
    gradient: 'linear-gradient(135deg, #059669 0%, #065f46 100%)', // Emerald Pure
    accentColor: '#34d399',
  },
  {
    title: 'Seus dados protegidos, suas finanças organizadas',
    phrase: 'Controle tudo em um ambiente privado e pensado para simplificar seu dia.',
    icon: Lock,
    gradient: 'linear-gradient(135deg, #115e59 0%, #134e4a 100%)', // Teal deep block
    accentColor: '#2dd4bf',
  },
  {
    title: 'Finanças inteligentes para decisões melhores',
    phrase: 'Monitore gastos, acompanhe metas e mantenha o controle do seu dinheiro.',
    icon: BarChart3,
    gradient: 'linear-gradient(135deg, #0f766e 0%, #022c22 100%)', // Teal/Emerald Black
    accentColor: '#34d399',
  },
  {
    title: 'Controle completo para sua vida financeira',
    phrase: 'Acompanhe despesas fixas, parcelamentos e economias em tempo real.',
    icon: DollarSign,
    gradient: 'linear-gradient(135deg, #14532d 0%, #022c22 100%)', // Dark green deep
    accentColor: '#10b981',
  },
  {
    title: 'Transforme a forma como você cuida do dinheiro',
    phrase: 'Visualize relatórios detalhados e mantenha suas finanças organizadas.',
    icon: Receipt,
    gradient: 'linear-gradient(135deg, #064e3b 0%, #0f766e 100%)', // Emerald to Teal
    accentColor: '#34d399',
  },
  {
    title: 'Privacidade, controle e organização financeira',
    phrase: 'Gerencie tudo em um só lugar com segurança e praticidade.',
    icon: ShieldCheck,
    gradient: 'linear-gradient(135deg, #047857 0%, #022c22 100%)', // Forest to Deep Green
    accentColor: '#34d399',
  },
];

// ─── Card details for back faces ────────────────────────
const CARD_DETAILS = [
  { number: '4232 8908 1121 4892', name: 'ZACHARY MERCER', cvv: '382' },
  { number: '4154 7831 9904 5124', name: 'SOPHIA MARTINEZ', cvv: '109' },
  { number: '5457 4120 7733 9035', name: 'BENJAMIN CARTER', cvv: '764' },
  { number: '4441 5567 1223 2468', name: 'EMILY MORRISON', cvv: '491' },
  { number: '5375 8891 2234 7713', name: 'JACKSON REID', cvv: '255' },
];

// ─── Volumetric 3D thickness layers from designer.md ────
const thicknessLayers = [-1.47, -0.73, 0, 0.73, 1.47];

export const CardCarousel: React.FC = () => {
  const cardCount = CARD_CONTENT.length;
  const cardsRefs = useRef<(HTMLDivElement | null)[]>([]);
  const frameId = useRef<number>(0);
  const progress = useRef<number>(0);
  const mouse = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  const [metrics, setMetrics] = useState({
    cardW: 336,
    cardH: 211,
  });

  // ─── Mouse tracking ───────────────────────────────────
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rx = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      const ry = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
      mouse.current.targetX = Math.max(-1, Math.min(1, rx));
      mouse.current.targetY = Math.max(-1, Math.min(1, ry));
    };

    const handleMouseLeave = () => {
      mouse.current.targetX = 0;
      mouse.current.targetY = 0;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // ─── Responsive card sizing ───────────────────────────
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      let cardW = Math.round(w * 0.16 + 130);
      const heightFactor = Math.min(1.0, Math.max(0.65, h / 850));
      cardW = Math.round(cardW * heightFactor);
      cardW = Math.min(336, Math.max(150, cardW));
      const cardH = Math.round(cardW / 1.5925);
      setMetrics({ cardW, cardH });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ─── Animation loop ───────────────────────────────────
  const renderLoop = () => {
    // Increased speed for snappier transitions
    progress.current += ANIMATION_SPEED;

    // Smooth mouse interpolation (inertia damping)
    mouse.current.x += (mouse.current.targetX - mouse.current.x) * 0.08;
    mouse.current.y += (mouse.current.targetY - mouse.current.y) * 0.08;

    const cards = cardsRefs.current;
    const h = window.innerHeight;
    const { cardH } = metrics;

    const continuousProgress = progress.current;
    const roundedIndex = Math.round(continuousProgress);
    const diffFromRound = continuousProgress - roundedIndex;

    // Custom non-linear magnetic step logic
    const easedDiff = Math.sign(diffFromRound) * Math.pow(Math.abs(diffFromRound) * 2, 4.2) / 2;
    const virtualActiveIndex = roundedIndex + easedDiff;

    for (let i = 0; i < cardCount; i++) {
      const card = cards[i];
      if (!card) continue;

      let offset = i - virtualActiveIndex;
      const halfCount = cardCount / 2;
      while (offset > halfCount) offset -= cardCount;
      while (offset < -halfCount) offset += cardCount;

      const absOffset = Math.abs(offset);
      const sign = Math.sign(offset);

      // Hide cards that are far away from the viewport center
      if (absOffset > 3.0) {
        card.style.visibility = 'hidden';
        continue;
      } else {
        card.style.visibility = 'visible';
      }

      const gap = 36;
      const peekAmount = -55;
      const D = 1350;

      let y = 0;
      let z = 0;
      let rot = 0;

      if (absOffset <= 1) {
        const t = absOffset;
        const easedT = t * t * (3 - 2 * t);
        const targetY = cardH + gap;
        y = -sign * (easedT * targetY);
        z = 400 + easedT * (220 - 400);
        rot = easedT * 132;
      } else if (absOffset <= 2) {
        const t = absOffset - 1;
        const easedT = t * t * (3 - 2 * t);
        const yStart = cardH + gap;
        const zStart = 220;
        const rotStart = 132;
        const zEnd = -60;
        const rotEnd = 175;
        const sEnd = D / (D - zEnd);
        const yEnd = (h / 2 - peekAmount) / sEnd - (cardH / 2);
        const currentY = yStart + easedT * (yEnd - yStart);
        y = -sign * currentY;
        z = zStart + easedT * (zEnd - zStart);
        rot = rotStart + easedT * (rotEnd - rotStart);
      } else {
        const t = Math.min(absOffset - 2, 1);
        const easedT = t * t * (3 - 2 * t);
        const zStart = -60;
        const rotStart = 175;
        const zEnd3 = -250;
        const rotEnd3 = 195;
        const sEnd2 = D / (D - zStart);
        const yEnd2 = (h / 2 - peekAmount) / sEnd2 - (cardH / 2);
        const sEnd3 = D / (D - zEnd3);
        const yEnd3 = (h / 2 + 100) / sEnd3 + (cardH / 2);
        const currentY = yEnd2 + easedT * (yEnd3 - yEnd2);
        y = -sign * currentY;
        z = zStart + easedT * (zEnd3 - zStart);
        rot = rotStart + easedT * (rotEnd3 - rotStart);
      }

      const localCardRotation = -sign * rot;
      const centerFactor = Math.max(0, 1 - absOffset);

      const maxTiltY = 15;
      const maxTiltX = 12;

      const activeTiltX = -mouse.current.y * maxTiltX * centerFactor;
      const activeTiltY = mouse.current.x * maxTiltY * centerFactor;

      const totalRotX = localCardRotation + activeTiltX;
      const totalRotY = activeTiltY;

      card.style.zIndex = Math.round(z).toString();
      card.style.opacity = '1';
      card.style.transform = `translateY(${y.toFixed(2)}px) translateZ(${z.toFixed(2)}px) rotateX(${totalRotX.toFixed(2)}deg) rotateY(${totalRotY.toFixed(2)}deg) rotateZ(-3deg)`;
    }
  };

  useEffect(() => {
    const tick = () => {
      renderLoop();
      frameId.current = requestAnimationFrame(tick);
    };
    frameId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId.current);
  }, [metrics]);

  // ─── Render ───────────────────────────────────────────
  return (
    <div
      className="absolute inset-0 flex items-center justify-center overflow-hidden select-none"
      style={{ perspective: '1350px' }}
    >
      {/* Dynamic 3D coordinate viewport */}
      <div
        className="absolute"
        style={{
          width: `${metrics.cardW}px`,
          height: `${metrics.cardH}px`,
          transformStyle: 'preserve-3d',
        }}
      >
        {CARD_CONTENT.map((content, i) => {
          const IconComponent = content.icon;
          return (
            <div
              key={i}
              ref={(el) => { cardsRefs.current[i] = el; }}
              className="absolute inset-0"
              style={{
                width: `${metrics.cardW}px`,
                height: `${metrics.cardH}px`,
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'visible',
              }}
            >
              {/* Build physical 3D volumetric thickness by dense parallel layering */}
              {thicknessLayers.map((zOffset, layerIdx) => {
                const isFrontFace = layerIdx === thicknessLayers.length - 1;
                const isBackFace = layerIdx === 0;

                // Middle structural slices (sides/edges)
                if (!isFrontFace && !isBackFace) {
                  return (
                    <div
                      key={layerIdx}
                      className="absolute inset-0 rounded-[16px] border border-[#27272a]/30 pointer-events-none overflow-hidden"
                      style={{
                        backgroundColor: '#18181b',
                        transform: `translateZ(${zOffset}px)`,
                      }}
                    />
                  );
                }

                // ─── Front face ───
                if (isFrontFace) {
                  return (
                    <div
                      key={layerIdx}
                      className="absolute inset-0 rounded-[16px] border border-white/15 pointer-events-none overflow-hidden"
                      style={{
                        background: content.gradient,
                        transform: `translateZ(${zOffset}px)`,
                        backfaceVisibility: 'hidden',
                        boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.15), 0 10px 30px rgba(0,0,0,0.5)',
                      }}
                    >
                      {/* Glowing ambient light effect inside the card */}
                      <div 
                        className="absolute -right-20 -top-20 w-40 h-40 rounded-full blur-[60px]" 
                        style={{ backgroundColor: content.accentColor, opacity: 0.25 }}
                      />
                      <div 
                        className="absolute -left-20 -bottom-20 w-40 h-40 rounded-full blur-[60px]" 
                        style={{ backgroundColor: content.accentColor, opacity: 0.1 }}
                      />
                      
                      {/* Subtle grid pattern overlay for premium look */}
                      <div 
                        className="absolute inset-0 opacity-[0.03]"
                        style={{
                          backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
                          backgroundSize: '16px 16px',
                        }}
                      />

                      <div className="absolute inset-0 p-4 sm:p-5 text-white h-full w-full font-sans z-10 flex flex-col justify-between">
                        {/* Top Row: Icon + Title */}
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-center gap-2">
                            <div 
                              className="p-1 sm:p-1.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/10 flex-shrink-0"
                              style={{ color: content.accentColor }}
                            >
                              <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
                            </div>
                            <h4 className="text-[11px] sm:text-xs font-bold text-white tracking-tight leading-tight line-clamp-2">
                              {content.title}
                            </h4>
                          </div>
                          
                          {/* HUB FINANCEIRO branding tag */}
                          <div className="flex-shrink-0">
                            <span className="text-[8px] sm:text-[9px] font-bold tracking-widest text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/20">
                              HUB FINANCEIRO
                            </span>
                          </div>
                        </div>

                        {/* Middle Row: Chip + Phrase text */}
                        <div className="flex items-center gap-3 my-2">
                          {/* Golden/Silver Metallic Contact Chip */}
                          <div className="flex-shrink-0">
                            <svg
                              className="w-6 h-6 sm:w-7 sm:h-7"
                              viewBox="0 0 60 60"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M20 8H40V14C40.0016 14.5299 40.2128 15.0377 40.5875 15.4125C40.9623 15.7872 41.4701 15.9984 42 16H59V24H42C41.4701 24.0016 40.9623 24.2128 40.5875 24.5875C40.2128 24.9623 40.0016 25.4701 40 26V52H20V8ZM18 8H8.00039C4.47435 8 1.56576 10.6083 1.08 14H18V8ZM1 16V24V26V34V36V44H18V36H1V34H18V26H1V24H18V16H1ZM1.08 46C1.56576 49.3917 4.47435 52 8.00039 52H18V46H1.08ZM42 14V8H52.0004C55.5264 8 58.4342 10.6084 58.92 14H42ZM59 26H42V34H59V26ZM59 36H42V44H59V36ZM52.0004 52H42V46H58.92C58.4342 49.3916 55.5264 52 52.0004 52Z"
                                fill={`url(#paint0_linear_${i})`}
                              />
                              <defs>
                                <linearGradient
                                  id={`paint0_linear_${i}`}
                                  x1="30" y1="8" x2="30" y2="52"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="white" />
                                  <stop offset="1" stopColor="#a3a3a3" />
                                </linearGradient>
                              </defs>
                            </svg>
                          </div>

                          {/* Phrase content text */}
                          <div className="flex-1">
                            <p className="text-[10px] sm:text-[11px] text-white/90 leading-relaxed font-medium line-clamp-3">
                              "{content.phrase}"
                            </p>
                          </div>
                        </div>

                        {/* Bottom Row: Credit-card styled design details */}
                        <div className="flex justify-between items-end">
                          <div className="text-[7px] sm:text-[8px] font-mono tracking-wider text-white/45 uppercase">
                            Hub Financeiro Platinum
                          </div>
                          
                          {/* Double intersecting circle Brand Logo - bottom right */}
                          <div className="flex -space-x-3 items-center opacity-80">
                            <div className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full bg-white/10 backdrop-blur-[1px] border border-white/10" />
                            <div className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full bg-white/25 backdrop-blur-[1px] border border-white/10" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                // ─── Back face ───
                if (isBackFace) {
                  const details = CARD_DETAILS[i % CARD_DETAILS.length];
                  return (
                    <div
                      key={layerIdx}
                      className="absolute inset-0 rounded-[16px] border border-white/15 pointer-events-none overflow-hidden"
                      style={{
                        background: content.gradient,
                        transform: `translateZ(${zOffset}px) rotateX(180deg)`,
                        backfaceVisibility: 'hidden',
                        boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1)',
                      }}
                    >
                      {/* Magnetic strip */}
                      <div
                        className="w-full mt-5 sm:mt-6"
                        style={{ height: '22%', backgroundColor: '#111827' }}
                      />

                      {/* Signature + CVV stripe */}
                      <div className="px-4 sm:px-5 mt-3 sm:mt-4">
                        <div className="flex items-stretch gap-0 h-7 sm:h-8 w-full rounded-[4px] overflow-hidden">
                          <div className="flex-1 bg-[#e8e0d4] flex items-center px-2 sm:px-3">
                            <span
                              className="text-[#333] text-[9px] sm:text-[10px] italic opacity-70 truncate"
                              style={{ fontFamily: 'cursive' }}
                            >
                              {details.name}
                            </span>
                          </div>
                          <div className="w-12 sm:w-14 bg-white flex items-center justify-center">
                            <span className="text-black text-[10px] sm:text-xs font-mono font-bold tracking-wider">
                              {details.cvv}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card number */}
                      <div className="px-4 sm:px-5 mt-3 sm:mt-4 flex items-center justify-between">
                        <span className="text-white/30 text-[8px] sm:text-[9px] font-mono tracking-[0.15em]">
                          {details.number}
                        </span>
                      </div>
                    </div>
                  );
                }

                return null;
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
