# Dev Container Setup

This project includes a fully configured VS Code Dev Container that provides a consistent development environment.

## 🚀 Getting Started

### Prerequisites

- [VS Code](https://code.visualstudio.com/)
- [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
- [Docker](https://www.docker.com/get-started)

### Opening in Dev Container

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd kanban-portfolio
   ```

2. **Open in VS Code:**

   ```bash
   code .
   ```

3. **When prompted, click "Reopen in Container"** or use Command Palette:
   - `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
   - Type: "Dev Containers: Reopen in Container"

4. **Wait for the container to build** (first time may take a few minutes)

## 🛠️ What's Included

### Development Tools

- **Node.js 20** with npm and yarn
- **TypeScript** with full IntelliSense
- **ESLint** and **Prettier** for code quality
- **Git** with GitHub CLI integration
- **Docker-in-Docker** for container operations

### VS Code Extensions

- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **Tailwind CSS IntelliSense** - CSS framework support
- **TypeScript Importer** - Smart imports
- **GitLens** - Enhanced Git capabilities
- **GitHub Pull Requests** - PR management
- **Test Explorer** - Test running and debugging
- **Todo Tree** - Task management
- **Docker** - Container management
- **Git Graph** - Visual Git history
- **Copilot** - AI-powered code assistance

### Port Forwarding

- **3000** - Next.js development server
- **6006** - Storybook development server
- **54321** - Supabase local development

## 📋 Available Scripts

Once in the container, you can run:

```bash
# Development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test
npm run test:unit
npm run test:integration

# Lint and format code
npm run lint

# Storybook
npm run storybook

# Database operations
npm run db:migrate
npm run db:reset
```

## 🔧 Configuration

### Environment Variables

Copy `.env.local.example` to `.env.local` and configure:

```bash
cp .env.local.example .env.local
```

Required environment variables:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk authentication
- `CLERK_SECRET_KEY` - Clerk server-side key
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service key

### Supabase Local Development

The container includes Supabase CLI. To start local Supabase:

```bash
# Initialize (first time only)
supabase init

# Start local Supabase
supabase start

# Access at http://localhost:54321
```

## 🐛 Troubleshooting

### Container Won't Build

- Ensure Docker is running
- Try rebuilding: `Ctrl+Shift+P` → "Dev Containers: Rebuild Container"

### Port Conflicts

- Check if ports 3000, 6006, 54321 are available
- Modify `devcontainer.json` to use different ports if needed

### Permission Issues

- The container runs as the `node` user
- File permissions should work correctly

### Slow Performance

- Ensure Docker has adequate resources allocated
- Consider using a local volume mount for node_modules

## 📚 Additional Resources

- [Dev Containers Documentation](https://code.visualstudio.com/docs/devcontainers/containers)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Clerk Documentation](https://clerk.com/docs)

## 🤝 Contributing

When working with the dev container:

1. All dependencies are pre-installed
2. Extensions are automatically configured
3. Git hooks are set up via Husky
4. Code formatting and linting run automatically

Happy coding! 🎉
