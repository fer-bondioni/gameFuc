import { motion } from 'framer-motion';
import { Character } from '@/types/game';
import { useEffect, useState } from 'react';

interface CharacterCircleProps {
  character: Character;
  count: number;
  maxCount: number;
}

const MIN_SIZE = 60;
const MAX_SIZE = 200;

export function CharacterCircle({ character, count, maxCount }: CharacterCircleProps) {
  const [animatedCount, setAnimatedCount] = useState(0);
  const [animatedSize, setAnimatedSize] = useState(MIN_SIZE);

  useEffect(() => {
    // Animate the count up from previous value
    setAnimatedCount(count);
    // Calculate and animate the new size
    const newSize = Math.max(MIN_SIZE, (count / Math.max(maxCount, 1)) * MAX_SIZE);
    setAnimatedSize(newSize);
  }, [count, maxCount]);
  
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="flex flex-col items-center gap-2"
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
        className="rounded-full bg-blue-500 flex items-center justify-center text-white font-bold relative overflow-hidden"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            key={animatedCount}
          >
            {animatedCount}
          </motion.span>
        </motion.div>
        <motion.div
          className="absolute inset-0 bg-white opacity-20"
          animate={{
            rotate: 360
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            borderRadius: '40%',
            width: '150%',
            height: '150%',
            marginLeft: '-25%',
            marginTop: '-25%'
          }}
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <h3 className="font-bold">{character.name}</h3>
        <motion.p 
          className="text-sm text-gray-600"
          key={animatedCount}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {animatedCount} players
        </motion.p>
      </motion.div>
    </motion.div>
  );
}