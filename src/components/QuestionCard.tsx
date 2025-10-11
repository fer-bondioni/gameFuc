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
      className="max-w-4xl mx-auto w-full"
    >
      <Card>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 md:mb-8 text-center bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent px-2">
          {question.question_text}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          {answers.map((answer, index) => (
            <motion.button
              key={answer.id}
              whileHover={{ scale: 1.03, y: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onAnswer(answer.id)}
              className={cn(
                'relative overflow-hidden rounded-xl sm:rounded-2xl transition-all duration-300',
                'min-h-[120px] sm:min-h-[160px] md:min-h-[180px]',
                'p-4 sm:p-6 md:p-8',
                'text-base sm:text-lg md:text-xl lg:text-2xl font-bold',
                'shadow-2xl hover:shadow-pink-500/50',
                'touch-manipulation active:scale-95',
                'flex items-center justify-center'
              )}
              style={{
                backgroundImage: answer.image_url ? `url(${answer.image_url})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="relative z-10 text-white text-shadow-lg text-center leading-tight">
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
