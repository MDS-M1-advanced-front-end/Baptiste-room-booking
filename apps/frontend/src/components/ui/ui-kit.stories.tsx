import { component$, $, useSignal } from '@builder.io/qwik';
import type { Reservation, User } from '@room-booking/core';
import type { Meta, StoryObj } from 'storybook-framework-qwik';
import { Alert } from './alert';
import { Avatar } from './avatar';
import { Badge, Count, StatusBadge } from './badge';
import { Button, ButtonLink } from './button';
import { ChipList } from './chip-list';
import { Detail, Details } from './details';
import { ErrorSummary } from './error-summary';
import { Checkbox, Field, Input, Select, Textarea, TextField } from './field';
import { Icon } from './icon';
import { Modal } from './modal';
import { Pagination } from './pagination';
import { BackLink, EmptyState, Meta as PageMeta, MetaItem, PageHeader } from './page-header';
import { Segmented } from './segmented';
import { Spinner } from './spinner';

const user: Pick<User, 'firstName' | 'lastName'> = {
  firstName: 'Léa',
  lastName: 'Martin',
};

const meta = {
  title: 'UI kit',
  parameters: {
    layout: 'centered',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Alerts: Story = {
  render: () => (
    <div class="flex w-96 flex-col gap-(--space-3)">
      <Alert tone="info" title="Information">
        Une information utile.
      </Alert>
      <Alert tone="success" title="Succès">
        L’opération est terminée.
      </Alert>
      <Alert tone="warning">Vérifiez les informations saisies.</Alert>
      <Alert tone="danger" title="Erreur">
        Le serveur ne répond pas.
      </Alert>
    </div>
  ),
};

export const AvatarsAndBadges: Story = {
  render: () => (
    <div class="flex flex-wrap items-center gap-(--space-3)">
      <Avatar user={user} />
      <Badge tone="neutral">Neutre</Badge>
      <Badge tone="pending">En attente</Badge>
      <Badge tone="confirmed">Confirmée</Badge>
      <Badge tone="rejected">Refusée</Badge>
      <Count value={3} label="demandes" />
    </div>
  ),
};

export const Buttons: Story = {
  render: () => (
    <div class="flex flex-wrap items-center gap-(--space-3)">
      <Button onClick$={$(() => {})}>Primaire</Button>
      <Button variant="secondary">Secondaire</Button>
      <Button variant="ghost">Fantôme</Button>
      <Button variant="danger">Danger</Button>
      <Button size="sm">Petit</Button>
      <Button busy>Chargement</Button>
      <ButtonLink href="/">Lien bouton</ButtonLink>
    </div>
  ),
};

export const FormFields: Story = {
  render: () => (
    <div class="flex w-96 flex-col gap-(--space-4)">
      <TextField id="name" label="Nom" value="Salle Quorum" />
      <Field id="email" label="Adresse e-mail" hint="Utilisée pour les notifications.">
        <Input id="email" type="email" placeholder="nom@example.com" />
      </Field>
      <Field id="room" label="Salle">
        <Select id="room">
          <option>Agora</option>
          <option>Atlas</option>
        </Select>
      </Field>
      <Field id="message" label="Message">
        <Textarea id="message" rows={3} placeholder="Votre demande..." />
      </Field>
      <Checkbox id="terms" label="J’accepte les conditions d’utilisation." />
    </div>
  ),
};

export const Navigation: Story = {
  render: () => (
    <div class="flex w-[min(42rem,90vw)] flex-col gap-(--space-5)">
      <PageHeader title="Mes réservations" description="Retrouvez vos prochaines réservations." />
      <BackLink href="/" label="Retour à l’accueil" />
      <PageMeta>
        <MetaItem icon="pin">Paris</MetaItem>
        <MetaItem icon="users">12 pers. max</MetaItem>
      </PageMeta>
      <EmptyState
        title="Aucune réservation"
        icon="calendar"
        description="Vos réservations apparaîtront ici."
      />
      <Pagination page={2} pageSize={10} total={42} query="" noun="réservations" />
    </div>
  ),
};

export const DisclosureAndSegments: Story = {
  render: () => (
    <div class="flex w-96 flex-col gap-(--space-4)">
      <Details>
        <Detail term="Équipement">Écran, tableau blanc et visioconférence.</Detail>
        <Detail term="Accessibilité">Accès PMR.</Detail>
      </Details>
      <Segmented
        label="Période"
        items={[
          { href: '?period=upcoming', label: 'À venir', current: true },
          { href: '?period=past', label: 'Passées', current: false },
        ]}
      />
      <div class="flex items-center gap-(--space-3)">
        <Spinner />
        <Icon name="check" />
        <ChipList items={['Écran', 'Wi-Fi', 'Café']} />
      </div>
    </div>
  ),
};

export const Errors: Story = {
  render: () => (
    <ErrorSummary
      action="#booking-form"
      errors={[
        { id: 'name', label: 'Nom', message: 'Le nom est obligatoire.' },
        { id: 'date', label: 'Date', message: 'Choisissez une date.' },
      ]}
    />
  ),
};

const ModalExample = component$(() => {
  const open = useSignal(false);
  return (
    <>
      <Button onClick$={() => (open.value = true)}>Ouvrir la modale</Button>
      <Modal open={open} title="Confirmer la réservation">
        <p>Cette action enverra une demande au gestionnaire.</p>
        <Button q:slot="footer" variant="secondary" onClick$={() => (open.value = false)}>
          Annuler
        </Button>
        <Button q:slot="footer" onClick$={() => (open.value = false)}>
          Confirmer
        </Button>
      </Modal>
    </>
  );
});

export const ModalDialog: Story = {
  render: () => <ModalExample />,
};

export const ReservationStatus: Story = {
  render: () => (
    <div class="flex gap-(--space-3)">
      <StatusBadge status={'PENDING' as Reservation['status']} />
      <StatusBadge status={'CONFIRMED' as Reservation['status']} />
      <StatusBadge status={'REJECTED' as Reservation['status']} />
    </div>
  ),
};
