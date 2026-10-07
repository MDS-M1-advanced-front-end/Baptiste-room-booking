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
