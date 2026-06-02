import { Search } from 'lucide-react';

export function SearchToolbar({
  value,
  onChange,
  placeholder,
  right
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          className="h-10 w-full rounded-lg border border-gray-200 pl-9 pr-3 text-sm outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
      </div>
      {right}
    </div>
  );
}
