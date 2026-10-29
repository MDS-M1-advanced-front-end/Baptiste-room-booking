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

### 2026-10-27 - Correction disponibilité et cohérence TypeORM (backend, séance 13)

- **Outil** : Claude Code, dans le terminal
- **Objectif** : regrouper les problèmes de migration PostgreSQL, de filtres de salles et de disponibilité.
- **Demande** : analyser la cohérence du backend avec le contrat OpenAPI, puis produire des prompts correctifs regroupés par type.
- **Résultat** : trois spécifications ont été préparées : rendre la migration initiale exécutable sur une base vierge (`uuid_generate_v4()` et extension PostgreSQL), faire respecter à `RoomsService.list` les filtres `date`, `startTime`, `endTime` et `available`, puis clarifier le modèle de disponibilité afin de ne pas perdre les créneaux indisponibles.
- **Erreurs de l'IA relevées** : le contrat OpenAPI a été traité comme une référence et non comme une vérité absolue ; les comportements ambigus de disponibilité doivent être confirmés avant de modifier l'API.
- **Vérification** : analyse et prompts produits ; aucune correction de code ni migration exécutée dans cette session.
- **Ce que j'en retiens** : une validation DTO ne suffit pas si les filtres ne sont pas transmis à la requête SQL et si la sémantique métier n'est pas cohérente avec les données persistées.

### 2026-10-27 - Modules Users, Payments et Administration (backend, séance 12)

- **Outil** : Claude Code, dans le terminal
- **Objectif** : identifier et regrouper les modules et routes contractuelles absentes du backend.
- **Demande** : séparer les problèmes en epics/specs et fournir plusieurs prompts correctifs regroupant les problèmes de même nature.
- **Résultat** : trois spécifications ont été préparées : module Users (`/users` et `/users/{userId}`), module Payments (`/payments` et `/payments/{paymentId}`), puis opérations d'administration (`/admin/reservations` et `/admin/statistics`). Les prompts demandent les DTOs, providers, validation, autorisation, tests et le câblage NestJS nécessaires.
- **Erreurs de l'IA relevées** : l'implémentation d'un prestataire de paiement externe n'a pas été inventée ; le prompt prévoit une interface explicite si la dépendance manque. Les champs OpenAPI sans données métier suffisantes doivent être signalés plutôt que complétés arbitrairement.
- **Vérification** : spécifications et prompts produits ; aucune implémentation ni test d'exécution dans cette session.
- **Ce que j'en retiens** : une route déclarée dans le contrat ne suffit pas : il faut vérifier le module, le provider, l'autorisation persistée et la protection des données sensibles comme `passwordHash`.

### 2026-10-27 - Authentification réelle et identité utilisateur (backend, séance 11)

- **Outil** : Claude Code, dans le terminal
- **Objectif** : remplacer les fixtures d'authentification par un flux réel et propager l'identité authentifiée dans les routes métier.
- **Demande** : préparer les corrections de l'EPIC « Fiabiliser authentification et identité utilisateur ».
- **Résultat** : trois spécifications ont été préparées : implémenter `POST /auth/login` avec `LoginDto`, vérification du mot de passe et JWT ; brancher `me`, `logout` et le changement de mot de passe sur le guard et l'utilisateur courant ; retirer `userFixture.id` des flux rooms/réservations et tester l'isolation entre utilisateurs.
- **Erreurs de l'IA relevées** : les fixtures ont été identifiées comme dangereuses dans les chemins de production ; elles doivent rester limitées aux tests. Les erreurs 401, la révocation de token et les règles de propriété doivent être vérifiées explicitement, pas seulement déduites du contrat.
- **Vérification** : prompts et périmètre produits ; aucune correction de code ni test d'authentification exécuté dans cette session.
- **Ce que j'en retiens** : la présence d'un `AuthGuard` global ne garantit pas que les services utilisent effectivement l'identité de la requête.

### 2026-10-27 - Audit ORM du backend et découpage des corrections (backend, séance 10)

- **Outil** : Claude Code, dans le terminal
- **Objectif** : vérifier la propreté de la couche ORM backend, les décorateurs, services, providers et routes en les comparant au contrat OpenAPI.
- **Demande** : « vérifie côté backend que la partie type ORM soit propre, détecte incohérence de code, manque de decorator, services, provider nécessaire, routes manquantes », puis séparer les soucis en epics/specs.
- **Résultat** : l'audit a été structuré en trois epics : authentification et identité utilisateur, modules/routes contractuelles manquantes, puis cohérence TypeORM/migration/disponibilité. Les sessions suivantes ont produit les prompts correctifs détaillés pour ces trois axes.
- **Erreurs de l'IA relevées** : le contrat OpenAPI peut être incomplet ou erroné ; les écarts ont donc été formulés comme points à confirmer et non comme corrections automatiques. Cette session n'a pas modifié le code.
- **Vérification** : audit et découpage réalisés ; aucun changement de fichier ni test d'exécution dans cette session.
- **Ce que j'en retiens** : séparer l'audit, la spécification et l'implémentation évite de transformer directement une incohérence détectée en comportement potentiellement incorrect.

### 2026-10-07 - Optimisation des performances Lighthouse (séance 9)

- **Outil** : Claude Code (Claude Opus 5.5), dans le terminal
- **Objectif** : analyser les problèmes Lighthouse restants sur `/rooms/` et améliorer le chargement de l'image LCP, le poids des images et le chemin critique.
- **Demande** : « Trouve l'origine des manques de performance, puis optimise », à partir d'un rapport indiquant FCP à 1,4 s, LCP à 3,6 s, TBT à 30 ms et CLS à 0.
- **Résultat** : plusieurs corrections ont été appliquées : réduction des résolutions d'images de `[400, 800, 1200, 1600]` à `[400, 800, 1200]`, images critiques en `loading="eager"` avec `fetchpriority="high"`, correction du dimensionnement responsive des cartes et suppression du `manifest.json` inutile du chemin critique. Un preload d'image testé a été retiré car il pouvait provoquer un double téléchargement ; le preconnect inutile vers `picsum.photos` a également été supprimé.
- **Erreurs de l'IA relevées** :
  - le premier preload proposé ne reprenait pas le `srcset`/`sizes` généré et pouvait dégrader les performances ;
  - un premier diagnostic a attribué trop rapidement le problème au JavaScript inutilisé, alors que le principal problème concernait les images ;
  - certaines modifications ont d'abord été bloquées par l'absence d'autorisation interactive.
- **Vérification** : build Qwik/Vite, TypeScript, ESLint et 10 tests ciblés passés. Le chunk JavaScript principal reste un point signalé par Lighthouse, mais sa suppression risquerait de casser des composants interactifs.
- **Ce que j'en retiens** : comparer les audits avec le HTML SSR et les requêtes réellement chargées avant de conserver un preload ou un preconnect.

### 2026-10-07 - Correction TypeScript dans Storybook (séance 8)

- **Outil** : Claude Code (Claude Opus 5.5), dans le terminal
- **Objectif** : corriger l'erreur `TS7006` sur le paramètre `props` d'une story du composant `Button`.
- **Demande** : corriger l'erreur d'implicite `any` affichée pendant le build et vérifier le frontend.
- **Résultat** : le paramètre de `render` dans `src/components/button/button.stories.tsx` a été typé avec le `ButtonProps` existant, sans ajouter de cast ni de dépendance.
- **Erreurs de l'IA relevées** : aucune erreur technique relevée sur cette correction ciblée.
- **Vérification** : `pnpm typecheck` et `pnpm lint` passent. La vérification finale confirme que le changement attendu est le seul changement de cette session.
- **Ce que j'en retiens** : réutiliser les types déjà déclarés dans le composant est préférable à un `any` ou à un nouveau type local.

### 2026-10-07 - Corrections Lighthouse et build frontend (séance 7)

- **Outil** : Claude Code (Claude Opus 5.5), dans le terminal
- **Objectif** : diagnostiquer les problèmes de build et appliquer les optimisations Lighthouse concernant les images des cartes de salles.
- **Demande** : corriger la découverte de l'image LCP, ajouter les attributs de priorité, les tailles responsive et les preconnects, puis vérifier et pousser les changements.
- **Résultat** : les cartes ont conservé le lazy-loading hors écran ; la première image est chargée en priorité, avec `sizes` adapté, et les preconnects CDN ont été ajoutés. Le build a ensuite été validé. La session a aussi traité des commits, le push et des blocages de hooks ESLint/Prettier liés à Storybook et aux plugins de configuration.
- **Erreurs de l'IA relevées** :
  - une correction de preconnect n'a pas été incluse dans le premier commit à cause d'un patch mal formé ;
  - le hook a révélé des problèmes de configuration non anticipés pour les fichiers `.storybook` et le plugin Prettier ;
  - l'IA a proposé des modifications de configuration plus larges que la correction Lighthouse initiale, qu'il fallait distinguer du besoin principal.
- **Vérification** : build, type-check et lint finalement passés ; 10 tests ciblés passés. Les modifications ont été isolées autant que possible des changements préexistants.
- **Ce que j'en retiens** : vérifier le diff et les hooks avant chaque commit, surtout quand le dépôt contient déjà des changements non liés.

### 2026-10-07 - Diagnostic du build pnpm (séance 6)

- **Outil** : Claude Code (Claude Opus 5.5), dans le terminal
- **Objectif** : comprendre pourquoi `pnpm build` semblait échouer pendant l'étape ESLint.
- **Demande** : « Pourquoi soucis au pnpm build », puis demande de la commande pour lancer le build localement.
- **Résultat** : le message `^C` indiquait une interruption du processus, pas une erreur ESLint. Le build complet exécute le type-check, le build client puis le lint ; la commande de vérification est `pnpm build` depuis le frontend, ou `pnpm --filter @room-booking/frontend build` depuis la racine.
- **Erreurs de l'IA relevées** : l'explication initiale a dû être confirmée par une exécution réelle, car un lint silencieux peut donner l'impression d'être bloqué.
- **Vérification** : ESLint traite 92 fichiers et termine sans erreur ; le build affiche `Built client modules`, `Type checked` et `Lint checked`. Le message `Missing an integration` de Qwik est un avertissement, pas un échec.
- **Ce que j'en retiens** : distinguer une interruption (`^C`) d'une erreur de compilation et attendre la fin d'une étape de lint silencieuse.

### 2026-10-07 - Fonction de gestion des demandes de réservation (séance 5)

- **Outil** : Claude Code (Claude Opus 5.5), dans le terminal
- **Objectif** : implémenter l'écran de gestion des demandes de réservation (`/manage/requests`) et sécuriser les actions côté serveur.
- **Demande** : réaliser l'issue #28 avec les demandes en attente et traitées, la confirmation, le refus avec motif facultatif et les messages d'erreur.
- **Résultat** : l'écran, le découpage des demandes, la résolution des utilisateurs et les actions de confirmation/refus ont été ajoutés. Les actions vérifient que la salle appartient bien au gestionnaire avant d'agir et gèrent notamment le conflit HTTP 409.
- **Erreurs de l'IA relevées** :
  - la session s'est arrêtée sur une limite d'usage alors que la vérification manuelle et le commit restaient à faire ;
  - le mock Prism ne conservant pas l'état, une confirmation ne disparaît pas réellement après rafraîchissement ;
  - l'IA a signalé un board déjà à jour et n'a pas modifié les issues sans demande explicite.
- **Vérification** : type-check, lint, `pnpm check` (format et 271 tests) et build passent. Aucun commit n'a été créé.
- **Ce que j'en retiens** : compléter les tests automatisés par une vérification manuelle avec le comportement réel de l'API, surtout quand le mock ne persiste pas les mutations.

### 2026-10-07 - Méta description SEO globale (séance 4)

- **Outil** : Claude Code (Claude Opus 5.5), dans le terminal
- **Objectif** : corriger l'audit Lighthouse « Document does not have a meta description ».
- **Demande** : vérifier la configuration Qwik City et ajouter une description sans créer de doublons.
- **Résultat** : une description globale a été ajoutée dans `src/components/router-head/router-head.tsx`, afin qu'elle soit rendue sur les pages qui ne définissent pas de description spécifique.
- **Erreurs de l'IA relevées** :
  - le type-check demandé n'a pas pu être exécuté à deux reprises, l'environnement refusant l'autorisation shell interactive ;
  - la validation finale a donc été statique pour cette partie, et non une validation complète par commande.
- **Vérification** : la présence de `meta[name="description"]` et de la constante `SITE_DESCRIPTION` a été confirmée en lecture seule. La commande de build proposée est `pnpm build`.
- **Ce que j'en retiens** : ne pas présenter une vérification statique comme un test d'exécution réussi lorsque l'environnement bloque la commande.

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
