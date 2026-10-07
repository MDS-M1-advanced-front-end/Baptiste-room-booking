import { component$, Slot, type ClassList, type PropsOf } from '@builder.io/qwik';
import { Icon, type IconName } from './icon';

export interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  class?: ClassList;
}

export const fieldA11y = ({ id, hint, error }: Pick<FieldProps, 'id' | 'hint' | 'error'>) => ({
  id,
  name: id,
  'aria-invalid': error ? ('true' as const) : undefined,
  'aria-describedby':
    [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined,
});

export const Field = component$<FieldProps>(
  ({ id, label, hint, error, required, class: className }) => (
    <div class={['flex flex-col gap-(--space-1)', className]}>
      <label for={id} class="font-(--font-weight-semibold)">
        {label}
        {required && (
          <span class="text-(--color-danger-text)" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>
      <Slot />
      {hint && (
        <p id={`${id}-hint`} class="text-(length:--font-size-sm) text-(--color-text-muted)">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={`${id}-error`}
          class="flex items-start gap-(--space-1) text-(length:--font-size-sm) font-(--font-weight-semibold) text-(--color-danger-text)"
        >
          <Icon name="alert" />
          {error}
        </p>
      )}
    </div>
  ),
);

export const controlClass = [
  'w-full min-w-0 min-h-(--size-control) rounded-(--radius-md) border border-(--color-border-strong) bg-(--color-surface) px-(--space-3) py-(--space-2) text-(--color-text)',
  'hover:border-(--color-text-muted) focus-visible:border-(--color-action) focus-visible:outline-offset-0',
  'aria-invalid:border-2 aria-invalid:border-(--color-danger)',
  'disabled:cursor-not-allowed disabled:bg-(--color-surface-muted) disabled:text-(--color-text-muted)',
];

type InputProps = PropsOf<'input'> & { suffix?: string; icon?: IconName };

export const Input = component$<InputProps>(({ suffix, icon, class: className, ...rest }) => {
  const input = (
    <input
      {...rest}
      class={[
        controlClass,
        icon && 'pl-[calc(var(--space-3)*2+1.25em)]',
        suffix && 'rounded-r-none',
        className,
      ]}
    />
  );
  if (icon) {
    return (
      <div class="relative">
        <Icon
          name={icon}
          class="pointer-events-none absolute top-1/2 left-(--space-3) -translate-y-1/2 text-(--color-text-muted)"
        />
        {input}
      </div>
    );
  }
  if (suffix) {
    return (
      <div class="flex items-stretch">
        {input}
        <span class="grid place-items-center rounded-r-(--radius-md) border border-l-0 border-(--color-border-strong) bg-(--color-surface-muted) px-(--space-3) whitespace-nowrap text-(--color-text-muted)">
          {suffix}
        </span>
      </div>
    );
  }
  return input;
});

export const Select = component$<PropsOf<'select'>>(({ class: className, ...rest }) => (
  <select {...rest} class={[controlClass, className]}>
    <Slot />
  </select>
));

export const Textarea = component$<PropsOf<'textarea'>>(({ class: className, ...rest }) => (
  <textarea {...rest} class={[controlClass, 'min-h-24 resize-y', className]} />
));

export const Checkbox = component$<PropsOf<'input'> & { label: string }>(
  ({ label, class: className, ...rest }) => (
    <label
      class={[
        'flex min-h-(--size-target-min) cursor-pointer items-center gap-(--space-2)',
        className,
      ]}
    >
      <input {...rest} type="checkbox" class="m-0 size-5 accent-(--color-action)" />
      {label}
    </label>
  ),
);

type TextFieldProps = Omit<FieldProps, 'class'> &
  Omit<InputProps, 'id'> & { fieldClass?: ClassList };

export const TextField = component$<TextFieldProps>(
  ({ id, label, hint, error, required, fieldClass, ...input }) => (
    <Field id={id} label={label} hint={hint} error={error} required={required} class={fieldClass}>
      <Input {...input} {...fieldA11y({ id, hint, error })} required={required} />
    </Field>
  ),
);
