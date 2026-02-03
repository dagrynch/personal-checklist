import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const colors = ['#10b981', '#34d399', '#6ee7b7', '#059669', '#047857', '#ffffff'];

const Confetti = ({ active, onComplete }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (active) {
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.2,
        rotation: Math.random() * 360,
        scale: 0.4 + Math.random() * 0.4,
      }));
      setParticles(newParticles);

      const timer = setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [active, onComplete]);

  return (
    <AnimatePresence>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{
            opacity: 1,
            y: 0,
            x: `${particle.x}%`,
            rotate: 0,
            scale: particle.scale,
          }}
          animate={{
            opacity: 0,
            y: -120,
            x: `${particle.x + (Math.random() - 0.5) * 40}%`,
            rotate: particle.rotation + 540,
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.8,
            delay: particle.delay,
            ease: 'easeOut',
          }}
          className="absolute pointer-events-none"
          style={{
            left: 0,
            bottom: '50%',
            width: 8,
            height: 8,
            backgroundColor: particle.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            boxShadow: `0 0 6px ${particle.color}`,
          }}
        />
      ))}
    </AnimatePresence>
  );
};

export default Confetti;
