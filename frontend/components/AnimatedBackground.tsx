import React from 'react';
import { motion } from 'framer-motion';

export const AnimatedBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-[#0A111F]">
      {/* Imagem de Fundo Animada */}
      <motion.div
        className="absolute inset-0 w-[120%] h-[120%] -top-[10%] -left-[10%]"
        style={{
          backgroundImage: "url('/animated_bg.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.6,
        }}
        animate={{
          scale: [1, 1.15, 1],
          x: [0, -30, 20, 0],
          y: [0, 20, -30, 0],
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Grid Tech Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: 'radial-gradient(circle at center, transparent 0%, #0A111F 80%), linear-gradient(rgba(0, 255, 187, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 187, 0.1) 1px, transparent 1px)',
          backgroundSize: '100% 100%, 40px 40px, 40px 40px',
          backgroundPosition: 'center, center, center',
        }}
      />

      {/* Overlay Escuro / Gradiente para Leitura */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A111F]/80 via-[#0A111F]/60 to-[#0A111F]/95" />

      {/* Partículas de Luz Flutuantes (Framer Motion) */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-[#00FFBB]"
          style={{
            width: Math.random() * 4 + 2 + 'px',
            height: Math.random() * 4 + 2 + 'px',
            top: Math.random() * 100 + '%',
            left: Math.random() * 100 + '%',
            opacity: Math.random() * 0.5 + 0.2,
            boxShadow: '0 0 10px 2px rgba(0, 255, 187, 0.4)'
          }}
          animate={{
            y: [0, -150],
            x: [0, (Math.random() - 0.5) * 100],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 15,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 10,
          }}
        />
      ))}
    </div>
  );
};
