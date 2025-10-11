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
      className="max-w-2xl mx-auto w-full"
    >
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center mb-3 sm:mb-4 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent px-2">
              ¡Bienvenido!
            </h2>
            <p className="text-center text-lg sm:text-xl text-gray-700 font-semibold px-2">
              Descubrí quién sos en la FUC 🎓
            </p>
          </motion.div>
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Input
              value={name}
              onChange={setName}
              placeholder="Ingresá tu nombre"
              required
            />
          </motion.div>
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Button fullWidth>🚀 Comenzar Quiz</Button>
          </motion.div>
        </form>
      </Card>
    </motion.div>
  );
}
