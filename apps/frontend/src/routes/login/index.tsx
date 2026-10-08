import { component$ } from "@builder.io/qwik";
import {
  Form,
  Link,
  routeAction$,
  useLocation,
  zod$,
  type DocumentHead,
  type RequestHandler,
} from "@builder.io/qwik-city";
import { loginUser } from "@room-booking/core";
import { AuthCard } from "~/components/layout/auth-card";
import { Alert } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { TextField } from "~/components/ui/field";
import { api } from "~/lib/api/client.server";
import { HOME, currentUser } from "~/lib/auth.server";
import { startSession } from "~/lib/auth-session.server";
import { loginShape } from "~/lib/schemas";

export const onGet: RequestHandler = (event) => {
  if (currentUser(event)) throw event.redirect(302, HOME);
};

export const useLogin = routeAction$(async (credentials, event) => {
  const { data } = await loginUser({
    client: api(event),
    body: credentials,
  });
  if (!data)
    return event.fail(401, {
      message: "Adresse e-mail ou mot de passe incorrect.",
    });
  throw startSession(event, data);
}, zod$(loginShape));

export default component$(() => {
  const login = useLogin();
  const { url } = useLocation();
  const errors = login.value?.fieldErrors;
  return (
    <AuthCard title="Connexion">
      <p q:slot="intro" class="text-(--color-text-muted)">
        Retrouvez vos réservations et réservez en quelques clics.
      </p>
      {login.value?.failed && login.value.message && (
        <Alert tone="danger" title="Connexion impossible">
          <p>{login.value.message}</p>
        </Alert>
      )}
      <Form action={login} class="flex flex-col gap-(--space-4)">
        <TextField
          id="email"
          label="Adresse e-mail"
          type="email"
          autoComplete="email"
          required
          value={login.formData?.get("email")?.toString()}
          error={errors?.email}
        />
        <TextField
          id="password"
          label="Mot de passe"
          type="password"
          autoComplete="current-password"
          required
          error={errors?.password}
        />
        <Button type="submit" block busy={login.isRunning}>
          Se connecter
        </Button>
      </Form>
      <span q:slot="switch">
        Pas encore de compte ?{" "}
        <Link href={`/register/${url.search}`}>Créer un compte</Link>
      </span>
    </AuthCard>
  );
});

export const head: DocumentHead = { title: "Connexion" };
