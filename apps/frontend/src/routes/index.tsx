import type { RequestHandler } from '@builder.io/qwik-city';
import { HOME } from '~/lib/auth.server';

export const onGet: RequestHandler = ({ redirect }) => {
  throw redirect(308, HOME);
};
