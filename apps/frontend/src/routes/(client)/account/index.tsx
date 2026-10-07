import { component$ } from '@builder.io/qwik';
import { Form, routeAction$, zod$, type DocumentHead } from '@builder.io/qwik-city';
import { patchUsersByUserId } from '@room-booking/core';
import { Alert } from '~/components/ui/alert';
import { Badge, ROLE_LABELS } from '~/components/ui/badge';
import { Button, ButtonLink } from '~/components/ui/button';
import { ASIDE_LAYOUT, CARD, CARD_BODY } from '~/components/ui/card';
import { Detail, Details } from '~/components/ui/details';
import { ErrorSummary, collectErrors } from '~/components/ui/error-summary';
import { TextField } from '~/components/ui/field';
import { PageHeader } from '~/components/ui/page-header';
import { api } from '~/lib/api/client.server';
import { requireUser } from '~/lib/auth.server';
import { formatParisDate } from '~/lib/format';
import { isManager } from '~/lib/navigation';
import { profileShape } from '~/lib/schemas';
import { useCurrentUser } from '~/routes/layout';

const FIELDS = { firstName: 'Prénom', lastName: 'Nom', email: 'Adresse e-mail' };

export const useUpdateProfile = routeAction$(async (input, event) => {
  const user = requireUser(event);
  const { data, response } = await patchUsersByUserId({
    client: api(event),
    path: { userId: user.id },
    body: input,
  });
  if (!data) {
    return event.fail(response?.status ?? 500, {
      message:
        response?.status === 409
          ? 'Cette adresse e-mail est déjà utilisée par un autre compte.'
          : "Vos informations n'ont pas pu être enregistrées. Réessayez.",
    });
  }
  return { saved: true };
}, zod$(profileShape));

export default component$(() => {
  const user = useCurrentUser();
  const update = useUpdateProfile();
  const me = user.value!;
  const errors: Partial<Record<string, string>> | undefined = update.value?.fieldErrors;
  const value = (name: keyof typeof FIELDS) => update.formData?.get(name)?.toString() ?? me[name];
  return (
    <>
      <PageHeader title="Mon profil" description="Vos informations personnelles." />
      <div class={ASIDE_LAYOUT}>
        <section aria-labelledby="edit-title" class={CARD}>
          <Form action={update} class={[CARD_BODY, 'flex flex-col gap-(--space-4)']} noValidate>
            <h2 id="edit-title">Modifier mes informations</h2>
            {update.value?.saved && (
              <Alert tone="success">
                <p>Vos informations ont été enregistrées.</p>
              </Alert>
            )}
            <ErrorSummary errors={collectErrors(FIELDS, errors)} action="l'enregistrement" />
            {update.value?.failed && update.value.message && (
              <Alert tone="danger" title="Enregistrement impossible">
                <p>{update.value.message}</p>
              </Alert>
            )}
            <div class="grid gap-(--space-4) md:grid-cols-2">
              <TextField
                id="firstName"
                label={FIELDS.firstName}
                autoComplete="given-name"
                required
                value={value('firstName')}
                error={errors?.firstName}
              />
              <TextField
                id="lastName"
                label={FIELDS.lastName}
                autoComplete="family-name"
                required
                value={value('lastName')}
                error={errors?.lastName}
              />
            </div>
            <TextField
              id="email"
              label={FIELDS.email}
              type="email"
              autoComplete="email"
              required
              value={value('email')}
              error={errors?.email}
            />
            <div class="flex justify-end pt-(--space-2)">
              <Button type="submit" busy={update.isRunning} class="max-md:w-full">
                Enregistrer
              </Button>
            </div>
          </Form>
        </section>
        <aside aria-labelledby="account-title" class={CARD}>
          <div class={[CARD_BODY, 'flex flex-col gap-(--space-4)']}>
            <h2 id="account-title">Mon compte</h2>
            <Details>
              <Detail term="Rôle">
                <Badge tone="neutral">{ROLE_LABELS[me.role]}</Badge>
              </Detail>
              {me.createdAt && (
                <Detail term="Membre depuis">{formatParisDate(me.createdAt)}</Detail>
              )}
            </Details>
            {isManager(me) ? (
              <ButtonLink href="/manage/requests/" variant="secondary">
                Voir les demandes
              </ButtonLink>
            ) : (
              <ButtonLink href="/bookings/" variant="secondary">
                Voir mes réservations
              </ButtonLink>
            )}
          </div>
        </aside>
      </div>
    </>
  );
});

export const head: DocumentHead = { title: 'Mon profil' };
