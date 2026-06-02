import clsx from 'clsx';
import type { HTMLAttributes } from 'react';

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={clsx('inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold', className)}
      {...props}
    />
  );
}
