import { Character } from '@/types/game';
import { Button, Card } from '@/components/ui';
import { motion } from 'framer-motion';
import { gameActions } from '@/store/gameStore';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

interface ResultCardProps {
  character: Character;
  userName: string;
}

export function ResultCard({ character, userName }: ResultCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const navigateToStats = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', 'stats');
    router.push(`/?${params.toString()}`);
  };

  const handlePlayAgain = () => {
    gameActions.resetGame();
    const params = new URLSearchParams(searchParams.toString());
    params.delete('tab'); // Remove the tab parameter to return to game view
    router.push(`/?${params.toString()}`);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-3xl mx-auto w-full"
    >
      <Card className="relative overflow-hidden">
        {/* Confetti effect */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: -50, opacity: 1 }}
              animate={{ 
                y: 600, 
                rotate: Math.random() * 360,
                opacity: 0 
              }}
              transition={{ 
                duration: 2 + Math.random() * 2,
                delay: Math.random() * 0.5,
                repeat: Infinity,
                repeatDelay: 3
              }}
              className="absolute text-3xl"
              style={{ 
                left: `${Math.random() * 100}%`,
              }}
            >
              {['🎉', '🎊', '⭐', '✨', '🌟'][Math.floor(Math.random() * 5)]}
            </motion.div>
          ))}
        </div>

        <motion.h2 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center mb-4 sm:mb-6 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent px-2"
        >
          ¡{userName}, sos...
        </motion.h2>
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center relative z-10"
        >
          <motion.h3 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.3, duration: 0.8 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-4 sm:mb-6 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent drop-shadow-2xl px-2"
          >
            {character.name}!
          </motion.h3>
          {character.image_url && (
            <motion.div 
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", delay: 0.5, duration: 1 }}
              className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 mx-auto mb-4 sm:mb-6 rounded-full ring-4 sm:ring-6 md:ring-8 ring-pink-500 shadow-2xl shadow-pink-500/50"
            >
              <Image
                src={character.image_url}
                alt={character.name}
                fill
                className="object-cover rounded-full"
              />
            </motion.div>
          )}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 text-gray-700 font-semibold px-2 sm:px-4"
          >
            {character.description}
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-2"
          >
            <Button onClick={handlePlayAgain} variant="secondary">
              🔄 Jugar de Nuevo
            </Button>
            <Button onClick={navigateToStats}>
              📊 Ver Estadísticas
            </Button>
          </motion.div>
        </motion.div>
      </Card>
    </motion.div>
  );
}
