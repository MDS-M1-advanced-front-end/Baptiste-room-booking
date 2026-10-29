import { component$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";

export interface PageWindow {
  page: number;
  pageSize: number;
  total: number;
}

export const pageCount = ({ pageSize, total }: PageWindow) =>
  Math.max(1, Math.ceil(total / pageSize));

export const pageHref = (query: string, page: number) => {
  const params = new URLSearchParams(query);
  params.delete("page");
  if (page > 1) params.set("page", String(page));
  const search = params.toString();
  return search ? `?${search}` : "?";
};

const itemClass =
  "inline-grid h-(--size-control) min-w-(--size-control) place-items-center rounded-(--radius-md) px-(--space-2) font-(--font-weight-semibold) no-underline";

export const Pagination = component$<
  PageWindow & { query: string; noun: string }
>(({ page, pageSize, total, query, noun }) => {
  const pages = pageCount({ page, pageSize, total });
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);
  return (
    <nav
      aria-label="Pagination"
      class="mt-(--space-5) flex flex-wrap items-center justify-between gap-(--space-3)"
    >
      <p class="text-(length:--font-size-sm) text-(--color-text-muted)">
        {noun} {first} à {last} sur {total}
      </p>
      {pages > 1 && (
        <ul class="flex gap-(--space-1)">
          {page > 1 && (
            <li>
              <Link
                href={pageHref(query, page - 1)}
                class={[itemClass, "hover:bg-(--color-action-subtle)"]}
              >
                Précédente<span class="sr-only"> page</span>
              </Link>
            </li>
          )}
          {Array.from({ length: pages }, (_, index) => index + 1).map(
            (number) => (
              <li key={number}>
                {number === page ? (
                  <span
                    aria-current="page"
                    class={[
                      itemClass,
                      "bg-(--color-action) text-(--color-on-action)",
                    ]}
                  >
                    <span class="sr-only">Page </span>
                    {number}
                  </span>
                ) : (
                  <Link
                    href={pageHref(query, number)}
                    class={[itemClass, "hover:bg-(--color-action-subtle)"]}
                  >
                    <span class="sr-only">Page </span>
                    {number}
                  </Link>
                )}
              </li>
            ),
          )}
          {page < pages && (
            <li>
              <Link
                href={pageHref(query, page + 1)}
                class={[itemClass, "hover:bg-(--color-action-subtle)"]}
              >
                Suivante<span class="sr-only"> page</span>
              </Link>
            </li>
          )}
        </ul>
      )}
    </nav>
  );
});
