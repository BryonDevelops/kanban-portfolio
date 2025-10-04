# Kanban Portfolio

[![CI/CD](https://github.com/BryonDevelops/kanban-portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/BryonDevelops/kanban-portfolio/actions/workflows/ci.yml)
[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com)

A full-stack personal portfolio and project showcase built with Next.js 15, React 19, and TypeScript. The site features a kanban board backed by Supabase, a projects showcase, a microblog, and an admin area for managing feature flags. It ships with Clerk authentication, Sanity-powered content, a PWA experience, and a reusable UI system.

## Highlights
- Production-ready kanban board with drag-and-drop columns, Supabase persistence, and optimistic updates.
- Authenticated admin workspace for managing feature flags, curated projects, and experimental features (Clerk protected).
- Projects screen that combines live Supabase data with manually curated highlights for portfolio storytelling.
- Microblog authoring pipeline with Tiptap-based editors, Supabase storage, category taxonomy, and feature toggles.
- Sanity-backed About page that pulls experience cards directly from Sanity Studio.
- Installable PWA experience with offline fallback pages, toast-driven notifications, and a shared shadcn/ui design system.

## Tech Stack
- Framework: Next.js 15 App Router, React 19, TypeScript.
- Styling: Tailwind CSS, shadcn/ui, custom motion effects, next-themes.
- Data: Supabase (PostgreSQL) via typed repositories, Sanity CMS, local feature flag registry.
- Auth & security: Clerk, middleware route protection, role-aware UI.
- Testing: Jest (unit, domain, integration, services, presentation), Playwright-ready E2E suite, Storybook for visual regression prep.
- Tooling: npm scripts, Husky, ESLint, Prettier, Supabase CLI, Storybook.

## Quick Start
1. Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/BryonDevelops/kanban-portfolio.git
   cd kanban-portfolio
   npm install
   ```
2. Copy the example environment file and fill in values:
   ```bash
   cp .env.local.example .env.local
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Visit `http://localhost:3000` to explore the application.

### Environment variables
Only the variables you enable will be used at runtime; the app gracefully falls back when optional services are missing.

| Variable | Purpose | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | Clerk authentication | Required for sign-in and admin guard rails. |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Supabase client and service access | Needed for kanban data, microblog posts, migrations, and E2E tests. |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `SANITY_AUTH_TOKEN` | Sanity CMS | Powers the About page and Studio deployments. Optional locally. |
| `SENDGRID_API_KEY`, `SENDGRID_SENDER_EMAIL`, `CONTACT_RECIPIENT` | Contact form delivery | Optional; falls back to console logging without keys. |
| `NEXT_PUBLIC_FEATURE_*` | Feature flag overrides | Defaults enable all features. |
| `TEST_SUPABASE_*` | Dedicated Supabase credentials for tests | Used by the Jest E2E suite. |

Refer to `.env.local.example` for the full list including optional AI/Tiptap and image provider tokens.

### Database and content
- Supabase migrations live in `infrastructure/database/migrations`. Run them with `npm run db:migrate` (bundled Supabase CLI) or sync manually through the Supabase dashboard.
- When testing locally without Supabase credentials the app falls back to in-memory seed data for read-only views.
- Sanity Studio lives in `studio-bryondevelops`. Start it with:
  ```bash
  cd studio-bryondevelops
  npm install
  npm run dev
  ```
  Deployments are documented in `SANITY_DEPLOYMENT_README.md`.

## Scripts
| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server. |
| `npm run build` / `npm run start` | Build and serve the production bundle. |
| `npm run lint` | Run ESLint against the monorepo. |
| `npm run test:unit` / `test:domain` / `test:services` / `test:presentation` / `test:integration` / `test:e2e` | Run the respective Jest test suites. |
| `npm run storybook` | Launch Storybook for the presentation layer. |
| `npm run analyze-bundle` | Inspect bundle output. |
| `npm run db:migrate` / `npm run db:reset` | Apply or reset Supabase migrations (requires configured credentials). |
| `npm run cypress` | Open the Cypress runner (optional E2E experiments). |

## Project layout
```
kanban-portfolio/
|- app/                  # Next.js routes, API handlers, layout composition
|- domain/               # Framework-agnostic entities, schemas, repository contracts
|- infrastructure/       # Supabase access, external API clients, migrations
|- presentation/         # UI components, stores, hooks, utilities
|- services/             # Application services orchestrating domain + infrastructure
|- lib/                  # Shared helpers (feature flags, logging, DI, tiptap)
|- tests/                # Multi-layer Jest suites, fixtures, configs
|- scripts/              # Build and analysis helpers
|- studio-bryondevelops/ # Sanity Studio workspace
```

## Testing
- Unit, domain, service, and presentation suites run with Jest and Testing Library (`npm run test:unit`, `test:domain`, etc.).
- Integration tests validate Supabase repositories with controlled fixtures (`npm run test:integration`).
- E2E tests target real Supabase instances and require `TEST_SUPABASE_*` credentials (`npm run test:e2e`).
- Storybook and Chromatic-ready stories exist under `tests/presentation/storybook`.

See `tests/README.md` for coverage expectations and detailed tooling guidance.

## Documentation
- `ADMIN_SETUP.md` – Clerk onboarding, admin routes, and seed scripts.
- `FEATURE_FLAGS.md` – How runtime feature toggles are defined and consumed.
- `PWA_README.md` – Service worker behaviour, offline strategy, and install prompt.
- `SANITY_DEPLOYMENT_README.md` – Deploying the Sanity Studio and wiring env vars.

## License
This project is released under the MIT License.
