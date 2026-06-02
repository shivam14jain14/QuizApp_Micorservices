import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Sparkles } from 'lucide-react';
import { addQuestion, getQuestionCategories, getQuestions } from '../../api/questionApi';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { Field, SelectField } from '../../components/common/Field';
import { Pagination } from '../../components/common/Pagination';
import { pageCount, paginate } from '../../utils/pagination';
import type { Question } from '../../types';

const difficultyOptions = [
  { label: 'Easy', value: 'Easy' },
  { label: 'Medium', value: 'Medium' },
  { label: 'Hard', value: 'Hard' }
];

const levelFilterOptions = [
  { label: 'All levels', value: 'all' },
  ...difficultyOptions
];

export function QuestionsPage() {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const queryClient = useQueryClient();
  const questions = useQuery({ queryKey: ['questions'], queryFn: getQuestions });
  const categories = useQuery({ queryKey: ['question-categories'], queryFn: getQuestionCategories });
  const addMutation = useMutation({
    mutationFn: addQuestion,
    onSuccess: async () => {
      setShowForm(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['questions'] }),
        queryClient.invalidateQueries({ queryKey: ['question-categories'] })
      ]);
    }
  });
  const allQuestions = useMemo(() => questions.data ?? [], [questions.data]);
  const categoryOptions = useMemo(() => {
    const categorySet = new Set(categories.data?.filter(Boolean) ?? []);
    return Array.from(categorySet).sort((a, b) => a.localeCompare(b));
  }, [categories.data]);
  const filteredQuestions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return allQuestions.filter((question: Question) => {
      const questionText = (question.questionTitle ?? question.question ?? '').toLowerCase();
      const answerText = (question.rightAnswer ?? question.answer ?? '').toLowerCase();
      const category = question.category ?? '';
      const level = question.difficultyLevel ?? question.difficultylevel ?? '';
      const matchesSearch = !normalizedSearch || questionText.includes(normalizedSearch) || answerText.includes(normalizedSearch);
      const matchesCategory = categoryFilter === 'all' || category === categoryFilter;
      const matchesLevel = levelFilter === 'all' || level.toLowerCase() === levelFilter.toLowerCase();

      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [allQuestions, categoryFilter, levelFilter, search]);
  const totalPages = pageCount(filteredQuestions.length, pageSize);
  const currentPage = Math.min(page, totalPages);
  const pagedQuestions = paginate(filteredQuestions, currentPage, pageSize);

  function updateSearch(value: string) {
    setPage(1);
    setSearch(value);
  }

  function updateCategory(value: string) {
    setPage(1);
    setCategoryFilter(value);
  }

  function updateLevel(value: string) {
    setPage(1);
    setLevelFilter(value);
  }

  function updatePageSize(value: number) {
    setPage(1);
    setPageSize(value);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-coral">Teacher workspace</p>
          <h2 className="text-3xl font-black text-ink">Question Bank</h2>
          <p className="mt-1 text-sm text-gray-500">Filter and paginate locally for fast question-bank review.</p>
        </div>
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowForm((value) => !value)}>
          Add Question
        </Button>
      </div>

      {showForm && (
        <Card className="p-5">
          <form
            className="grid gap-4 lg:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              addMutation.mutate({
                question: String(form.get('question')),
                category: String(form.get('category')),
                difficultylevel: String(form.get('difficultylevel')),
                option1: String(form.get('option1')),
                option2: String(form.get('option2')),
                option3: String(form.get('option3')),
                option4: String(form.get('option4')),
                answer: String(form.get('answer'))
              });
            }}
          >
            <Field label="Question" name="question" className="lg:col-span-2" required />
            <Field label="Category" name="category" required />
            <SelectField label="Difficulty" name="difficultylevel" options={difficultyOptions} />
            <Field label="Option 1" name="option1" required />
            <Field label="Option 2" name="option2" required />
            <Field label="Option 3" name="option3" required />
            <Field label="Option 4" name="option4" required />
            <Field label="Right Answer" name="answer" required />
            <div className="flex items-end">
              <Button type="submit" loading={addMutation.isPending} icon={<Sparkles className="h-4 w-4" />}>
                Save Question
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-3">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px]">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-gray-700">Search question or answer</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                className="h-11 w-full rounded-lg border border-gray-200 pl-9 pr-3 text-sm outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
                value={search}
                onChange={(event) => updateSearch(event.target.value)}
                placeholder="Search by question title or correct answer"
              />
            </div>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-gray-700">Category</span>
            <select
              className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
              value={categoryFilter}
              onChange={(event) => updateCategory(event.target.value)}
            >
              <option value="all">All categories</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-gray-700">Level</span>
            <select
              className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
              value={levelFilter}
              onChange={(event) => updateLevel(event.target.value)}
            >
              <option value="all">All levels</option>
              {levelFilterOptions.map((level) => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </label>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {pagedQuestions.length === 0 ? (
          <EmptyState title="No questions found" description="Adjust the filter or add a new question." />
        ) : (
          <div className="divide-y divide-gray-100">
            {pagedQuestions.map((question) => (
              <article key={question.id ?? question.questionTitle ?? question.question} className="p-4 transition hover:bg-gray-50">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-sm font-black text-ink">{question.questionTitle ?? question.question}</p>
                    <div className="mt-3 grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
                      {[question.option1, question.option2, question.option3, question.option4].filter(Boolean).map((option) => (
                        <span key={option} className="rounded-lg bg-white px-3 py-2 ring-1 ring-gray-100">{option}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-black text-ocean">{question.category}</span>
                    <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-coral">{question.difficultyLevel ?? question.difficultylevel}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
        <Pagination page={currentPage} totalPages={totalPages} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={updatePageSize} />
      </Card>
    </div>
  );
}
