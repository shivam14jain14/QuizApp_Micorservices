import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, Database, Sparkles, WandSparkles } from 'lucide-react';
import { getQuestionsByCategory } from '../../api/questionApi';
import { finalizeQuiz, generateAiQuestions } from '../../api/quizApi';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { Field, SelectField } from '../../components/common/Field';
import type { Question } from '../../types';

const levelOptions = [
  { label: 'Easy', value: 'Easy' },
  { label: 'Medium', value: 'Medium' },
  { label: 'Hard', value: 'Hard' }
];

function questionTitle(question: Question) {
  return question.question ?? question.questionTitle ?? 'Untitled question';
}

function splitBatchIds(value: string) {
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

export function CreateQuizPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [batchIds, setBatchIds] = useState('');
  const [aiLevel, setAiLevel] = useState('Medium');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([]);
  const [selectedAiIndexes, setSelectedAiIndexes] = useState<number[]>([]);

  const normalizedCategory = category.trim();
  const batches = useMemo(() => splitBatchIds(batchIds), [batchIds]);
  const dbQuestions = useQuery({
    queryKey: ['questions-by-category', normalizedCategory],
    queryFn: () => getQuestionsByCategory(normalizedCategory),
    enabled: normalizedCategory.length > 0
  });

  const aiMutation = useMutation({
    mutationFn: () => generateAiQuestions(normalizedCategory, aiLevel),
    onSuccess: (questions) => {
      setSelectedAiIndexes(questions.map((_, index) => index));
    }
  });

  const selectedAiQuestions = useMemo(() => (
    (aiMutation.data ?? []).filter((_, index) => selectedAiIndexes.includes(index))
  ), [aiMutation.data, selectedAiIndexes]);

  const finalizeMutation = useMutation({
    mutationFn: () => finalizeQuiz({
      title: title.trim(),
      category: normalizedCategory,
      questionIds: selectedQuestionIds,
      batchIds: batches
    }, selectedAiQuestions),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    }
  });

  const canFinalize = Boolean(title.trim() && normalizedCategory && batches.length && (selectedQuestionIds.length || selectedAiQuestions.length));

  const toggleQuestion = (id?: number) => {
    if (!id) return;
    setSelectedQuestionIds((current) => (
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    ));
  };

  const toggleAiQuestion = (index: number) => {
    setSelectedAiIndexes((current) => (
      current.includes(index) ? current.filter((item) => item !== index) : [...current, index]
    ));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-coral">Quiz builder</p>
          <h2 className="text-3xl font-black text-ink">Create New Quiz</h2>
          <p className="mt-1 text-sm text-gray-500">Choose saved questions and optional AI questions before finalizing.</p>
        </div>
        <Button variant="secondary" icon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/quizzes')}>
          Back to Quizzes
        </Button>
      </div>

      <Card className="p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Quiz Title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Java fundamentals" required />
          <Field label="Category" value={category} onChange={(event) => {
            setCategory(event.target.value);
            setSelectedQuestionIds([]);
          }} placeholder="Java" required />
          <Field label="Batch IDs" value={batchIds} onChange={(event) => setBatchIds(event.target.value)} placeholder="BATCH-1, BATCH-2" required />
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <Card className="overflow-hidden">
          <div className="border-b border-gray-100 p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-ocean" />
                <h3 className="text-lg font-black">Question Bank</h3>
              </div>
              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-black text-ocean">
                {selectedQuestionIds.length} selected
              </span>
            </div>
          </div>
          <div className="max-h-[520px] overflow-auto p-4">
            {!normalizedCategory ? (
              <EmptyState title="Enter a category" description="Questions for that category will load here." />
            ) : dbQuestions.isLoading ? (
              <p className="p-4 text-sm font-semibold text-gray-500">Loading questions...</p>
            ) : !dbQuestions.data?.length ? (
              <EmptyState title="No saved questions" description="Generate AI questions or choose another category." />
            ) : (
              <div className="space-y-3">
                {dbQuestions.data.map((question) => {
                  const selected = Boolean(question.id && selectedQuestionIds.includes(question.id));
                  return (
                    <button
                      key={question.id}
                      type="button"
                      onClick={() => toggleQuestion(question.id)}
                      className={`flex w-full items-start justify-between gap-3 rounded-lg border p-4 text-left transition ${
                        selected ? 'border-ocean bg-teal-50 text-ocean' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-sm font-bold">{questionTitle(question)}</span>
                      {selected && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="border-b border-gray-100 p-5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-coral" />
              <h3 className="text-lg font-black">AI Questions</h3>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
              <SelectField label="Level" value={aiLevel} onChange={(event) => setAiLevel(event.target.value)} options={levelOptions} />
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="secondary"
                  loading={aiMutation.isPending}
                  disabled={!normalizedCategory}
                  icon={<WandSparkles className="h-4 w-4" />}
                  onClick={() => aiMutation.mutate()}
                >
                  Generate AI Questions
                </Button>
              </div>
            </div>
          </div>
          <div className="max-h-[520px] overflow-auto p-4">
            {aiMutation.isPending ? (
              <p className="p-4 text-sm font-semibold text-gray-500">Generating questions...</p>
            ) : !aiMutation.data?.length ? (
              <EmptyState title="No AI questions yet" description="Use the button above after entering a category." />
            ) : (
              <div className="space-y-3">
                {aiMutation.data.map((question, index) => {
                  const selected = selectedAiIndexes.includes(index);
                  return (
                    <button
                      key={`${questionTitle(question)}-${index}`}
                      type="button"
                      onClick={() => toggleAiQuestion(index)}
                      className={`flex w-full items-start justify-between gap-3 rounded-lg border p-4 text-left transition ${
                        selected ? 'border-coral bg-rose-50 text-coral' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-sm font-bold">{questionTitle(question)}</span>
                      {selected && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="sticky bottom-4 z-10 rounded-lg border border-gray-200 bg-white p-3 shadow-soft">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-bold text-gray-600">
            {selectedQuestionIds.length} saved + {selectedAiQuestions.length} AI questions selected
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" type="button" onClick={() => navigate('/quizzes')}>Cancel</Button>
            <Button
              type="button"
              loading={finalizeMutation.isPending}
              disabled={!canFinalize}
              icon={<CheckCircle2 className="h-4 w-4" />}
              onClick={() => finalizeMutation.mutate()}
            >
              Finalize Quiz
            </Button>
          </div>
        </div>
        {finalizeMutation.data && (
          <div className="mt-3 flex flex-col gap-2 rounded-lg bg-emerald-50 p-3 text-sm font-bold text-emerald-700 sm:flex-row sm:items-center sm:justify-between">
            <span>{finalizeMutation.data}</span>
            <Link to="/quizzes" className="text-emerald-800 underline">View quizzes</Link>
          </div>
        )}
      </div>
    </div>
  );
}
