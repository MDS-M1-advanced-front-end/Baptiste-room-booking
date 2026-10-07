import { component$ } from '@builder.io/qwik';
import { Alert } from './alert';

export interface FieldErrorItem {
  id: string;
  label: string;
  message: string;
}

export const ErrorSummary = component$<{ errors: FieldErrorItem[]; action: string }>(
  ({ errors, action }) =>
    errors.length ? (
      <Alert
        tone="danger"
        id="error-summary"
        title={`${errors.length} erreur${errors.length > 1 ? 's empêchent' : ' empêche'} ${action}`}
      >
        <ul class="mt-(--space-1) list-disc pl-(--space-4)">
          {errors.map((error) => (
            <li key={error.id}>
              <a href={`#${error.id}`}>
                {error.label} : {error.message}
              </a>
            </li>
          ))}
        </ul>
      </Alert>
    ) : null,
);

export const collectErrors = (
  fields: Record<string, string>,
  fieldErrors: Partial<Record<string, string | string[]>> | undefined,
): FieldErrorItem[] =>
  Object.entries(fields).flatMap(([id, label]) => {
    const value = fieldErrors?.[id];
    const message = Array.isArray(value) ? value[0] : value;
    return message ? [{ id, label, message }] : [];
  });
