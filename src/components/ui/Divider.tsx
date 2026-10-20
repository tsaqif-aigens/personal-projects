import { cn } from '@/libs/cn';

/** Ornamental gold rule used between hero/branding sections. */
export const Divider = ({ className }: { className?: string }) => (
  <div
    aria-hidden="true"
    className={cn('flex items-center justify-center gap-2', className)}
  >
    <span className="h-px w-16 bg-gradient-to-r from-transparent to-accent/60" />
    <span className="h-1.5 w-1.5 rotate-45 bg-accent" />
    <span className="h-px w-16 bg-gradient-to-l from-transparent to-accent/60" />
  </div>
);
