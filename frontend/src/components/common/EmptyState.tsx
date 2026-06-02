import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import { Card } from './Card';

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <Card className="flex flex-col items-center justify-center p-10 text-center">
      <div className="mb-4 rounded-full bg-gray-100 p-4 text-gray-500">
        <Inbox className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-bold text-ink">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-gray-500">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </Card>
  );
}
