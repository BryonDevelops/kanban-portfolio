# Dev Container Guide

This repository ships with a ready-to-go VS Code Dev Container so you can clone the project on any machine and start coding within minutes.

## Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Visual Studio Code](https://code.visualstudio.com/)
- [Dev Containers Extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

## First-Time Setup
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kanban-portfolio
   ```
2. **Review environment templates**
   - Copy `.env.local.example` to `.env.local` and fill in the values you have (see the table below).
   - Copy `.devcontainer/devcontainer.env.example` to `.devcontainer/devcontainer.env` and add any secrets that must be injected during container bootstrap (e.g. `TIPTAP_PRO_TOKEN`). The file is gitignored.
3. **Open VS Code**
   ```bash
   code .
   ```
4. **Reopen in container** when prompted (`Ctrl+Shift+P` ? *Dev Containers: Reopen in Container* if VS Code does not prompt automatically).
5. Wait for the container build to finish. The `post-create` script will install dependencies, enable Husky hooks, and ensure Playwright browsers are available.

## What's Inside
| File | Purpose |
| ---- | ------- |
| `.devcontainer/devcontainer.json` | Container definition, VS Code settings, forwarded ports, and lifecycle hooks. |
| `.devcontainer/Dockerfile` | Image based on `typescript-node:20` with browser/testing libs, Supabase CLI, and Git LFS. |
| `.devcontainer/devcontainer.env.example` | Template for secrets that must exist before `npm install` (e.g. `TIPTAP_PRO_TOKEN`). |
| `.devcontainer/scripts/post-create.sh` | Bootstraps the workspace after the container is created. |

The container forwards:
- `3000` ? Next.js dev server
- `6006` ? Storybook
- `54321` ? Supabase CLI local stack

## Environment Variables
### `.env.local`
Populate this file for Next.js runtime variables. The most common keys are:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `SANITY_AUTH_TOKEN`
- `SANITY_PREVIEW_SECRET`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_UNSPLASH_ACCESS_KEY`
- Feature flag toggles such as `NEXT_PUBLIC_FEATURE_BOARD`
- Optional Tiptap collaboration/AI values (`NEXT_PUBLIC_TIPTAP_*`)
- Optional email settings (`SENDGRID_API_KEY`, `SENDGRID_SENDER_EMAIL`, `CONTACT_RECIPIENT`)

### `.devcontainer/devcontainer.env`
Values in this file are exported before `npm install`. Use it for secrets that the build needs but you do not want checked into `.env.local`, for example:
- `TIPTAP_PRO_TOKEN` (required to download packages from the Tiptap Pro registry)
- `SUPABASE_SERVICE_ROLE_KEY` if you want `npm run db:*` to work inside the container without sourcing `.env.local`
- Any other env that should temporarily override the shell while bootstrapping

Both templates are ASCII files so they can be versioned safely without encoding surprises.

## Common Workflows
Inside the container you can run:
```bash
npm run dev          # Start Next.js on port 3000
npm run storybook    # Storybook on port 6006
npm run db:migrate   # Apply Supabase migrations (requires SUPABASE_SERVICE_ROLE_KEY)
npm run lint         # ESLint checks
npm test             # Run Jest
```

### Supabase Local Stack
The Supabase CLI is installed. Launch the local stack after the container starts:
```bash
supabase start
```
The post-create script does not start services automatically?you control when to spin them up.

## Troubleshooting
- **Missing `TIPTAP_PRO_TOKEN`**: `npm install` will fail with 403 errors. Add the token to `.devcontainer/devcontainer.env` and rebuild the container.
- **Port conflicts**: Stop any process binding ports 3000/6006/54321 on the host.
- **Slow installs on Windows hosts**: Ensure the repo lives under the default Docker file sharing paths to avoid mount penalties.
- **Husky hooks not working**: Run `npm run prepare` manually inside the container.

Happy coding!
