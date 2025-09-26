# UI Components

This folder contains only **shadcn/ui components**. These are the base UI primitives that form the foundation of our design system.

## Policy

🚫 **DO NOT add custom components to this folder**

This folder is reserved exclusively for:

- shadcn/ui components (installed via `npx shadcn-ui@latest add <component>`)
- Modifications to existing shadcn/ui components for our specific needs
- Component variants and customizations that extend shadcn/ui components

## What Belongs Here

✅ **Allowed:**

- Base shadcn/ui components (`button.tsx`, `input.tsx`, `dialog.tsx`, etc.)
- Custom variants of shadcn/ui components
- Theme customizations for shadcn/ui components
- Accessibility improvements to shadcn/ui components

## What Does NOT Belong Here

❌ **NOT Allowed:**

- Business logic components
- Feature-specific components
- Page components
- Layout components
- Custom composite components
- Domain-specific components

## Where to Put Other Components

### Feature Components

```
presentation/components/features/
├── board/
├── forms/
└── ...
```

### Shared/Reusable Components

```
presentation/components/shared/
├── ProtectedRoute.tsx
├── logout-button.tsx
└── ...
```

### Layout Components

```
presentation/components/layout/
```

## Installation

To add a new shadcn/ui component:

```bash
npx shadcn-ui@latest add <component-name>
```

Example:

```bash
npx shadcn-ui@latest add accordion
npx shadcn-ui@latest add alert-dialog
```

## Customization

When customizing shadcn/ui components:

1. Keep the original component structure
2. Add our design tokens and variants
3. Maintain TypeScript types
4. Update this README if adding new variants

## Current Components

- `avatar.tsx` - User avatar component
- `badge.tsx` - Status and label badges
- `breadcrumb.tsx` - Navigation breadcrumbs
- `button.tsx` - Interactive buttons with variants
- `card.tsx` - Content containers
- `carousel.tsx` - Image/content carousels
- `collapsible.tsx` - Expandable content
- `dialog.tsx` - Modal dialogs
- `dropdown-menu.tsx` - Dropdown menus
- `input.tsx` - Form input fields
- `separator.tsx` - Visual separators
- `sheet.tsx` - Slide-out panels
- `sidebar.tsx` - Navigation sidebars
- `skeleton.tsx` - Loading placeholders
- `tabs.tsx` - Tabbed interfaces
- `textarea.tsx` - Multi-line text inputs
- `toast.tsx` - Toast notifications
- `toaster.tsx` - Toast container
- `tooltip.tsx` - Hover tooltips

## Related Documentation

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Toast System](./README-toast.md) - Detailed toast documentation
- [Presentation Layer Requirements](../PRESENTATION_LAYER_REQUIREMENTS.md)
