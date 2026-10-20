import Link from 'next/link';
import { cn } from '@/libs/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover',
  secondary:
    'border border-primary/30 bg-transparent text-primary hover:bg-primary-soft',
  ghost: 'text-foreground hover:bg-surface-muted',
  danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm font-semibold',
  lg: 'px-6 py-3 text-base font-semibold',
};

export const buttonClasses = (
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  className?: string,
) => cn(BASE, VARIANTS[variant], SIZES[size], className);

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} & React.ComponentPropsWithoutRef<'button'>;

export const Button = ({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonProps) => (
  <button
    type="button"
    className={buttonClasses(variant, size, className)}
    {...props}
  />
);

type ButtonLinkProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} & React.ComponentPropsWithoutRef<typeof Link>;

export const ButtonLink = ({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonLinkProps) => (
  <Link className={buttonClasses(variant, size, className)} {...props} />
);

type ButtonAnchorProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} & React.ComponentPropsWithoutRef<'a'>;

export const ButtonAnchor = ({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonAnchorProps) => (
  <a className={buttonClasses(variant, size, className)} {...props} />
);
