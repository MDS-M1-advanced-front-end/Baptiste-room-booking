import { parisIso } from "./dates";

interface BookingInput {
  date: string;
  startTime: string;
  endTime: string;
  numberOfParticipants: number;
  comment?: string;
}

export const reservationTimes = (input: BookingInput) => ({
  startAt: parisIso(input.date, input.startTime),
  endAt: parisIso(input.date, input.endTime),
  numberOfParticipants: input.numberOfParticipants,
  comment: input.comment || undefined,
});

export const capacityError = (capacity: number, participants: number) =>
  participants > capacity
    ? `La salle accueille ${capacity} personnes au maximum.`
    : undefined;
