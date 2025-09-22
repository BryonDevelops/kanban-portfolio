# Sidebar Configuration Guide

The sidebar navigation is now fully modular and easy to customize. Here's how to add new menu items:

## Adding New Menu Items

Edit the file `lib/config/sidebar.ts` to add new navigation items.

### Primary Navigation (Main Menu)

Add items to the `navMain` array:

```typescript
{
  title: "Your Page",
  url: "/your-page",
  icon: YourIcon, // Import from lucide-react
  description: "Brief description for tooltip"
}
```

### Secondary Navigation (Settings, Tools, etc.)

Add items to the `navSecondary` array:

```typescript
{
  title: "Settings",
  url: "/settings",
  icon: Settings,
  description: "App preferences"
}
```

## Available Icons

Import icons from `lucide-react`. Common ones include:

- `Home` - Home page
- `Bot` - About/Profile pages
- `CircuitBoard` - Projects/Tech pages
- `Mail` - Contact pages
- `Settings` - Settings pages
- `User` - Profile/Account pages

## Creating New Pages

1. Create a new directory in `app/` (e.g., `app/blog/`)
2. Add a `page.tsx` file with your page component
3. Add the route to the sidebar config
4. The sidebar will automatically show the new menu item

## Example: Adding a Blog Page

1. Create `app/blog/page.tsx`
2. Update `lib/config/sidebar.ts`:

```typescript
import { BookOpen } from "lucide-react"

// Add to navMain array:
{
  title: "Blog",
  url: "/blog",
  icon: BookOpen,
  description: "Read my latest posts"
}
```

That's it! The sidebar will automatically include your new menu item.
