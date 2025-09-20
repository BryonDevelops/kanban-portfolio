# Toast System

A comprehensive toast notification system built with Radix UI and integrated with the presentation layer.

## Features

- ✅ Multiple toast variants (success, error, warning, info, default)
- ✅ Auto-dismiss functionality
- ✅ Accessible with screen reader support
- ✅ Customizable duration and styling
- ✅ TypeScript support
- ✅ Clean API for easy usage

## Components

### Core Components

- `Toast` - Individual toast component
- `ToastProvider` - Context provider for toast state
- `ToastViewport` - Container for positioning toasts
- `Toaster` - Main component that renders all active toasts

### Hook

- `useToast()` - Hook for programmatic toast management

### Utilities

- `toastUtils` - Pre-configured toast functions for common use cases

## Usage

### Basic Usage

```tsx
import { success, error, warning, info } from "@/presentation/utils/toast";

// Success toast
success("Project saved!", "Your changes have been saved successfully.");

// Error toast
error("Failed to save", "Please check your connection and try again.");

// Warning toast
warning("Unsaved changes", "You have unsaved changes that will be lost.");

// Info toast
info(
  "New feature available",
  "Check out the latest updates in your dashboard."
);
```

### Advanced Usage with Hook

```tsx
import { useToast } from "@/presentation/hooks/use-toast";

function MyComponent() {
  const { toast } = useToast();

  const handleAction = () => {
    // Show loading toast
    const { id } = toast({
      title: "Processing...",
      description: "Please wait while we process your request.",
    });

    // Simulate async operation
    setTimeout(() => {
      // Update the toast to success
      toast({
        id,
        title: "Success!",
        description: "Your request has been processed.",
        variant: "success",
      });
    }, 2000);
  };

  return <button onClick={handleAction}>Process Request</button>;
}
```

### Custom Toast with Actions

```tsx
import { toast } from "@/presentation/hooks/use-toast";
import { ToastAction } from "@/presentation/components/ui/toast";

function showConfirmationToast() {
  toast({
    title: "Delete project?",
    description: "This action cannot be undone.",
    variant: "destructive",
    action: (
      <ToastAction altText="Confirm deletion">
        <button onClick={() => console.log("Deleted!")}>Delete</button>
      </ToastAction>
    ),
  });
}
```

## Toast Variants

- `default` - Standard gray toast
- `success` - Green success toast
- `error` / `destructive` - Red error toast
- `warning` - Yellow warning toast
- `info` - Blue info toast

## Configuration

### Toast Options

```tsx
type ToastOptions = {
  title?: string;
  description?: string;
  variant?: "default" | "success" | "error" | "warning" | "info";
  duration?: number; // in milliseconds
  action?: ReactElement;
};
```

### Default Duration

Toasts automatically dismiss after 5 seconds by default. You can customize this:

```tsx
toast({
  title: "Custom duration",
  duration: 10000, // 10 seconds
});
```

## Integration

The `Toaster` component is already added to your root layout (`app/layout.tsx`), so toasts will work throughout your application automatically.

## Examples

### In Board Component

```tsx
// presentation/components/features/board/Board.tsx
import { success, error } from "@/presentation/utils/toast";

function Board() {
  const handleSave = async () => {
    try {
      await saveBoard();
      success("Board saved!", "Your kanban board has been saved.");
    } catch (err) {
      error("Save failed", "Unable to save your board. Please try again.");
    }
  };

  return <button onClick={handleSave}>Save Board</button>;
}
```

### In Form Validation

```tsx
// presentation/components/forms/ProjectForm.tsx
import { warning } from "@/presentation/utils/toast";

function ProjectForm() {
  const handleSubmit = (data) => {
    if (!data.title) {
      warning("Title required", "Please enter a project title.");
      return;
    }

    // Submit form...
  };

  return <form onSubmit={handleSubmit}>{/* form fields */}</form>;
}
```

## Styling

The toast system uses Tailwind CSS classes and follows your design system. You can customize the appearance by modifying the `toastVariants` in `presentation/components/ui/toast.tsx`.

## Accessibility

- All toasts are announced to screen readers
- Keyboard navigation support
- ARIA labels and roles properly set
- Focus management handled automatically
