import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { CheckCircle2, Send, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { getQuizHistory, getQuizQuestions, getQuizReview, submitQuiz } from '../../api/quizApi';
import type { AnswerResult } from '../../types';
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
  const result = submitMutation.data;
  const submitted = Boolean(result);
  const historyQuery = useQuery({
    queryKey: ['quiz-history', username],
    queryFn: () => getQuizHistory({ username: username ?? '' }),
    enabled: canAttemptQuiz && !!username
  });
  const priorAttempt = historyQuery.data?.find((h) => h.quizId === id && h.attempted);
  const alreadyAttempted = Boolean(priorAttempt) && !submitted;
  const locked = submitted || alreadyAttempted;
  // When reviewing a locked attempt, pull the stored per-question breakdown.
  const reviewQuery = useQuery({
    queryKey: ['quiz-review', id, username],
    queryFn: () => getQuizReview(id),
    enabled: alreadyAttempted
  });
  // The breakdown comes from a fresh submit, or is reconstructed from the stored attempt.
  const reviewResult = result ?? reviewQuery.data;
  const showResults = Boolean(reviewResult);
  const outcomeByText = useMemo(() => {
    const map: Record<string, AnswerResult> = {};
    reviewResult?.results.forEach((r) => {
      map[r.question] = r;
    });
    return map;
  }, [reviewResult]);

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

      {result && <ScoreFeedback score={result.score} total={result.total} />}

      {alreadyAttempted && priorAttempt && (
        <Card className="border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-amber-700">Already attempted</p>
          <p className="mt-1 text-sm font-semibold text-amber-800">
            You already submitted this quiz — score {priorAttempt.score ?? 0} / {questions.data.length}. You can review the
            questions below but cannot retake it.
          </p>
        </Card>
      )}

      {submitMutation.isError && (
        <Card className="border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
          {axios.isAxiosError(submitMutation.error) && submitMutation.error.response?.status === 409
            ? 'You have already attempted this quiz.'
            : 'Could not submit the quiz. Please try again.'}
        </Card>
      )}

      {canAttemptQuiz && !locked && (
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
          const outcome = title ? outcomeByText[title] : undefined;
          return (
            <Card key={question.id} className="p-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink text-sm font-black text-white">{index + 1}</div>
                  <h3 className="text-base font-black text-ink">{title}</h3>
                </div>
                {showResults && outcome && (
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${
                      outcome.correct ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {outcome.correct ? 'Correct' : 'Incorrect'}
                  </span>
                )}
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {[question.option1, question.option2, question.option3, question.option4].map((option, optionIndex) => {
                  const isCorrectAnswer = showResults && outcome && option === outcome.correctAnswer;
                  const isWrongPick = showResults && outcome && option === outcome.userResponse && !outcome.correct;
                  let optionClass: string;
                  if (isCorrectAnswer) {
                    optionClass = 'border-emerald-400 bg-emerald-50 text-emerald-700';
                  } else if (isWrongPick) {
                    optionClass = 'border-rose-400 bg-rose-50 text-rose-700';
                  } else if (!showResults && selected === option) {
                    optionClass = 'border-ocean bg-teal-50 text-ocean';
                  } else {
                    optionClass = `border-gray-200 bg-white ${showResults ? 'text-gray-400' : 'text-gray-700'} ${
                      canAttemptQuiz && !showResults ? 'hover:border-gray-300' : 'cursor-default'
                    }`;
                  }
                  return (
                    <label
                      key={option}
                      className={`flex min-h-12 items-center justify-between rounded-lg border px-4 py-3 text-left text-sm font-semibold transition ${optionClass}`}
                    >
                      <span className="flex items-center gap-3">
                        <input
                          className="h-4 w-4 accent-ocean"
                          type="radio"
                          name={`question-${question.id}`}
                          value={option}
                          checked={selected === option}
                          disabled={!canAttemptQuiz || locked}
                          onChange={() => setAnswers((current) => ({ ...current, [question.id]: option }))}
                        />
                        <span>{option}</span>
                      </span>
                      {isCorrectAnswer && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                      {isWrongPick && <XCircle className="h-4 w-4 text-rose-600" />}
                      {!showResults && selected === option && <CheckCircle2 className="h-4 w-4" />}
                      <span className="sr-only">Option {optionIndex + 1}</span>
                    </label>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      {canAttemptQuiz && !locked && (
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
    </div>
  );
}
