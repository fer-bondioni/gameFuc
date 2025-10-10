import { Question, Answer } from '@/types/game';
import { Card } from '@/components/ui';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface QuestionCardProps {
  question: Question;
  answers: Answer[];
  onAnswer: (answerId: string) => void;
}

const colorGradients = [
  'from-pink-500 via-red-500 to-yellow-500',
  'from-green-400 via-cyan-500 to-blue-500',
  'from-purple-500 via-pink-500 to-red-500',
  'from-yellow-400 via-orange-500 to-red-500',
];

export function QuestionCard({ question, answers, onAnswer }: QuestionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="max-w-4xl mx-auto"
    >
      <Card>
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
          {question.question_text}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {answers.map((answer, index) => (
            <motion.button
              key={answer.id}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onAnswer(answer.id)}
              className={cn(
                'relative overflow-hidden rounded-2xl transition-all duration-300',
                'min-h-[180px] p-8 text-xl md:text-2xl font-bold',
                'shadow-2xl hover:shadow-pink-500/50'
              )}
              style={{
                backgroundImage: answer.image_url ? `url(${answer.image_url})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="relative z-10 text-white text-shadow-lg">
                {answer.answer_text}
              </div>
              {!answer.image_url && (
                <div className={cn(
                  'absolute inset-0 bg-gradient-to-br',
                  colorGradients[index % colorGradients.length]
                )} />
              )}
              {answer.image_url && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
              )}
            </motion.button>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
