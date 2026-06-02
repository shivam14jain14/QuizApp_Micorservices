import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, MailWarning } from 'lucide-react';
import { getFailedNotifications, getNotifications, getSentNotifications, markRead, markUnread } from '../../api/notificationApi';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { Pagination } from '../../components/common/Pagination';
import { SearchToolbar } from '../../components/common/SearchToolbar';
import { useAuth } from '../../hooks/useAuth';
import { useClientList } from '../../hooks/useClientList';
import type { NotificationSummary } from '../../types';

export function NotificationsPage() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'mine' | 'sent' | 'failed'>('mine');
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['notifications', mode],
    queryFn: () => {
      if (mode === 'sent') return getSentNotifications();
      if (mode === 'failed') return getFailedNotifications();
      return getNotifications();
    }
  });
  const readMutation = useMutation({
    mutationFn: ({ id, read }: { id: number; read: boolean }) => read ? markRead(id) : markUnread(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });
  const filterFn = useCallback((item: NotificationSummary, search: string) => {
    return [item.title, item.message, item.eventType, item.type, item.topic, item.createdAt].filter(Boolean).join(' ').toLowerCase().includes(search);
  }, []);
  const list = useClientList(query.data ?? [], filterFn, 8);
  const getNotificationTarget = useCallback((item: NotificationSummary) => {
    const eventType = (item.eventType ?? item.type ?? '').toUpperCase();

    if (eventType === 'QUIZ_CREATED' && (role === 'STUDENT' || role === 'ADMIN')) {
      return '/quizzes';
    }
    if (eventType === 'QUIZ_SUBMITTED' && (role === 'TEACHER' || role === 'ADMIN')) {
      return '/quiz-history';
    }
    if (eventType === 'USER_CREATED' && role === 'ADMIN') {
      return '/admin';
    }
    return null;
  }, [role]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-coral">Inbox</p>
          <h2 className="text-3xl font-black text-ink">Notifications</h2>
        </div>
        {role === 'ADMIN' && (
          <div className="flex rounded-lg border border-gray-200 bg-white p-1">
            {[
              ['mine', 'Mine'],
              ['sent', 'Sent'],
              ['failed', 'Failed']
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setMode(value as 'mine' | 'sent' | 'failed')}
                className={`rounded-md px-3 py-2 text-sm font-bold ${mode === value ? 'bg-ink text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      <SearchToolbar value={list.query} onChange={list.setQuery} placeholder="Search notifications..." />

      <Card className="overflow-hidden">
        {list.paged.length === 0 ? (
          <EmptyState title="No notifications" description="Quiz creation and submission notifications will appear here." />
        ) : (
          <div className="divide-y divide-gray-100">
            {list.paged.map((item) => {
              const target = getNotificationTarget(item);
              return (
              <article
                key={item.id}
                role={target ? 'button' : undefined}
                tabIndex={target ? 0 : undefined}
                onClick={() => target && navigate(target)}
                onKeyDown={(event) => {
                  if (target && (event.key === 'Enter' || event.key === ' ')) {
                    event.preventDefault();
                    navigate(target);
                  }
                }}
                className={`flex flex-col gap-3 p-4 transition hover:bg-gray-50 md:flex-row md:items-center md:justify-between ${target ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-ink/10' : ''}`}
              >
                <div className="flex gap-3">
                  <div className={`mt-1 rounded-lg p-2 ${mode === 'failed' ? 'bg-rose-50 text-rose-600' : 'bg-teal-50 text-ocean'}`}>
                    {mode === 'failed' ? <MailWarning className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-black text-ink">{item.title ?? item.eventType ?? item.type ?? item.topic ?? `Notification #${item.id}`}</h3>
                      <Badge className={(item.read ?? item.readStatus === 'READ') ? 'border-gray-200 bg-gray-50 text-gray-600' : 'border-orange-200 bg-orange-50 text-coral'}>
                        {(item.read ?? item.readStatus === 'READ') ? 'Read' : 'Unread'}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-gray-500">{item.message ?? 'Notification event received from Kafka.'}</p>
                  </div>
                </div>
                {mode === 'mine' && (
                  <Button
                    variant="secondary"
                    loading={readMutation.isPending}
                    icon={<CheckCheck className="h-4 w-4" />}
                    onClick={(event) => {
                      event.stopPropagation();
                      readMutation.mutate({ id: item.id, read: !(item.read ?? item.readStatus === 'READ') });
                    }}
                  >
                    Mark {(item.read ?? item.readStatus === 'READ') ? 'Unread' : 'Read'}
                  </Button>
                )}
              </article>
              );
            })}
          </div>
        )}
        <Pagination page={list.page} totalPages={list.totalPages} pageSize={list.pageSize} onPageChange={list.setPage} onPageSizeChange={list.setPageSize} />
      </Card>
    </div>
  );
}
