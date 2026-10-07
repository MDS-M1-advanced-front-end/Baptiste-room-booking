import { z } from '@builder.io/qwik-city';
import { isoDate, timeOfDay } from './url-params';

const PASSWORD_MIN = 8;

const required = (message: string) => z.string().trim().min(1, message);

export const emailSchema = z
  .string()
  .trim()
  .email('Saisissez une adresse e-mail valide, par exemple nom@domaine.fr');

export const loginShape = {
  email: emailSchema,
  password: z.string().min(1, 'Saisissez votre mot de passe.'),
};

export const registerShape = {
  firstName: required('Saisissez votre prénom.'),
  lastName: required('Saisissez votre nom.'),
  email: emailSchema,
  password: z.string().superRefine((value, ctx) => {
    if (value.length < PASSWORD_MIN) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Le mot de passe contient ${value.length} caractère${value.length > 1 ? 's' : ''}, il en faut au moins ${PASSWORD_MIN}.`,
      });
    }
  }),
};

export const profileShape = {
  firstName: required('Saisissez votre prénom.'),
  lastName: required('Saisissez votre nom.'),
  email: emailSchema,
};

const SLOT_MESSAGE = 'Choisissez un créneau.';
const slotTime = z.string().refine((value) => !!timeOfDay(value), SLOT_MESSAGE);

export const COMMENT_MAX = 500;

export const reservationSchema = z
  .object({
    date: z.string().refine((value) => !!isoDate(value), 'Choisissez une date valide.'),
    startTime: slotTime,
    endTime: slotTime,
    numberOfParticipants: z.coerce
      .number({ invalid_type_error: 'Saisissez un nombre de participants.' })
      .int('Saisissez un nombre entier de participants.')
      .min(1, 'Indiquez au moins 1 participant.'),
    comment: z
      .string()
      .trim()
      .max(COMMENT_MAX, `Le commentaire dépasse ${COMMENT_MAX} caractères.`)
      .optional(),
  })
  .refine((value) => value.endTime > value.startTime, { path: ['endTime'], message: SLOT_MESSAGE });

const amount = (message: string) =>
  z
    .string()
    .trim()
    .min(1, message)
    .pipe(z.coerce.number({ invalid_type_error: message }));

export const roomShape = {
  name: required('Saisissez le nom de la salle.'),
  description: z.string().trim().optional(),
  location: required('Saisissez le lieu de la salle.'),
  capacity: amount('Saisissez une capacité.')
    .pipe(z.number().int('La capacité doit être un nombre entier.'))
    .pipe(z.number().min(1, "La capacité doit être d'au moins 1 personne.")),
  pricePerHour: amount('Saisissez un tarif horaire.').pipe(
    z.number().min(0, 'Le tarif horaire ne peut pas être négatif.'),
  ),
  equipment: z.array(z.string()).default([]),
  imageUrl: z
    .string()
    .trim()
    .url('Saisissez une adresse complète, par exemple https://exemple.fr/photo.jpg')
    .optional()
    .or(z.literal('').transform(() => undefined)),
};

const slotJson = z.string().transform((value, ctx) => {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Créneaux illisibles. Réessayez.' });
    return z.NEVER;
  }
});

const TIME_MESSAGE = 'Saisissez des heures au format HH:MM.';
const editedTime = z.string().refine((value) => !!timeOfDay(value), TIME_MESSAGE);

export const availabilityShape = {
  date: z.string().refine((value) => !!isoDate(value), 'Choisissez une date valide.'),
  slots: slotJson.pipe(
    z
      .array(z.object({ startTime: editedTime, endTime: editedTime, available: z.boolean() }))
      .transform((slots) => [...slots].sort((a, b) => a.startTime.localeCompare(b.startTime)))
      .superRefine((slots, ctx) => {
        slots.forEach((slot, index) => {
          const message =
            slot.endTime <= slot.startTime
              ? `Le créneau de ${slot.startTime} doit finir après son début.`
              : slots[index - 1]?.endTime > slot.startTime
                ? `Le créneau de ${slot.startTime} chevauche le précédent.`
                : undefined;
          if (message) ctx.addIssue({ code: z.ZodIssueCode.custom, message });
        });
      }),
  ),
};
