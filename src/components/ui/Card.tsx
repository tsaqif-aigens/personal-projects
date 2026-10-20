import { cn } from '@/libs/cn';

export const Card = ({
  hover = false,
  className,
  ...props
}: {
  hover?: boolean;
  className?: string;
} & React.ComponentPropsWithoutRef<'div'>) => (
  <div
    className={cn(
      'rounded-lg border border-border bg-surface shadow-card',
      hover && 'transition-shadow hover:shadow-card-hover',
      className,
    )}
    {...props}
  />
);
