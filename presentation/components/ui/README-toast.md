# Toast System

The toast implementation extends the shadcn/ui primitives to provide application-wide notifications with sensible defaults.

## Features
- Multiple variants (`default`, `success`, `error`, `warning`, `info`, `destructive`) with shared styling tokens.
- Auto-dismiss behaviour with configurable duration and persistent toasts when duration is `Infinity`.
- Screen-reader friendly announcements and keyboard accessible actions.
- Utility helpers for the most common notification patterns.

## Key files
- `toast.tsx` – variant definitions and base Radix bindings.
- `toaster.tsx` – viewport container rendered once inside `app/layout.tsx`.
- `presentation/hooks/use-toast.ts` – client hook exposing the `toast` dispatcher and convenience helpers.
- `presentation/utils/toast.ts` – typed helpers (`success`, `error`, `warning`, `info`) used across the app.

## Basic usage
```tsx
import { toast } from '@/presentation/hooks/use-toast';

toast({
  title: 'Saved',
  description: 'Your project has been stored successfully.',
  variant: 'success',
});
```

### Using helpers
```tsx
import { success, error } from '@/presentation/utils/toast';

success('Project saved', 'Your changes are now live.');
error('Save failed', 'Please try again in a few seconds.');
```

### Updating an existing toast
```tsx
const { toast } = useToast();
const { id } = toast({ title: 'Syncing...', duration: Infinity });

// Later…
toast({ id, title: 'Done', description: 'All items are up to date.', variant: 'success' });
```

## Configuration
- Default duration is 5000 ms. Override per toast with the `duration` option.
- Provide a `ToastAction` component for inline confirmation flows.
- The toaster viewport is mounted once in `app/layout.tsx`; no additional wiring is needed.

## Accessibility
- Toasts announce updates to assistive technologies.
- Focus remains in the calling context unless an action requires user interaction.
- Keyboard users can dismiss toasts with Escape and interact with action buttons.

Keep toast copy short and actionable, and prefer success/neutral variants unless a destructive action occurred.
