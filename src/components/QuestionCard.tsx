import { Question, Answer } from '@/types/game';
import { Card } from '@/components/ui';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface QuestionCardProps {
  question: Question;
  answers: Answer[];
  onAnswer: (answerId: string) => void;
}

export function QuestionCard({ question, answers, onAnswer }: QuestionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="max-w-2xl mx-auto"
    >
      <Card>
        <h2 className="text-2xl font-bold mb-6">{question.question_text}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {answers.map((answer) => (
            <button
              key={answer.id}
              onClick={() => onAnswer(answer.id)}
              className={cn(
                'button-base min-h-[120px] text-lg font-medium',
                'relative overflow-hidden rounded-xl transition-transform hover:scale-[1.02]'
              )}
              style={{
                backgroundImage: answer.image_url ? `url(${answer.image_url})` : undefined,
              }}
            >
              <div className="relative z-10 p-4 text-white">
                {answer.answer_text}
              </div>
              {!answer.image_url && (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700" />
              )}
            </button>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}