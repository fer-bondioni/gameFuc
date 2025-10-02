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
  const size = Math.max(MIN_SIZE, (count / maxCount) * MAX_SIZE);
  
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="flex flex-col items-center gap-2"
    >
      <motion.div
        layout
        animate={{
          width: size,
          height: size,
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
          {count}
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
        <p className="text-sm text-gray-600">{count} players</p>
      </motion.div>
    </motion.div>
  );
}