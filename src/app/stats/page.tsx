'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Character } from '@/types/game';
import { CharacterCircle } from '@/components/CharacterCircle';
import { motion } from 'framer-motion';

interface CharacterStats extends Character {
  count: number;
}

export default function StatsPage() {
  const [stats, setStats] = useState<CharacterStats[]>([]);
  const [loading, setLoading] = useState(true);
  const maxCount = Math.max(...stats.map(s => s.count), 1);

  useEffect(() => {
    // Initial load
    loadStats();

    // Set up real-time subscription
    const channel = supabase
      .channel('user_responses_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_responses'
        },
        () => {
          loadStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function loadStats() {
    const { data } = await supabase
      .from('characters')
      .select(`
        *,
        user_responses (count)
      `);

    if (data) {
      const characterStats = data.map(char => ({
        ...char,
        count: char.user_responses?.length || 0
      }));
      setStats(characterStats);
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <main className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-center mb-12"
        >
          Personality Quiz Results
        </motion.h1>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {stats.map((character) => (
            <CharacterCircle
              key={character.id}
              character={character}
              count={character.count}
              maxCount={maxCount}
            />
          ))}
        </motion.div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12 text-gray-600"
        >
          Total Players: {stats.reduce((sum, char) => sum + char.count, 0)}
        </motion.p>
      </div>
    </main>
  );
}