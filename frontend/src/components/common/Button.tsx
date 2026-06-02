import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  icon?: ReactNode;
  loading?: boolean;
};

const variants = {
  primary: 'bg-ink text-white hover:bg-gray-800 shadow-soft',
  secondary: 'bg-white text-ink border border-gray-200 hover:border-gray-300',
  ghost: 'text-gray-700 hover:bg-gray-100',
  danger: 'bg-rose-600 text-white hover:bg-rose-700'
};

export function Button({ className, variant = 'primary', icon, loading, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-ink/20 disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}
