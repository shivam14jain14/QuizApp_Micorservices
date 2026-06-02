import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Play, Plus } from 'lucide-react';
import { getQuizzesByBatch } from '../../api/quizApi';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { Field } from '../../components/common/Field';
import { Pagination } from '../../components/common/Pagination';
import { SearchToolbar } from '../../components/common/SearchToolbar';
import { useAuth } from '../../hooks/useAuth';
import { useClientList } from '../../hooks/useClientList';
import type { QuizSummary } from '../../types';
import {getBatch} from "../../api/authApi";

export function QuizzesPage() {
  const { role, username } = useAuth();
  const [batch, setBatch] = useState('BATCH-1');
    const batchQuery = useQuery({
        queryKey: ['batch', username],
        queryFn: () => getBatch(username as string),
        enabled: role === 'STUDENT' && !!username
    });
    const selectedBatch = role === 'STUDENT' ? batchQuery.data : batch;

    const quizzes = useQuery({ queryKey: ['quizzes', selectedBatch], queryFn: () => getQuizzesByBatch(selectedBatch as string) ,
        enabled: !!selectedBatch});

  const filterFn = useCallback((quiz: QuizSummary, query: string) => {
    return [quiz.title, quiz.category, quiz.id, quiz.quizId].filter(Boolean).join(' ').toLowerCase().includes(query);
  }, []);
  const list = useClientList(quizzes.data ?? [], filterFn, 6);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-coral">Quiz center</p>
          <h2 className="text-3xl font-black text-ink">Quizzes</h2>
          <p className="mt-1 text-sm text-gray-500">Students take assigned quizzes. Teachers and admins create quiz sets.</p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
            {role !== 'STUDENT' && (
                <Field
                    label="Batch"
                    value={batch}
                    onChange={(event) => setBatch(event.target.value)}
                />
            )}
          {role !== 'STUDENT' && (
            <Link
              to="/quizzes/new"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-ink px-4 text-sm font-semibold text-white shadow-soft transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-ink/20"
            >
              <Plus className="h-4 w-4" />
              Create New Quiz
            </Link>
          )}
        </div>
      </div>

      <SearchToolbar value={list.query} onChange={list.setQuery} placeholder="Search quiz title, category, ID..." />

      <Card className="overflow-hidden">
        {list.paged.length === 0 ? (
          <EmptyState title="No quizzes found" description="Change the batch or create a quiz for this group." />
        ) : (
          <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
            {list.paged.map((quiz) => {
              const id = quiz.id ?? quiz.quizId;
              return (
                <article key={id ?? quiz.title} className="rounded-lg border border-gray-100 bg-gray-50 p-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-soft">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-black text-ink">{quiz.title ?? `Quiz #${id}`}</p>
                      <p className="mt-1 text-sm font-semibold text-gray-500">{quiz.category ?? 'General'}</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-ocean ring-1 ring-teal-100">#{id}</span>
                  </div>
                  <Button className="w-full" icon={<Play className="h-4 w-4" />}>
                    <Link to={`/quizzes/${id}`} className="w-full">Open Quiz</Link>
                  </Button>
                </article>
              );
            })}
          </div>
        )}
        <Pagination page={list.page} totalPages={list.totalPages} pageSize={list.pageSize} onPageChange={list.setPage} onPageSizeChange={list.setPageSize} />
      </Card>
      <p className="text-xs font-semibold text-gray-500">Signed in as {username}. Quiz requests use your secure session.</p>
    </div>
  );
}
