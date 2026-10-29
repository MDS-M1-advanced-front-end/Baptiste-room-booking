# apps/frontend

Qwik 1.20 + Qwik City (`@builder.io/*`, NOT Qwik v2 `@qwik.dev/*`). Tailwind v4 via `@tailwindcss/vite`.
Design source: Quorum mockup, tokens in `src/tokens.css`. Style with token vars (`bg-(--color-surface)`),
never hardcoded values.

## UI building blocks (check before writing a component)

- **Qwik UI headless** (`@qwik-ui/headless`, not installed yet): https://qwikui.com/docs/headless/accordion/
  Unstyled accessible primitives (accordion, modal, select, tabs, popover...). Style with Tailwind + tokens.
  Prefer it over hand-rolled a11y logic. Check Qwik 1.x compat of the version before adding.
- **qwik-image** (installed): https://github.com/QwikDev/qwik-image
  Responsive / lazy images (`<Image>`, `useImageProvider$`). Use for room photos (`room.imageUrl`).
- **vite-plugin-pwa** (installed, not wired): PWA = Bonus scope. Add to `vite.config.ts` only when
  PWA work starts.

## Gotchas

- Any package matching `/qwik/i` MUST be a devDependency: `vite.config.ts` throws otherwise.
- Use pnpm from repo root: `pnpm --filter ./apps/frontend add -D <pkg>`. Not npm.
- Context7 / Qwik docs before using a lib API: training data mixes Qwik v1 and v2.
