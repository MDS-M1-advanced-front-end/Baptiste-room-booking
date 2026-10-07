import { createDOM } from '@builder.io/qwik/testing';
import { component$, useSignal } from '@builder.io/qwik';
import { describe, expect, it } from 'vitest';
import { Modal } from './modal';

const Harness = component$<{ initiallyOpen: boolean }>(({ initiallyOpen }) => {
  const open = useSignal(initiallyOpen);
  return (
    <>
      <output>{open.value ? 'open' : 'closed'}</output>
      <Modal open={open} title="Annuler cette réservation ?">
        <p>Corps</p>
        <button q:slot="footer" type="button" class="confirm">
          Confirmer
        </button>
      </Modal>
    </>
  );
});

describe('Modal', () => {
  it('labels the dialog with its title and projects body and footer', async () => {
    const { screen, render } = await createDOM();
    await render(<Harness initiallyOpen={false} />);
    const dialog = screen.querySelector('dialog');
    const titleId = dialog?.getAttribute('aria-labelledby');
    expect(titleId).toBeTruthy();
    expect(screen.querySelector(`[id="${titleId}"]`)?.textContent).toBe(
      'Annuler cette réservation ?',
    );
    expect(dialog?.textContent).toContain('Corps');
    expect(dialog?.querySelector('.confirm')).toBeTruthy();
  });

  it('closes through the Fermer button', async () => {
    const { screen, render, userEvent } = await createDOM();
    await render(<Harness initiallyOpen={true} />);
    expect(screen.querySelector('output')?.textContent).toBe('open');
    await userEvent('dialog button[type="button"]', 'click');
    expect(screen.querySelector('output')?.textContent).toBe('closed');
  });

  it('rejects a native close event left unsynced: signal goes back to false', async () => {
    const { screen, render, userEvent } = await createDOM();
    await render(<Harness initiallyOpen={true} />);
    await userEvent('dialog', 'close');
    expect(screen.querySelector('output')?.textContent).toBe('closed');
  });
});
