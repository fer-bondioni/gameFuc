import { Character } from '@/types/game';
import { Button, Card } from '@/components/ui';
import { motion } from 'framer-motion';
import { gameActions } from '@/store/gameStore';
import { useRouter, useSearchParams } from 'next/navigation';

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
      className="max-w-2xl mx-auto"
    >
      <Card>
        <h2 className="text-3xl font-bold text-center mb-4 text-slate-800 dark:text-slate-100">
          {userName}, you are...
        </h2>
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <h3 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
            {character.name}
          </h3>
          {character.image_url && (
            <img
              src={character.image_url}
              alt={character.name}
              className="w-48 h-48 object-cover mx-auto rounded-full mb-4"
            />
          )}
          <p className="text-lg mb-6">{character.description}</p>
          <div className="flex justify-center gap-4">
            <Button onClick={handlePlayAgain} variant="secondary">
              Play Again
            </Button>
            <Button onClick={navigateToStats}>
              View Stats
            </Button>
          </div>
        </motion.div>
      </Card>
    </motion.div>
  );
}