import { clsx } from 'clsx';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional additional class names for sizing/layout */
  className?: string;
}

/**
 * Reusable skeleton placeholder with pulse animation.
 * Use for loading states; pass className for width/height/rounded.
 */
export default function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={clsx(
        'animate-pulse rounded-md bg-slate-200 dark:bg-slate-700',
        className
      )}
      aria-hidden
      {...props}
    />
  );
}
