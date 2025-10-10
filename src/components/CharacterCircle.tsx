import { motion } from 'framer-motion';
import { Character } from '@/types/game';
import { useEffect, useState } from 'react';

interface CharacterCircleProps {
  character: Character;
  count: number;
  maxCount: number;
}

const MIN_SIZE = 120; // Tamaño mínimo aumentado para mejor visibilidad
const MAX_SIZE = 200;

export function CharacterCircle({ character, count, maxCount }: CharacterCircleProps) {
  const [animatedCount, setAnimatedCount] = useState(0);
  const [animatedSize, setAnimatedSize] = useState(MIN_SIZE);

  useEffect(() => {
    // Animate the count up from previous value
    setAnimatedCount(count);
    // Calculate and animate the new size - si count es 0, usar MIN_SIZE
    const newSize = count === 0 
      ? MIN_SIZE 
      : Math.max(MIN_SIZE, (count / Math.max(maxCount, 1)) * MAX_SIZE);
    setAnimatedSize(newSize);
  }, [count, maxCount]);
  
  const colorGradients = [
    'from-pink-500 via-red-500 to-yellow-500',
    'from-green-400 via-cyan-500 to-blue-500',
    'from-purple-500 via-pink-500 to-red-500',
    'from-yellow-400 via-orange-500 to-red-500',
  ];

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", duration: 0.8 }}
      className="flex flex-col items-center gap-4"
    >
      <motion.div
        layout
        animate={{
          width: animatedSize,
          height: animatedSize,
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20
        }}
        className="rounded-full flex items-center justify-center text-white font-black relative overflow-hidden shadow-2xl ring-4 ring-white/30"
        style={{
          backgroundImage: character.image_url ? `url(${character.image_url})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay más claro para que las imágenes se vean mejor */}
        <div className="absolute inset-0 bg-black bg-opacity-30" />
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative z-10"
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            key={animatedCount}
            className="text-3xl md:text-4xl drop-shadow-2xl"
            style={{
              textShadow: '0 0 20px rgba(0,0,0,0.8), 0 4px 8px rgba(0,0,0,0.6)'
            }}
          >
            {animatedCount}
          </motion.span>
        </motion.div>
        {!character.image_url && (
          <motion.div
            className={`absolute inset-0 bg-gradient-to-br ${colorGradients[character.name.length % colorGradients.length]}`}
          />
        )}
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center bg-white/90 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-lg"
      >
        <h3 className="font-extrabold text-lg text-gray-900">{character.name}</h3>
        <motion.p 
          className="text-base font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent"
          key={animatedCount}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {animatedCount} {animatedCount === 1 ? 'jugador' : 'jugadores'}
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
