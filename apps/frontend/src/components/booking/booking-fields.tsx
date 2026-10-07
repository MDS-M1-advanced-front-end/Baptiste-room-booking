import { component$, type Signal } from "@builder.io/qwik";
import type { AvailabilitySlot } from "@room-booking/core";
import { Field, Textarea, TextField, fieldA11y } from "~/components/ui/field";
import { COMMENT_MAX } from "~/lib/schemas";
import type { SlotRange } from "~/lib/slots";

export const BOOKING_FIELDS = {
  numberOfParticipants: "Nombre de participants",
  comment: "Commentaire",
  startTime: "Créneau",
  endTime: "Créneau",
};

export const BookingFields = component$<{
  day: string;
  slots: AvailabilitySlot[];
  selection: Signal<SlotRange | null>;
  capacity: number;
  errors?: Partial<Record<string, string>>;
  participants?: string;
  comment?: string;
}>(({ day, slots, selection, capacity, errors, participants, comment }) => {
  const range = selection.value;
  return (
    <>
      <input type="hidden" name="date" value={day} />
      <input
        type="hidden"
        name="startTime"
        value={range ? slots[range.start].startTime : ""}
      />
      <input
        type="hidden"
        name="endTime"
        value={range ? slots[range.end].endTime : ""}
      />
      <TextField
        id="numberOfParticipants"
        label={BOOKING_FIELDS.numberOfParticipants}
        type="number"
        inputMode="numeric"
        min={1}
        max={capacity}
        required
        hint={`${capacity} personnes maximum`}
        value={participants}
        error={errors?.numberOfParticipants}
      />
      <Field
        id="comment"
        label={BOOKING_FIELDS.comment}
        hint="Facultatif"
        error={errors?.comment}
      >
        <Textarea
          {...fieldA11y({
            id: "comment",
            hint: "Facultatif",
            error: errors?.comment,
          })}
          rows={3}
          maxLength={COMMENT_MAX}
          value={comment}
        />
      </Field>
    </>
  );
});
