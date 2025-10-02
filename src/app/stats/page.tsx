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
        () => {
          console.log('Received database change event');
          loadStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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
    const { data, error } = await supabase
      .from('characters')
      .select(`
        *,
        count: user_responses(count)
      `);

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
                  placeholder="Enter admin token"
                  disabled={resetting}
                  className={`px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    resetting ? 'bg-gray-100' : ''
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
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-red-500 hover:bg-red-600'
                  } text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2`}
                  data-testid="confirm-reset-button"
                >
                  {resetting ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Resetting...
                    </>
                  ) : (
                    'Confirm Reset'
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowAdminInput(false);
                    setAdminToken("");
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                  data-testid="cancel-reset-button"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAdminInput(true)}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Reset All Stats
            </button>
          )}
        </motion.div>
      </div>
    </main>
  );
}