import { component$, Slot, type PropsOf } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import { Spinner } from './spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'md' | 'sm' | 'icon' | 'icon-sm';

interface ButtonStyle {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-(--color-action) text-(--color-on-action) hover:bg-(--color-action-hover) hover:text-(--color-on-action) active:bg-(--color-action-active)',
  secondary:
    'border-(--color-border-strong) bg-(--color-surface) text-(--color-action) hover:bg-(--color-action-subtle) hover:text-(--color-action) active:bg-(--color-action-subtle-hover)',
  ghost:
    'bg-transparent text-(--color-action) hover:bg-(--color-action-subtle) hover:text-(--color-action)',
  danger:
    'bg-(--color-danger) text-(--color-text-inverse) hover:bg-(--color-danger-hover) hover:text-(--color-text-inverse)',
};

const SIZES: Record<ButtonSize, string> = {
  md: 'min-h-(--size-control) px-(--space-4)',
  sm: 'min-h-(--size-control-sm) px-(--space-3) text-(length:--font-size-sm)',
  icon: 'size-(--size-control) p-0',
  'icon-sm': 'size-(--size-control-sm) p-0 text-(length:--font-size-sm)',
};

export const buttonClass = ({ variant = 'primary', size = 'md', block }: ButtonStyle) => [
  'inline-flex cursor-pointer items-center justify-center gap-(--space-2) rounded-(--radius-md) border border-transparent font-(--font-weight-semibold) leading-none no-underline transition-colors duration-(--duration-fast) ease-(--easing-standard)',
  'disabled:cursor-not-allowed disabled:border-(--color-border) disabled:bg-(--color-surface-muted) disabled:text-(--color-text-muted)',
  'aria-disabled:cursor-not-allowed aria-disabled:border-(--color-border) aria-disabled:bg-(--color-surface-muted) aria-disabled:text-(--color-text-muted) aria-busy:cursor-progress',
  VARIANTS[variant],
  SIZES[size],
  block && 'w-full',
];

type ButtonProps = PropsOf<'button'> & ButtonStyle & { busy?: boolean };

export const Button = component$<ButtonProps>(
  ({
    variant,
    size,
    block,
    busy,
    type = 'button',
    class: className,
    disabled,
    onClick$,
    ...rest
  }) => (
    <button
      {...rest}
      onClick$={busy ? undefined : onClick$}
      type={type}
      disabled={disabled || busy}
      aria-busy={busy ? 'true' : undefined}
      class={[buttonClass({ variant, size, block }), className]}
    >
      {busy && <Spinner />}
      <Slot />
    </button>
  ),
);

type ButtonLinkProps = PropsOf<typeof Link> & ButtonStyle;

export const ButtonLink = component$<ButtonLinkProps>(
  ({ variant, size, block, class: className, ...rest }) => (
    <Link {...rest} class={[buttonClass({ variant, size, block }), className]}>
      <Slot />
    </Link>
  ),
);
