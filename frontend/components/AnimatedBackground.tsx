import React from 'react';
import { motion } from 'framer-motion';

export const AnimatedBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Blob 1 */}
      <motion.div
        className="absolute w-[350px] h-[350px] md:w-[500px] md:h-[500px] rounded-full bg-[#00FFBB]/8 blur-[100px] md:blur-[130px]"
        animate={{
          x: [0, 80, -50, 0],
          y: [0, -100, 60, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ top: '5%', left: '5%' }}
      />
      
      {/* Blob 2 */}
      <motion.div
        className="absolute w-[400px] h-[400px] md:w-[600px] md:h-[600px] rounded-full bg-cyan-500/4 blur-[110px] md:blur-[140px]"
        animate={{
          x: [0, -120, 70, 0],
          y: [0, 90, -110, 0],
          scale: [1, 0.95, 1.15, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ bottom: '10%', right: '5%' }}
      />

      {/* Blob 3 */}
      <motion.div
        className="absolute w-[300px] h-[300px] md:w-[450px] md:h-[450px] rounded-full bg-emerald-500/4 blur-[90px] md:blur-[120px]"
        animate={{
          x: [0, 60, -70, 0],
          y: [0, 110, 50, 0],
          scale: [1, 1.15, 0.9, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ top: '40%', left: '50%', transform: 'translate(-50%, -50%)' }}
      />
    </div>
  );
};
