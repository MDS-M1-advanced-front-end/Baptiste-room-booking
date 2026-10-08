// Construit la spec servie par Prism : le contrat de packages/core, enrichi du jeu de
// données de mock/data sous forme d'exemples. Le contrat d'origine n'est pas modifié.
//
// Prism est sans état : il renvoie toujours le premier exemple d'une réponse.
// Pour en choisir un autre, envoyer l'en-tête `Prefer: example=<nom>`,
// par exemple `Prefer: example=gestionnaire-1` sur /auth/login ou /auth/me.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { parse, stringify } from 'yaml';

const readJson = (name) => JSON.parse(readFileSync(`mock/data/${name}.json`, 'utf8'));
const rooms = readJson('rooms');
const users = readJson('users');
const reservations = readJson('reservations');
const availability = readJson('availability');
const payments = readJson('payments');

const spec = parse(readFileSync('packages/core/openapi.yml', 'utf8'));

// Remplace les exemples de la réponse JSON `status` de `method path`
function setExamples(path, method, status, examples) {
  const response = spec.paths[path]?.[method]?.responses?.[status];
  const media = response?.content?.['application/json'];
  if (!media) throw new Error(`Réponse introuvable : ${method.toUpperCase()} ${path} ${status}`);
  delete media.example;
  media.examples = Object.fromEntries(
    Object.entries(examples).map(([name, value]) => [name, { value }]),
  );
}

const page = (items) => ({ items, page: 1, pageSize: 20, total: items.length });
const byKey = (list, key) => Object.fromEntries(list.map((item) => [item[key], item]));
const withoutKey = ({ key, ...rest }) => rest;
const authResponse = (user) => ({
  accessToken: `mock-token-${user.key}`,
  refreshToken: `mock-refresh-${user.key}`,
  expiresIn: 3600,
  user: withoutKey(user),
});

const roomsByKey = byKey(rooms, 'key');
const usersByKey = byKey(users, 'key');

setExamples('/rooms', 'get', '200', { all: page(rooms.map(withoutKey)) });
setExamples('/rooms/{roomId}', 'get', '200', mapValues(roomsByKey, withoutKey));
setExamples('/rooms/{roomId}/availability', 'get', '200', { default: availability });
setExamples('/auth/login', 'post', '200', mapValues(usersByKey, authResponse));
setExamples('/auth/me', 'get', '200', mapValues(usersByKey, withoutKey));
setExamples('/users', 'get', '200', { all: page(users.map(withoutKey)) });
setExamples('/reservations', 'get', '200', { all: page(reservations) });
setExamples('/reservations/{reservationId}', 'get', '200', byKey(reservations, 'id'));
setExamples('/users/{userId}', 'get', '200', mapValues(usersByKey, withoutKey));
setExamples('/admin/reservations', 'get', '200', { all: page(reservations) });
setExamples('/payments', 'post', '201', { default: payments[0] });
setExamples('/payments/{paymentId}', 'get', '200', byKey(payments, 'id'));
setExamples('/admin/statistics', 'get', '200', { default: statistics() });
setExamples('/users/{userId}', 'patch', '200', mapValues(usersByKey, withoutKey));
setExamples('/rooms/{roomId}', 'patch', '200', mapValues(roomsByKey, withoutKey));
setExamples('/reservations/{reservationId}', 'patch', '200', byKey(reservations, 'id'));
const pending = reservations.find((reservation) => reservation.status === 'PENDING');
setExamples('/reservations/{reservationId}/confirm', 'post', '200', {
  default: { ...pending, status: 'CONFIRMED' },
});
setExamples('/reservations/{reservationId}/reject', 'post', '200', {
  default: { ...pending, status: 'REJECTED' },
});

function statistics() {
  const countWithStatus = (status) => reservations.filter((r) => r.status === status).length;
  const paidAmounts = payments.filter((p) => p.status === 'PAID').map((p) => p.amount);
  return {
    totalUsers: users.length,
    totalRooms: rooms.length,
    totalReservations: reservations.length,
    confirmedReservations: countWithStatus('CONFIRMED'),
    cancelledReservations: countWithStatus('CANCELLED'),
    totalRevenue: paidAmounts.reduce((sum, amount) => sum + amount, 0),
  };
}

function mapValues(object, fn) {
  return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, fn(value)]));
}

mkdirSync('mock/.generated', { recursive: true });
writeFileSync('mock/.generated/openapi.yml', stringify(spec));
console.log('Spec de mock générée : mock/.generated/openapi.yml');
