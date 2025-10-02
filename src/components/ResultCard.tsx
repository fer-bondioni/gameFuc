import { Character } from '@/types/game';
import { Button, Card } from '@/components/ui';
import { motion } from 'framer-motion';
import { gameActions } from '@/store/gameStore';

interface ResultCardProps {
  character: Character;
  userName: string;
}

export function ResultCard({ character, userName }: ResultCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto"
    >
      <Card>
        <h2 className="text-3xl font-bold text-center mb-4">
          {userName}, you are...
        </h2>
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <h3 className="text-4xl font-bold text-blue-600 mb-4">
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
            <Button onClick={gameActions.resetGame} variant="secondary">
              Play Again
            </Button>
            <Button onClick={() => window.location.href = '/stats'}>
              View Stats
            </Button>
          </div>
        </motion.div>
      </Card>
    </motion.div>
  );
}