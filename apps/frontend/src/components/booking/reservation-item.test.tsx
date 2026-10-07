import { createDOM } from '@builder.io/qwik/testing';
import { QwikCityMockProvider } from '@builder.io/qwik-city';
import type { Reservation } from '@room-booking/core';
import { describe, expect, it } from 'vitest';
import { ReservationItem, ReservationList } from './reservation-item';

const reservation: Reservation = {
  id: 'r1',
  roomId: 'room-01',
  userId: 'u',
  startAt: '2026-10-12T09:00:00Z',
  endAt: '2026-10-12T12:00:00Z',
  status: 'CONFIRMED',
  numberOfParticipants: 8,
  comment: 'Atelier UX',
  totalAmount: 135,
};

async function renderItem(value: Reservation, withAction = false) {
  const { screen, render } = await createDOM();
  await render(
    <QwikCityMockProvider>
      <ReservationList>
        <ReservationItem reservation={value} roomName="Salle Voltaire">
          {withAction && <button q:slot="actions">Annuler</button>}
        </ReservationItem>
      </ReservationList>
    </QwikCityMockProvider>,
  );
  return { screen, text: screen.textContent?.replace(/\s+/g, ' ') ?? '' };
}

describe('ReservationItem', () => {
  it('renders room link, status, Paris slot, participants, amount and comment', async () => {
    const { screen, text } = await renderItem(reservation);
    expect(screen.querySelector('h3 a')?.getAttribute('href')).toBe('/rooms/room-01/');
    expect(text).toContain('Confirmée');
    expect(text).toContain('lun. 12 oct. · 11:00 – 14:00');
    expect(text).toContain('8 participants');
    expect(text).toContain('135,00 €');
    expect(text).toContain('« Atelier UX »');
  });

  it('renders the actions slot', async () => {
    const { screen } = await renderItem(reservation, true);
    expect(screen.querySelector('button')?.textContent).toBe('Annuler');
  });

  it('rejects missing optional data: no participants line, no comment', async () => {
    const { text } = await renderItem({
      ...reservation,
      numberOfParticipants: undefined,
      comment: undefined,
    });
    expect(text).not.toContain('participants');
    expect(text).not.toContain('«');
  });
});
