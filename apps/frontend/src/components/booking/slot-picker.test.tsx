import { component$, useSignal } from '@builder.io/qwik';
import { createDOM } from '@builder.io/qwik/testing';
import type { AvailabilitySlot } from '@room-booking/core';
import { describe, expect, it } from 'vitest';
import type { SlotRange } from '~/lib/slots';
import { BookingSummary } from './booking-summary';
import { SlotPicker } from './slot-picker';

const slots: AvailabilitySlot[] = [
  { startTime: '08:00', endTime: '09:00', available: true },
  { startTime: '09:00', endTime: '10:00', available: false },
  { startTime: '10:00', endTime: '11:00', available: true },
  { startTime: '11:00', endTime: '12:00', available: true },
];

const Harness = component$<{ items?: AvailabilitySlot[] }>(({ items = slots }) => {
  const selection = useSignal<SlotRange | null>(null);
  return (
    <>
      <SlotPicker day="2026-11-16" slots={items} selection={selection} />
      <BookingSummary day="2026-11-16" slots={items} selection={selection} pricePerHour={45} />
    </>
  );
});

async function setup(items?: AvailabilitySlot[]) {
  const dom = await createDOM();
  await dom.render(<Harness items={items} />);
  return dom;
}

const pressed = (screen: HTMLElement) =>
  Array.from(screen.querySelectorAll('[aria-pressed="true"]'), (node) => node.textContent);
const text = (screen: HTMLElement) => screen.textContent?.replace(/\s+/g, ' ') ?? '';

describe('SlotPicker', () => {
  it('labels the group with the day and marks taken slots', async () => {
    const { screen } = await setup();
    expect(text(screen)).toContain('Créneaux du lundi 16 novembre 2026');
    expect(screen.querySelectorAll('[aria-disabled="true"]').length).toBe(1);
    expect(text(screen)).toContain('Aucun créneau sélectionné.');
  });

  it('selects a free slot and announces it', async () => {
    const { screen, userEvent } = await setup();
    await userEvent('button:nth-child(3)', 'click');
    expect(pressed(screen)).toEqual(['10:00à 11:00']);
    expect(text(screen)).toContain('Sélection : de 10:00 à 11:00 (1 heure)');
  });

  it('extends to a contiguous range and prices it', async () => {
    const { screen, userEvent } = await setup();
    await userEvent('button:nth-child(3)', 'click');
    await userEvent('button:nth-child(4)', 'click');
    expect(pressed(screen)).toHaveLength(2);
    expect(text(screen)).toContain('de 10:00 à 12:00 (2 heures)');
    expect(text(screen)).toContain('2 h × 45,00 €');
    expect(text(screen)).toContain('90,00 €');
  });

  it('rejects a click on a taken slot: nothing selected', async () => {
    const { screen, userEvent } = await setup();
    await userEvent('button:nth-child(2)', 'click');
    expect(pressed(screen)).toEqual([]);
    expect(text(screen)).toContain('0,00 €');
  });

  it('rejects an empty day: no slot buttons', async () => {
    const { screen } = await setup([]);
    expect(screen.querySelector('[role="group"]')).toBeFalsy();
    expect(text(screen)).toContain('Aucun créneau ouvert ce jour.');
  });
});
