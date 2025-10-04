# Presentation Layer

The presentation layer owns all UI concerns for the portfolio. It is built with Next.js 15 App Router components, Tailwind CSS, and shadcn/ui primitives while delegating business logic to the `domain/` and `services/` layers.

## Directory structure
```
presentation/
|- components/
|  |- features/    # Feature-specific UI (board, projects, microblog, admin)
|  |- layout/      # Shell components, navigation, top bar, background effects
|  |- shared/      # Reusable building blocks (cards, badges, forms, tech stack)
|  |- ui/          # shadcn/ui primitives and thin wrappers
|- hooks/          # Reusable client hooks (viewport sizing, toast, scroll state)
|- stores/         # Zustand stores scoped per feature (board, admin, microblog)
|- styles/         # Tailwind tokens and CSS modules
|- utils/          # Presentation-only helpers
```

## Key concepts
- **Server-first rendering**: Pages in `app/` lean on React Server Components while client components handle interactivity (`"use client"` at the leaf).
- **shadcn/ui design system**: Base primitives live in `components/ui`. Only shadcn-derived components belong there; feature-specific compositions belong in `components/features` or `components/shared`.
- **Global layout**: `app/layout.tsx` wires providers (Clerk, Theme, Toaster, Sidebar) and ensures consistent theming.
- **State management**: Zustand stores in `presentation/stores` manage client-state (board drag-and-drop, admin filters, microblog editors) with selectors to minimise re-renders.
- **Feature toggles**: Components read from `lib/feature-flags` so sections can be disabled without code changes.

## Styling
- Tailwind CSS is the primary styling mechanism; class names remain colocated with JSX.
- Additional effects such as animated backgrounds and gradients live in dedicated components (`shared/heavy-background-effects`, etc.) to keep pages focused.
- Theme switching uses `next-themes` with persistence and supports system preferences.

## Testing & Storybook
- Presentation-specific unit tests live under `tests/presentation` and use React Testing Library with JSDOM.
- Storybook stories (`tests/presentation/storybook`) document core components and serve as a foundation for visual regression testing.
- Run `npm run test:presentation` or `npm run storybook` during UI development.

## Guidelines for new components
1. Decide whether the component is a base primitive (`components/ui`), a reusable piece (`components/shared`), or feature specific (`components/features/<feature>`).
2. Keep business rules out of presentation code. Fetch data via services or pass it in from server components.
3. Ensure accessibility: use semantic markup, ARIA attributes, and keyboard-friendly interactions.
4. Co-locate component tests next to the feature in `tests/presentation`.
