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
import { postAuthLogin, postAuthRegister } from "@room-booking/core";
import { AuthCard } from "~/components/layout/auth-card";
import { Alert } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { ErrorSummary, collectErrors } from "~/components/ui/error-summary";
import { TextField } from "~/components/ui/field";
import { api } from "~/lib/api/client.server";
import { HOME, currentUser } from "~/lib/auth.server";
import { startSession } from "~/lib/auth-session.server";
import { registerShape } from "~/lib/schemas";

const FIELDS = {
  firstName: "Prénom",
  lastName: "Nom",
  email: "Adresse e-mail",
  password: "Mot de passe",
};

export const onGet: RequestHandler = (event) => {
  if (currentUser(event)) throw event.redirect(302, HOME);
};

export const useRegister = routeAction$(async (account, event) => {
  const client = api(event);
  const { data: user, response } = await postAuthRegister({
    client,
    body: account,
  });
  if (!user) {
    return event.fail(response?.status ?? 500, {
      message:
        response?.status === 409
          ? "Un compte existe déjà avec cette adresse e-mail."
          : "Le compte n’a pas pu être créé. Réessayez dans un instant.",
    });
  }
  const { data: auth } = await postAuthLogin({
    client,
    body: { email: user.email, password: account.password },
  });
  if (!auth) throw event.redirect(303, "/login/");
  throw startSession(event, auth);
}, zod$(registerShape));

export default component$(() => {
  const register = useRegister();
  const { url } = useLocation();
  const errors = register.value?.fieldErrors;
  const value = (name: string) => register.formData?.get(name)?.toString();
  return (
    <AuthCard title="Créer un compte">
      <p q:slot="intro" class="text-(--color-text-muted)">
        Les champs marqués d'un astérisque (
        <span class="text-(--color-danger-text)">*</span>) sont obligatoires.
      </p>
      <ErrorSummary
        errors={collectErrors(FIELDS, errors)}
        action="la création du compte"
      />
      {register.value?.failed && register.value.message && (
        <Alert tone="danger" title="Création impossible">
          <p>{register.value.message}</p>
        </Alert>
      )}
      <Form action={register} class="flex flex-col gap-(--space-4)" noValidate>
        <div class="grid gap-(--space-4) md:grid-cols-2">
          <TextField
            id="firstName"
            label={FIELDS.firstName}
            autoComplete="given-name"
            required
            value={value("firstName")}
            error={errors?.firstName}
          />
          <TextField
            id="lastName"
            label={FIELDS.lastName}
            autoComplete="family-name"
            required
            value={value("lastName")}
            error={errors?.lastName}
          />
        </div>
        <TextField
          id="email"
          label={FIELDS.email}
          type="email"
          autoComplete="email"
          required
          value={value("email")}
          error={errors?.email}
        />
        <TextField
          id="password"
          label={FIELDS.password}
          type="password"
          autoComplete="new-password"
          hint="8 caractères minimum"
          minLength={8}
          required
          error={errors?.password}
        />
        <Button type="submit" block busy={register.isRunning}>
          Créer mon compte
        </Button>
      </Form>
      <span q:slot="switch">
        Déjà un compte ? <Link href={`/login/${url.search}`}>Se connecter</Link>
      </span>
    </AuthCard>
  );
});

export const head: DocumentHead = { title: "Créer un compte" };
