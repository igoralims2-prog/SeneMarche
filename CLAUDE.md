# CLAUDE.md — SenéMarché

> Fichier de contexte lu par Claude Code à chaque session. À garder à jour
> au fur et à mesure que le projet évolue.

## Le projet

SenéMarché est une marketplace de petites annonces (type LeBonCoin) pour le
marché sénégalais. Les utilisateurs publient des annonces avec photos,
échangent par messagerie, et paient via mobile money (Wave, Orange Money).
Application web responsive, installable en PWA. Équipe de 2 développeurs.

## Stack technique

- **Framework** : Next.js (App Router) + TypeScript (mode strict)
- **Style** : Tailwind CSS + shadcn/ui
- **Backend** : pas de serveur séparé — on utilise les API routes / server
  actions de Next.js
- **Base de données / Auth / Stockage / Temps réel** : Supabase (PostgreSQL)
- **Paiements** : agrégateur mobile money (PayTech / PayDunya / DEXchange)
  couvrant Wave + Orange Money. Wave Business en direct envisageable plus tard.
- **PWA** : installable, pensée mobile-first
- **Hébergement** : Vercel (front) + Supabase (back)

## Fonctionnalités

Comptes utilisateurs + OTP, annonces (création/édition/suppression, photos,
catégories, recherche et filtres), favoris, messagerie acheteur/vendeur en
temps réel, portefeuille (wallet), paiements Wave + Orange Money.

## Conventions de code

- TypeScript strict ; pas de `any` sans raison justifiée.
- Exports nommés (pas d'`export default`), sauf pages/layouts Next.js.
- Composants fonctionnels uniquement, avec Hooks.
- `async/await`, jamais de chaînes `.then()`.
- Composants < 150 lignes ; au-delà, on découpe.
- Fichiers en `kebab-case`, composants en `PascalCase`.
- Interface utilisateur en français. Commentaires en français acceptés.

## Structure du projet

- `src/app/` — routes, layouts, pages (App Router)
- `src/components/` — composants UI réutilisables
- `src/lib/` — utilitaires, client Supabase, helpers
- `src/server/` — logique côté serveur (actions, accès aux données)
- `supabase/migrations/` — migrations SQL versionnées

## Base de données (Supabase)

- **Toujours** activer le Row Level Security (RLS) sur chaque table.
- Toute modification de schéma passe par une migration SQL versionnée — jamais
  à la main dans le dashboard.
- Le client navigateur utilise uniquement la clé `anon`. La clé `service_role`
  ne touche **jamais** le front.

## Sécurité (non négociable)

- Aucun secret committé. Tout dans `.env.local` (ignoré par git).
- Un `.env.example` avec des valeurs bidon documente les variables attendues.
- Ne jamais logguer de secret ni de donnée personnelle.

## Git & collaboration (2 développeurs)

- Branche `main` protégée : aucun push direct.
- Travail sur des branches `feature/...`, fusion via Pull Request relue par
  l'autre développeur.
- Commits petits et fréquents, avec des messages clairs.
- On se répartit des fonctionnalités différentes pour éviter de modifier les
  mêmes fichiers en même temps.

## Commandes

- `npm run dev` — serveur de développement
- `npm run build` — build de production
- `npm run lint` — vérification du code

> Ces commandes seront confirmées une fois le projet initialisé.
