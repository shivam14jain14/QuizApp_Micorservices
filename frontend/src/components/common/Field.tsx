import clsx from 'clsx';
import type { InputHTMLAttributes, SelectHTMLAttributes } from 'react';

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function Field({ label, error, className, ...props }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-gray-700">{label}</span>
      <input
        className={clsx(
          'h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10',
          className
        )}
        {...props}
      />
      {error && <span className="mt-1 block text-xs font-medium text-rose-600">{error}</span>}
    </label>
  );
}

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  options: { label: string; value: string }[];
};

export function SelectField({ label, error, options, className, ...props }: SelectFieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-gray-700">{label}</span>
      <select
        className={clsx(
          'h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10',
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      {error && <span className="mt-1 block text-xs font-medium text-rose-600">{error}</span>}
    </label>
  );
}
