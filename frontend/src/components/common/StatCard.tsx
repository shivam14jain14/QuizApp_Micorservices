import type { ReactNode } from 'react';
import { Card } from './Card';

export function StatCard({ label, value, icon, accent }: { label: string; value: string | number; icon: ReactNode; accent: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-black text-ink">{value}</p>
        </div>
        <div className={`rounded-lg p-3 ${accent}`}>{icon}</div>
      </div>
    </Card>
  );
}
