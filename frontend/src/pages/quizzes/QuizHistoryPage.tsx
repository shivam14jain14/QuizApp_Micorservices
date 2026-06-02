import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { getQuizHistory } from '../../api/quizApi';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { Field } from '../../components/common/Field';
import { Pagination } from '../../components/common/Pagination';
import { SearchToolbar } from '../../components/common/SearchToolbar';
import { useAuth } from '../../hooks/useAuth';
import { useClientList } from '../../hooks/useClientList';
import type { QuizHistorySummary } from '../../types';

export function QuizHistoryPage() {
  const { role, username } = useAuth();
  const isStudent = role === 'STUDENT';
  const [studentName, setStudentName] = useState('');
  const [batch, setBatch] = useState('');
  const [filters, setFilters] = useState({ username: '', batch: '' });

  const effectiveFilters = useMemo(() => ({
    username: isStudent ? username ?? '' : filters.username,
    batch: filters.batch
  }), [filters.batch, filters.username, isStudent, username]);

  const history = useQuery({
    queryKey: ['quiz-history', effectiveFilters.username, effectiveFilters.batch],
    queryFn: () => getQuizHistory(effectiveFilters),
    enabled: !isStudent || !!username
  });

  const filterFn = (item: QuizHistorySummary, search: string) => {
    return [
      item.title,
      item.category,
      item.quizId,
      item.username,
      item.batchIds?.join(' '),
      item.attempted ? 'attempted submitted' : 'not attempted not submitted'
    ].filter(Boolean).join(' ').toLowerCase().includes(search);
  };
  const list = useClientList(history.data ?? [], filterFn, 8);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-coral">Attempts</p>
          <h2 className="text-3xl font-black text-ink">Quiz History</h2>
          <p className="mt-1 text-sm text-gray-500">
            {isStudent ? 'Your assigned quizzes and submitted scores.' : 'Search assigned quizzes by student and batch.'}
          </p>
        </div>
      </div>

      {!isStudent && (
        <Card className="p-4">
          <form
            className="grid gap-3 md:grid-cols-[1fr_1fr_auto]"
            onSubmit={(event) => {
              event.preventDefault();
              setFilters({
                username: studentName.trim(),
                batch: batch.trim()
              });
            }}
          >
            <Field
              label="Student name"
              value={studentName}
              onChange={(event) => setStudentName(event.target.value)}
              placeholder="student1"
            />
            <Field
              label="Batch"
              value={batch}
              onChange={(event) => setBatch(event.target.value)}
              placeholder="1, 2, BATCH-1"
            />
            <div className="flex items-end">
              <Button className="w-full" type="submit" loading={history.isFetching} icon={<Search className="h-4 w-4" />}>
                Search
              </Button>
            </div>
          </form>
        </Card>
      )}

      {!isStudent && <SearchToolbar value={list.query} onChange={list.setQuery} placeholder="Filter quiz, category, student, status..." />}

      <Card className="overflow-hidden">
        {history.isLoading ? (
          <div className="p-8 text-sm font-semibold text-gray-500">Loading quiz history...</div>
        ) : list.paged.length === 0 ? (
          <EmptyState title="No quiz history found" description="Try a student name, batch, or clear the filters." />
        ) : (
          <div className="divide-y divide-gray-100">
            {list.paged.map((item) => (
              <article key={`${item.quizId}-${item.username ?? 'batch'}`} className="grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-black text-ink">{item.title ?? `Quiz #${item.quizId}`}</h3>
                    <Badge className={item.attempted ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}>
                      {item.attempted ? 'Submitted' : 'Not given'}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-gray-500">
                    #{item.quizId} · {item.category ?? 'General'} · {item.batchIds?.join(', ') || 'No batch'}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">Student: {item.username ?? 'No student selected'}</p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-gray-400">Score</p>
                  <p className="text-2xl font-black text-ink">{item.attempted ? item.score ?? 0 : '-'}</p>
                </div>
              </article>
            ))}
          </div>
        )}
        <Pagination page={list.page} totalPages={list.totalPages} pageSize={list.pageSize} onPageChange={list.setPage} onPageSizeChange={list.setPageSize} />
      </Card>
    </div>
  );
}
