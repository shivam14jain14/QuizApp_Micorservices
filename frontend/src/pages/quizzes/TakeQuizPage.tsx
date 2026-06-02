import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { CheckCircle2, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { getQuizQuestions, submitQuiz } from '../../api/quizApi';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { ScoreFeedback } from '../../components/score/ScoreFeedback';
import { useAuth } from '../../hooks/useAuth';

export function TakeQuizPage() {
  const { quizId } = useParams();
  const { username, role } = useAuth();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const id = Number(quizId);
  const canAttemptQuiz = role === 'STUDENT';
  const questions = useQuery({ queryKey: ['quiz', id], queryFn: () => getQuizQuestions(id), enabled: Number.isFinite(id) });
  const submitMutation = useMutation({
    mutationFn: () => {
      const userResponses = questions.data!.map((question) => ({
        quesId: question.id,
        response: answers[question.id]
      }));

      return submitQuiz({
        quizId: id,
        username: username ?? 'unknown',
        userResponses
      });
    }
  });
  const progress = useMemo(() => {
    const total = questions.data?.length ?? 0;
    return total ? Math.round((Object.keys(answers).length / total) * 100) : 0;
  }, [answers, questions.data]);

  if (questions.isLoading) {
    return <Card className="p-8 text-sm font-semibold text-gray-500">Loading quiz...</Card>;
  }

  if (questions.isError) {
    const status = axios.isAxiosError(questions.error) ? questions.error.response?.status : undefined;
    return (
      <EmptyState
        title="Quiz could not be opened"
        description={status ? `The quiz request failed with status ${status}.` : 'The quiz request failed before questions could load.'}
      />
    );
  }

  if (!questions.data?.length) {
    return <EmptyState title="Quiz not available" description="This quiz could not be loaded right now." />;
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.2em] text-coral">Quiz #{id}</p>
        <h2 className="text-3xl font-black text-ink">{canAttemptQuiz ? 'Answer Questions' : 'Review Quiz'}</h2>
      </div>
      {canAttemptQuiz && (
        <Card className="p-4">
          <div className="mb-2 flex items-center justify-between text-sm font-bold text-gray-600">
            <span>Completion</span>
            <span>{progress}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-gray-100">
            <motion.div className="h-full bg-ocean" animate={{ width: `${progress}%` }} />
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {questions.data.map((question, index) => {
          const title = question.question_title ?? question.questionTitle;
          const selected = answers[question.id];
          return (
            <Card key={question.id} className="p-5">
              <div className="mb-4 flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink text-sm font-black text-white">{index + 1}</div>
                <h3 className="text-base font-black text-ink">{title}</h3>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {[question.option1, question.option2, question.option3, question.option4].map((option, optionIndex) => (
                  <label
                    key={option}
                    className={`flex min-h-12 items-center justify-between rounded-lg border px-4 py-3 text-left text-sm font-semibold transition ${
                      selected === option
                        ? 'border-ocean bg-teal-50 text-ocean'
                        : `border-gray-200 bg-white text-gray-700 ${canAttemptQuiz ? 'hover:border-gray-300' : 'cursor-default'}`
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <input
                        className="h-4 w-4 accent-ocean"
                        type="radio"
                        name={`question-${question.id}`}
                        value={option}
                        checked={selected === option}
                        disabled={!canAttemptQuiz}
                        onChange={() => setAnswers((current) => ({ ...current, [question.id]: option }))}
                      />
                      <span>{option}</span>
                    </span>
                    {selected === option && <CheckCircle2 className="h-4 w-4" />}
                    <span className="sr-only">Option {optionIndex + 1}</span>
                  </label>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      {canAttemptQuiz && (
        <div className="sticky bottom-4 z-10 rounded-lg border border-gray-200 bg-white p-3 shadow-soft">
          <Button
            className="w-full"
            loading={submitMutation.isPending}
            disabled={Object.keys(answers).length !== questions.data.length || submitMutation.isSuccess}
            icon={<Send className="h-4 w-4" />}
            onClick={() => submitMutation.mutate()}
          >
            Submit Quiz
          </Button>
        </div>
      )}

      {submitMutation.data !== undefined && <ScoreFeedback score={submitMutation.data} total={questions.data.length} />}
    </div>
  );
}
