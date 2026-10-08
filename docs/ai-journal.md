# Journal d'usage de l'IA

L'IA est autorisée pendant le projet, à condition d'être **tracée ici**. Ce journal est un livrable évalué (4 points : régularité, erreurs de l'IA relevées et corrigées, posture critique) et sert de base aux questions de la soutenance sur le code généré.

**Règles**

- Une entrée par usage significatif : génération de code, débogage, explication d'un concept, revue, traduction d'un composant... Pas besoin de tracer chaque complétion automatique d'une ligne.
- Rédigez l'entrée **au moment** où vous utilisez l'IA, pas en fin de module.
- Soyez honnête sur ce qui a été accepté tel quel : c'est la vérification et la critique qui sont évaluées, pas le fait de ne pas utiliser l'IA.
- Ajoutez les nouvelles entrées **en haut** de la section _Entrées_.

Apprenant : Baptiste
Framework / méta-framework : Qwik 1.20 / Qwik City

---

## Entrées

### 2026-10-07 - Composant RoomCard depuis la maquette (séance 3)

- **Outil** : Claude Code (Claude Opus 5.5), dans le terminal
- **Objectif** : créer le composant `RoomCard` à partir de la maquette Quorum (`composants.html`, `tokens.css`) et l'intégrer à l'app Qwik City, stylé avec Tailwind.
- **Demande** : « Pour frontend, créer le composant Room Card en le retrouvant dans les maquettes, puis l'ajouter comme composant de l'app Qwik / Qwik City en l'adaptant à ce framework, avec du CSS via Tailwind (`npm install tailwindcss @tailwindcss/cli`) ». Contexte fourni : dossier des maquettes, app `apps/frontend`.
- **Résultat** : accepté tel quel (pas encore relu ni modifié)
  - `apps/frontend/src/components/room-card/room-card.tsx` : carte entièrement cliquable par un seul lien (`::after`), focus via `has-[a:focus-visible]`, état « Inactive » (badge et image en gris), image de remplacement si `imageUrl` est absent ;
  - `tokens.css` copié dans `src/` et importé dans `global.css` ; classes Tailwind sur les variables (`bg-(--color-surface)`), aucune valeur en dur ;
  - page d'accueil remplacée par une grille de démonstration alimentée par `mock/data/rooms.json`.
- **Erreurs de l'IA relevées** :
  - consigne non suivie : Tailwind installé avec `@tailwindcss/vite` au lieu de `@tailwindcss/cli`, et avec pnpm au lieu de npm (justifié : intégration officielle pour Vite, repo en workspace pnpm ; c'est quand même un écart à la demande) ;
  - type `Room` redéfini dans le composant au lieu de venir de `core` (encore vide) : doublon à supprimer après `pnpm core:sync` ;
  - la route importe `mock/data/rooms.json` par un chemin relatif : l'app dépend du mock, à remplacer par un appel à `GET /rooms` ;
  - `tokens.css` dupliqué depuis la maquette : deux copies à garder synchronisées ;
  - état de chargement (skeleton) de la maquette non implémenté ;
  - la demande parlait de Qwik v2, le projet est en Qwik 1.20 (`@builder.io/qwik-city`) : l'IA l'a signalé sans migrer.
- **Vérification** : `tsc --noEmit`, `pnpm lint` et `pnpm build.client` passent ; utilitaires générés vérifiés dans le CSS du build ; documentation Tailwind v4 consultée (Context7). **Pas encore de test visuel** dans le navigateur, ni au clavier, ni au lecteur d'écran.
- **Ce que j'en retiens** : ...

---

## Synthèse (à rédiger avant la soutenance)

**Ce que l'IA a bien fait sur ce projet** :

...

**Ses erreurs récurrentes sur mon framework** (API obsolètes, mauvaise version, réactivité, typage...) :

...

**Ce que je ne lui délègue pas, et pourquoi** :

...

**Fiabilité de l'IA sur mon framework** (note de 1 à 5, reportée dans la matrice comparative) : ...
