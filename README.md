# Kanban Portfolio

[![CI/CD](https://github.com/BryonDevelops/kanban-portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/BryonDevelops/kanban-portfolio/actions/workflows/ci.yml)
[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com)

A modern, full-stack Kanban board application built with Next.js 15, TypeScript, and Supabase. Features include user authentication, admin functionality, dark/light theme support, and a clean, responsive UI.

## Features

- ✅ **User Authentication** - Secure authentication with Clerk
- ✅ **Admin Dashboard** - Protected admin routes and functionality
- ✅ **Dark/Light Theme** - Complete theme system with system preference detection
- ✅ **Kanban Board** - Drag-and-drop task management
- ✅ **Responsive Design** - Mobile-first design with Tailwind CSS
- ✅ **Type-Safe** - Full TypeScript implementation
- ✅ **Database Integration** - Supabase for data persistence
- ✅ **Component Library** - shadcn/ui components

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS with dark mode support
- **UI Components**: shadcn/ui
- **Authentication**: Clerk
- **Database**: Supabase
- **Theme Management**: next-themes
- **Testing**: Jest, React Testing Library
- **Code Quality**: ESLint, Prettier

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Clerk account

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd kanban-portfolio
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.local.example .env.local
```

Fill in your environment variables:

- Clerk keys
- Supabase URL and keys
- Other required configuration

4. Run database migrations:

```bash
npm run migrate
```

5. Start the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js app router pages
├── domain/                 # Domain layer (entities, repositories, schemas)
├── infrastructure/         # Infrastructure layer (database, external APIs)
├── presentation/           # Presentation layer (components, hooks, stores)
├── services/               # Application services
├── tests/                  # Test suites
└── lib/                    # Shared utilities and dependency injection
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm test` - Run Jest tests
- `npm run lint` - Run ESLint
- `npm run migrate` - Run database migrations

## Theme System

The application includes a complete dark/light theme system:

- **Light Mode**: Clean, bright interface
- **Dark Mode**: Easy on the eyes for extended use
- **System Preference**: Automatically detects and follows system theme
- **Persistent**: Theme choice is saved and restored on reload

Toggle themes using the theme switcher in the top navigation bar.

## Authentication

- **Public Routes**: Landing page, board view (read-only)
- **Protected Routes**: Admin dashboard, task management
- **Role-Based Access**: Admin users have additional functionality

## Contributing

1. Create a feature branch
2. Make your changes
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

This project is licensed under the MIT License.
