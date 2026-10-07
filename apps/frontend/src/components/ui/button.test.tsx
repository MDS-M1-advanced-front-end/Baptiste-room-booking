import { createDOM } from '@builder.io/qwik/testing';
import { $ } from '@builder.io/qwik';
import { describe, expect, it } from 'vitest';
import { Button } from './button';

describe('Button', () => {
  it('renders its slot and fires onClick$', async () => {
    const { screen, render, userEvent } = await createDOM();
    const clicks: number[] = [];
    await render(<Button onClick$={$(() => clicks.push(1))}>Réserver</Button>);
    await userEvent('button', 'click');
    expect(screen.querySelector('button')?.textContent).toContain('Réserver');
    expect(screen.querySelector('button')?.getAttribute('type')).toBe('button');
    expect(clicks).toHaveLength(1);
  });

  it('applies the danger variant classes', async () => {
    const { screen, render } = await createDOM();
    await render(<Button variant="danger">Supprimer</Button>);
    expect(screen.querySelector('button')?.className).toContain('bg-(--color-danger)');
  });

  it('rejects clicks while busy', async () => {
    const { screen, render, userEvent } = await createDOM();
    const clicks: number[] = [];
    await render(
      <Button busy onClick$={$(() => clicks.push(1))}>
        Envoi...
      </Button>,
    );
    await userEvent('button', 'click');
    const button = screen.querySelector('button');
    expect(button?.getAttribute('aria-busy')).toBe('true');
    expect(button?.hasAttribute('disabled')).toBe(true);
    expect(clicks).toHaveLength(0);
  });
});
