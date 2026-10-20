import { cn } from '@/libs/cn';

type Variant = 'neutral' | 'success' | 'warning' | 'info' | 'accent';

const VARIANTS: Record<Variant, string> = {
  neutral: 'bg-surface-muted text-muted-foreground',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  info: 'bg-info-soft text-info',
  accent: 'bg-gold-100 text-gold-800',
};

export const Badge = ({
  variant = 'neutral',
  className,
  ...props
}: { variant?: Variant; className?: string } & React.ComponentPropsWithoutRef<'span'>) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
      VARIANTS[variant],
      className,
    )}
    {...props}
  />
);
