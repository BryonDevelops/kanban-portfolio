
# Kanban Portfolio

This is a Kanban board app built with [Next.js](https://nextjs.org), [Supabase](https://supabase.com), [Tailwind CSS](https://tailwindcss.com), [Zustand](https://zustand-demo.pmnd.rs/), [Jest](https://jestjs.io/), and [Cypress](https://www.cypress.io/).

## Tech Stack

- **Next.js 15 (App Router)**: Core framework and routing
- **React 19**: UI library
- **Tailwind CSS v4**: Utility-first styling
- **React DnD**: Drag-and-drop for cards/columns
- **Zustand**: Lightweight state management
- **Supabase**: Database + Auth; includes Supabase Auth UI
- **Jest + Testing Library**: Unit/integration tests on jsdom
- **ts-jest**: TypeScript transformer for Jest (with `tsconfig.jest.json`)
- **Cypress**: E2E tests in real browser
- **Storybook (@storybook/nextjs)**: Component docs and playground
- **GitHub Actions**: CI for lint, unit, and E2E tests
- **Dev Container**: Reproducible dev environment in VS Code
- **Husky**: Pre-commit hook for lint and tests

## Clean Architecture

Project structure follows separation of concerns:
- `domain/`: Core domain types (e.g., `Task`)
- `services/`: Orchestrates domain operations (`BoardService`)
- `infrastructure/`: External integrations (e.g., Supabase repo)
- `components/`: Presentational and interactive React components
- `stores/`: App state (Zustand store)
- `app/`: Next.js App Router pages and API routes

## Supabase Integration

- Board data is persisted globally in Supabase
- Only authenticated users (you) can edit the board
- Visitors can view the board
- Row-Level Security (RLS) is enabled for secure access

### Table Schema Example

| Column      | Type    | Description                  |
|------------ | ------- |-----------------------------|
| id          | text    | Primary key                  |
| title       | text    | Task title                   |
| description | text    | Task description             |
| status      | text    | Column id ("ideas", etc.)    |
| order       | int     | Sort order                   |
| user_id     | uuid    | Owner (optional)             |

### RLS Policies
- **SELECT**: Allow public
- **INSERT/UPDATE/DELETE**: Only owner or authenticated user

## Local Development

1. Install dependencies
   ```bash
   npm install
   ```
2. Environment variables (`.env.local`)
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
3. Start the app
   ```bash
   npm run dev
   ```
4. Visit http://localhost:3000

## Scripts

- `dev`: start Next dev server
- `build`: production build
- `start`: start production server
- `lint`: Next.js ESLint
- `test`: Jest test runner
- `test:watch`: Jest in watch mode
- `cypress`: Open Cypress runner
- `cypress:run`: Run Cypress headlessly
- `storybook`: Start Storybook on :6006
- `build-storybook`: Build static Storybook

## Testing

- Jest runs on **jsdom** with Testing Library.
- Custom setup at `jest.setup.ts` loads `@testing-library/jest-dom`.
- TypeScript is compiled for tests using **ts-jest** with `tsconfig.jest.json`.

## Continuous Integration

GitHub Actions workflow (`.github/workflows/ci.yml`) installs dependencies, runs Jest, and executes Cypress against the dev server. The workflow is currently configured to trigger on `main` (adjust to your default branch if needed).

## Storybook

Storybook is configured with `@storybook/nextjs` (Webpack). Use it to build and document components in isolation.

## Dev Container

The `.devcontainer/` setup provides a reproducible environment (Node 18, recommended extensions, and forwarded port 3000).

## Deployment

Deploy on [Vercel](https://vercel.com/) or your preferred platform.
