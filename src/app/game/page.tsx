'use client';

import { useEffect, useState } from 'react';
import { useGameStore, gameActions } from '@/store/gameStore';
import { NameInput } from '@/components/NameInput';
import { QuestionCard } from '@/components/QuestionCard';
import { ResultCard } from '@/components/ResultCard';
import { Question, Answer, Character } from '@/types/game';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

// Debug function
const debugSupabase = async () => {
  try {
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .order('order_number');
    
    console.log('Questions:', questions);
    console.log('Questions Error:', questionsError);
    
    return { questions, questionsError };
  } catch (error) {
    console.error('Supabase Debug Error:', error);
    return { error };
  }
};

export default function GamePage() {
  const { currentStep, userName, currentQuestionIndex, answers, resultCharacter } = useGameStore();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answersByQuestion, setAnswersByQuestion] = useState<Record<string, Answer[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGameData() {
      console.log('Starting to load game data...');
      
      // Debug Supabase connection
      const debug = await debugSupabase();
      console.log('Debug results:', debug);

      // Load questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .order('order_number');
      
      if (questionsError) {
        console.error('Questions Error:', questionsError);
        setLoading(false);
        return;
      }
      
      if (questionsData) {
        setQuestions(questionsData);
        
        // Load answers for all questions
        const { data: answersData } = await supabase
          .from('answers')
          .select('*')
          .in('question_id', questionsData.map(q => q.id));
        
        if (answersData) {
          const answersMap: Record<string, Answer[]> = {};
          answersData.forEach((answer) => {
            if (!answersMap[answer.question_id]) {
              answersMap[answer.question_id] = [];
            }
            answersMap[answer.question_id].push(answer);
          });
          setAnswersByQuestion(answersMap);
        }
      }
      
      setLoading(false);
    }
    
    loadGameData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <main className="min-h-screen p-4 bg-gray-50">
      <AnimatePresence mode="wait">
        {currentStep === 'name' && <NameInput />}
        
        {currentStep === 'questions' && questions[currentQuestionIndex] && (
          <QuestionCard
            key={questions[currentQuestionIndex].id}
            question={questions[currentQuestionIndex]}
            answers={answersByQuestion[questions[currentQuestionIndex].id] || []}
            onAnswer={async (answerId) => {
              // Store the answer
              const questionId = questions[currentQuestionIndex].id;
              gameActions.submitAnswer(questionId, answerId);
              
              // If this was the last question, calculate result
              if (currentQuestionIndex === questions.length - 1) {
                // Get character points for all answers
                const { data: points } = await supabase
                  .from('character_points')
                  .select('character_id, points')
                  .in('answer_id', Object.values(answers));
                
                if (points) {
                  // Sum points for each character
                  const characterPoints: Record<string, number> = {};
                  points.forEach(({ character_id, points }) => {
                    characterPoints[character_id] = (characterPoints[character_id] || 0) + points;
                  });
                  
                  // Find character with most points
                  const winningCharacterId = Object.entries(characterPoints)
                    .sort(([, a], [, b]) => b - a)[0][0];
                  
                  // Get character details
                  const { data: character } = await supabase
                    .from('characters')
                    .select('*')
                    .eq('id', winningCharacterId)
                    .single();
                  
                  if (character) {
                    // Store result in database
                    await supabase.from('user_responses').insert({
                      user_name: userName,
                      result_character_id: character.id,
                      responses: answers
                    });
                    
                    gameActions.setResult(character);
                  }
                }
              }
            }}
          />
        )}
        
        {currentStep === 'result' && resultCharacter && (
          <ResultCard
            character={resultCharacter}
            userName={userName}
          />
        )}
      </AnimatePresence>
      
      {currentStep === 'questions' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-center text-gray-600"
        >
          Question {currentQuestionIndex + 1} of {questions.length}
        </motion.div>
      )}
    </main>
  );
}