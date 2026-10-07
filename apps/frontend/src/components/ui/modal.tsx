import { component$, Slot, useId, useSignal, useTask$, type Signal } from '@builder.io/qwik';
import { isServer } from '@builder.io/qwik/build';
import { Button } from './button';
import { Icon } from './icon';

export const Modal = component$<{ open: Signal<boolean>; title: string }>(({ open, title }) => {
  const dialog = useSignal<HTMLDialogElement>();
  const titleId = useId();

  useTask$(({ track }) => {
    const isOpen = track(() => open.value);
    const element = dialog.value;
    if (isServer || !element) return;
    if (isOpen && !element.open) element.showModal();
    if (!isOpen && element.open) element.close();
  });

  return (
    <dialog
      ref={dialog}
      aria-labelledby={titleId}
      onClose$={() => (open.value = false)}
      class="m-auto max-h-[calc(100dvh-2*var(--space-4))] w-[min(32rem,calc(100vw-2*var(--space-4)))] rounded-(--radius-lg) border-0 bg-(--color-surface) p-0 text-(--color-text) shadow-(--shadow-lg) backdrop:bg-(--color-overlay)"
    >
      <div class="flex items-start justify-between gap-(--space-4) px-(--space-5) pt-(--space-5)">
        <h2 id={titleId} class="text-(length:--font-size-lg)">
          {title}
        </h2>
        <Button variant="ghost" size="icon-sm" onClick$={() => (open.value = false)}>
          <Icon name="x" />
          <span class="sr-only">Fermer</span>
        </Button>
      </div>
      <div class="flex flex-col gap-(--space-3) px-(--space-5) py-(--space-4)">
        <Slot />
      </div>
      <div class="flex flex-wrap-reverse justify-end gap-(--space-3) px-(--space-5) pb-(--space-5) max-md:[&_button]:flex-[1_1_100%]">
        <Slot name="footer" />
      </div>
    </dialog>
  );
});
