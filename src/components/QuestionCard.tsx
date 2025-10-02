import { Question, Answer } from '@/types/game';
import { Button, Card } from '@/components/ui';
import { motion } from 'framer-motion';

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
        <div className="space-y-3">
          {answers.map((answer) => (
            <Button
              key={answer.id}
              onClick={() => onAnswer(answer.id)}
              fullWidth
              variant="secondary"
            >
              {answer.answer_text}
            </Button>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}