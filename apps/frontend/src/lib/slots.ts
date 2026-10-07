import type { AvailabilitySlot } from '@room-booking/core';

export interface SlotRange {
  start: number;
  end: number;
}

const allAvailable = (slots: AvailabilitySlot[], from: number, to: number) =>
  slots.slice(from, to + 1).every((slot) => slot.available);

export function selectSlot(
  slots: AvailabilitySlot[],
  current: SlotRange | null,
  index: number,
): SlotRange | null {
  if (!slots[index]?.available) return current;
  if (current && index > current.end && allAvailable(slots, current.end, index))
    return { start: current.start, end: index };
  if (current && index < current.start && allAvailable(slots, index, current.start))
    return { start: index, end: current.end };
  return { start: index, end: index };
}

const minutes = (time: string) => {
  const [hours, mins] = time.split(':').map(Number);
  return hours * 60 + mins;
};

export function rangeMinutes(slots: AvailabilitySlot[], range: SlotRange) {
  const first = slots[range.start];
  const last = slots[range.end];
  return first && last ? minutes(last.endTime) - minutes(first.startTime) : 0;
}

export const estimatePrice = (pricePerHour: number, mins: number) =>
  Math.round(((pricePerHour * mins) / 60) * 100) / 100;

export const withOwnSlots = (slots: AvailabilitySlot[], start: string, end: string) =>
  slots.map((slot) =>
    slot.startTime >= start && slot.endTime <= end ? { ...slot, available: true } : slot,
  );

export function rangeOf(slots: AvailabilitySlot[], start: string, end: string): SlotRange | null {
  const first = slots.findIndex((slot) => slot.startTime === start);
  const last = slots.findIndex((slot) => slot.endTime === end);
  return first >= 0 && last >= first ? { start: first, end: last } : null;
}

const clock = (mins: number) =>
  `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;

export const hourlySlots = (slots: AvailabilitySlot[]) =>
  slots.flatMap(({ startTime, endTime, available }) => {
    const hours: AvailabilitySlot[] = [];
    for (let from = minutes(startTime); from < minutes(endTime); from += 60) {
      hours.push({
        startTime: clock(from),
        endTime: clock(Math.min(from + 60, minutes(endTime))),
        available,
      });
    }
    return hours;
  });

const LAST_MINUTE = 23 * 60 + 59;

export const nextSlot = (slots: AvailabilitySlot[]): AvailabilitySlot => {
  const from = Math.max(8 * 60, ...slots.map((slot) => minutes(slot.endTime)));
  return {
    startTime: clock(from),
    endTime: clock(Math.min(from + 60, LAST_MINUTE)),
    available: true,
  };
};
