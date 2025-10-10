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
  const [resetting, setResetting] = useState(false);
  const [adminToken, setAdminToken] = useState<string>("");
  const [showAdminInput, setShowAdminInput] = useState(false);
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
          event: '*',
          schema: 'public',
          table: 'user_responses'
        },
        (payload) => {
          console.log('Received database change event:', payload);
          // Add a small delay to ensure database consistency
          setTimeout(() => {
            loadStats();
          }, 500);
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    // Refresh stats periodically as a fallback
    const intervalId = setInterval(() => {
      loadStats();
    }, 10000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(intervalId);
    };
  }, []);

  const validateAdminToken = (token: string) => {
    // Check if the token is a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(token)) {
      throw new Error('Invalid token format. Please enter a valid UUID.');
    }
    
    // Debug token comparison
    console.log('Entered token:', token);
    console.log('Expected token:', process.env.NEXT_PUBLIC_ADMIN_TOKEN);
    
    // Try parsing both as UUIDs to normalize the format
    try {
      const normalizedInput = token.toLowerCase();
      const normalizedExpected = process.env.NEXT_PUBLIC_ADMIN_TOKEN?.toLowerCase() || '';
      
      console.log('Normalized input:', normalizedInput);
      console.log('Normalized expected:', normalizedExpected);
      
      return normalizedInput === normalizedExpected;
    } catch (error) {
      console.error('Token comparison error:', error);
      return false;
    }
  };

  async function resetStats() {
    try {
      setResetting(true);
      
      try {
        if (!validateAdminToken(adminToken)) {
          throw new Error('Invalid admin token');
        }
      } catch (validationError) {
        const message = validationError instanceof Error ? validationError.message : 'Invalid token';
        throw new Error(message);
      }
      
      // Configure the admin token in the database session
      const { error: rpcError } = await supabase.rpc('set_admin_token', { 
        p_admin_token: adminToken 
      });

      if (rpcError) {
        console.error('Error setting admin token:', rpcError);
        throw new Error('Failed to authenticate reset operation');
      }
      
      // Try to fetch existing responses first
      const { data: responses, error: fetchError } = await supabase
        .from('user_responses')
        .select('id')
        .order('id', { ascending: true });
      
      if (fetchError) {
        console.error('Error fetching responses:', fetchError);
        throw new Error(`Database error: ${fetchError.message || 'Unknown error'}`);
      }

      if (!responses || responses.length === 0) {
        console.log('No responses to delete');
        return;
      }

      // Delete responses in smaller batches to avoid timeout
      const batchSize = 100;
      const batches = Math.ceil(responses.length / batchSize);

      for (let i = 0; i < batches; i++) {
        const batchIds = responses
          .slice(i * batchSize, (i + 1) * batchSize)
          .map(r => r.id);

        const { error: deleteError } = await supabase
          .from('user_responses')
          .delete()
          .in('id', batchIds);

        if (deleteError) {
          console.error(`Error deleting batch ${i + 1}:`, deleteError);
          throw new Error(`Failed to delete records: ${deleteError.message || 'Unknown error'}`);
        }
      }

      console.log('Successfully reset all stats');
      setShowAdminInput(false);
      setAdminToken("");
      await loadStats(); // Reload the stats after reset
    } catch (error) {
      console.error('Error resetting stats:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred';
      alert(`Reset failed: ${errorMessage}`);
    } finally {
      setResetting(false);
    }
  }

  async function loadStats() {
    console.log('Loading stats...');
    try {
      const { data, error } = await supabase
        .from('characters')
        .select(`
          *,
          count: user_responses(count)
        `)
        .order('name');

      if (error) {
        console.error('Error loading stats:', error);
        return;
      }

      if (data) {
        console.log('Received stats data:', data);
        const characterStats = data.map(char => ({
          ...char,
          count: char.count[0]?.count || 0
        }));
        console.log('Processed stats:', characterStats);
        
        // Only update state if data has actually changed
        setStats(prev => {
          const hasChanged = JSON.stringify(prev) !== JSON.stringify(characterStats);
          if (hasChanged) {
            console.log('Stats have changed, updating state');
            return characterStats;
          }
          return prev;
        });
        
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-pink-500" />
      </div>
    );
  }

  return (
    <main className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-6xl font-extrabold text-center mb-12 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent drop-shadow-2xl"
        >
          📊 Resultados del Quiz
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
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12 bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-2xl border-4 border-white/20 max-w-md mx-auto"
        >
          <p className="text-3xl font-extrabold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
            Total de Jugadores
          </p>
          <p className="text-6xl font-black text-gray-900 mt-2">
            {stats.reduce((sum, char) => sum + char.count, 0)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center mt-8"
        >
          {showAdminInput ? (
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <input
                  type="password"
                  value={adminToken}
                  onChange={(e) => setAdminToken(e.target.value)}
                  placeholder="Ingresá el token de admin"
                  disabled={resetting}
                  className={`px-6 py-3 border-4 border-purple-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-pink-500 text-gray-900 font-bold text-lg shadow-xl ${
                    resetting ? 'bg-gray-100' : 'bg-white/90'
                  }`}
                  data-testid="admin-token-input"
                />
                {resetting && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={resetStats}
                  disabled={resetting || !adminToken}
                  className={`${
                    resetting || !adminToken
                      ? 'bg-gray-400 cursor-not-allowed grayscale'
                      : 'bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 shadow-xl hover:shadow-red-500/50'
                  } text-white font-extrabold py-3 px-6 rounded-2xl transition-all duration-300 flex items-center gap-2 transform hover:scale-105`}
                  data-testid="confirm-reset-button"
                >
                  {resetting ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Reiniciando...
                    </>
                  ) : (
                    '✅ Confirmar Reset'
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowAdminInput(false);
                    setAdminToken("");
                  }}
                  className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-extrabold py-3 px-6 rounded-2xl transition-all duration-300 shadow-xl transform hover:scale-105"
                  data-testid="cancel-reset-button"
                >
                  ❌ Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAdminInput(true)}
              className="bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white font-extrabold py-3 px-8 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-red-500/50 transform hover:scale-110"
            >
              🔄 Reiniciar Todas las Estadísticas
            </button>
          )}
        </motion.div>
      </div>
    </main>
  );
}