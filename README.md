
# Kanban Portfolio

This is a Kanban board app built with [Next.js](https://nextjs.org), [Supabase](https://supabase.com), [Tailwind CSS](https://tailwindcss.com), [Zustand](https://zustand-demo.pmnd.rs/), [Jest](https://jestjs.io/), and [Cypress](https://www.cypress.io/).

## Tech Stack

- **Next.js**: React framework for building web apps
- **Supabase**: Global persistence and authentication
- **Tailwind CSS**: Utility-first CSS framework
- **Zustand**: State management
- **Jest**: Unit testing
- **Cypress**: End-to-end testing

## Clean Architecture

The project follows Clean Architecture principles:
- `domain/`: Domain models and types
- `services/`: Business logic and orchestration
- `infrastructure/`: Data access (Supabase)
- `components/`: UI components
- `stores/`: State management

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

## Getting Started

1. Install dependencies:
	```bash
	npm install
	```
2. Set up environment variables in `.env.local`:
	```env
	NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
	NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
	```
3. Run the development server:
	```bash
	npm run dev
	```
4. Open [http://localhost:3000](http://localhost:3000)


## Testing & Git Hooks

- **Unit tests**: `npm test` (Jest)
- **E2E tests**: `npx cypress open` (Cypress)
- **Husky**: Pre-commit hook runs `npm run lint` and `npm test` automatically before every commit to ensure code quality.


## Continuous Integration

This project uses **GitHub Actions** for CI:
- Automatically runs lint, unit tests (Jest), and end-to-end tests (Cypress) on every push and pull request to `main`.
- See `.github/workflows/ci.yml` for configuration.

## Deployment

Deploy easily on [Vercel](https://vercel.com/) or your preferred platform.
