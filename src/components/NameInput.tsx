import { useState } from 'react';
import { Button, Card, Input } from '@/components/ui';
import { gameActions } from '@/store/gameStore';
import { motion } from 'framer-motion';

export function NameInput() {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      gameActions.setUserName(name.trim());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
            Enter Your Name
          </h2>
          <Input
            value={name}
            onChange={setName}
            placeholder="Your name"
            required
          />
          <Button fullWidth>Start Quiz</Button>
        </form>
      </Card>
    </motion.div>
  );
}