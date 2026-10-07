import { z } from '@builder.io/qwik-city';

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
