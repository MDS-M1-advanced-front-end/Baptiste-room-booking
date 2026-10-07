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
