# Presentation Layer

The Presentation layer handles all user interface concerns, user interactions, and presentation logic. Built with Next.js 15 and modern React patterns, this layer provides a responsive, accessible, and performant user experience while maintaining clean separation from business logic.

## 🏗️ Architecture Principles

This layer follows these key principles:

- **Separation of Concerns**: UI logic separated from business logic
- **Component Composition**: Reusable components with single responsibilities
- **State Management**: Centralized state with Zustand for client-side data
- **Server Components**: Leverage Next.js server components for performance
- **Progressive Enhancement**: Works without JavaScript, enhanced with interactivity

## 📁 Structure

```
presentation/
├── app/                    # Next.js App Router structure
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Home page
│   ├── dashboard/         # Dashboard pages
│   ├── projects/          # Project management pages
│   ├── api/               # API routes (backend for frontend)
│   └── styles/            # Global styles and CSS modules
├── components/            # Reusable React components
│   ├── ui/               # Base UI components (shadcn/ui)
│   ├── Board.tsx         # Kanban board component
│   ├── Column.tsx        # Board column component
│   ├── Card.tsx          # Task card component
│   └── ...               # Other feature components
├── stores/               # Client-side state management
│   └── boardStore.ts     # Zustand store for board state
├── hooks/                # Custom React hooks
└── lib/                  # Utility functions and configurations
```

## 🎨 Design System

### UI Foundation
**Technology Stack:**
- **Styling**: Tailwind CSS for utility-first styling
- **Components**: shadcn/ui for consistent, accessible base components
- **Icons**: Lucide React for consistent iconography
- **Fonts**: Geist Sans and Geist Mono for modern typography

### Component Hierarchy

#### Base UI Components (`components/ui/`)
Foundational components from shadcn/ui:
- `Button`, `Input`, `Dialog`, `Sidebar`
- Fully accessible with ARIA attributes
- Consistent styling with CSS variables for theming
- TypeScript definitions for type safety

#### Feature Components (`components/`)

**Board Component (`Board.tsx`)**
- Main kanban board interface
- Manages column layout and task creation
- Handles board-level interactions
- State management via Zustand store

```tsx
export default function Board() {
  const columns = useBoardStore((s) => s.columns);
  // Renders columns in predefined order
  // Handles task creation dialog
  // Manages responsive layout
}
```

**Column Component (`Column.tsx`)**
- Individual kanban column representation
- Drag-and-drop functionality for task management
- Dynamic badge styling based on column type
- Responsive design for mobile and desktop

**Card Component (`Card.tsx`)**
- Individual task representation
- Drag handle and interaction states
- Truncated content with expand functionality
- Storybook stories for design system documentation

### Layout System

#### Root Layout (`app/layout.tsx`)
```tsx
export default function RootLayout({ children }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <PageTransition>
          {children}
        </PageTransition>
      </SidebarInset>
    </SidebarProvider>
  );
}
```

**Features:**
- **Sidebar Navigation**: Collapsible sidebar with state persistence
- **Page Transitions**: Smooth animations between routes
- **Theme Support**: Dark/light mode with system preference detection
- **Responsive Design**: Mobile-first approach with breakpoint considerations

## 🔄 State Management

### Zustand Store (`stores/boardStore.ts`)

Client-side state management for board operations:

```typescript
type BoardState = {
  columns: Record<string, Task[]>;
  addTask: (columnId: string, title: string, description?: string) => void;
  moveTask: (fromCol: string, toCol: string, fromIndex: number, toIndex: number) => void;
  setColumns: (cols: Columns) => void;
};
```

**Design Decisions:**

1. **Persistence**: localStorage integration for offline-first experience
2. **Optimistic Updates**: Immediate UI updates for better UX
3. **Pure Functions**: Business logic delegated to BoardService
4. **Type Safety**: Full TypeScript integration
5. **DevTools**: Zustand devtools for debugging

**Current Integration Pattern:**
```tsx
// Component uses store
const columns = useBoardStore((s) => s.columns);

// Store delegates to service
addTask: (columnId, title, description) => {
  const newTask = { id: nanoid(), title, description };
  set((state) => ({
    columns: BoardService.addTaskToColumns(state.columns, columnId, newTask)
  }));
}
```

### State Architecture Evolution

**Current State**: Direct store manipulation with service delegation
**Target State**: Command/Query pattern with repository integration

**Migration Plan:**
1. Replace direct store mutations with command dispatching
2. Implement query handlers for data fetching
3. Add optimistic updates with rollback capability
4. Integrate with application layer use cases

## 🚦 Routing and Navigation

### Next.js App Router Structure

```
app/
├── page.tsx              # Landing page (/)
├── dashboard/
│   └── page.tsx          # Main dashboard (/dashboard)
├── projects/
│   ├── page.tsx          # Project list (/projects)
│   ├── [id]/
│   │   └── page.tsx      # Project detail (/projects/[id])
│   └── new/
│       └── page.tsx      # Create project (/projects/new)
└── api/
    ├── projects/
    │   └── route.ts      # Projects API (/api/projects)
    └── tasks/
        └── route.ts      # Tasks API (/api/tasks)
```

### Navigation Components

**AppSidebar (`components/app-sidebar.tsx`)**
- Main navigation menu
- Route highlighting
- Collapsible design
- User profile integration

**Topbar (`components/topbar.tsx`)**
- Secondary navigation
- Theme toggle
- User actions
- Breadcrumb navigation

## 🎭 User Experience Patterns

### Progressive Enhancement
- **Base Functionality**: Works without JavaScript
- **Enhanced Interactions**: Drag-and-drop, real-time updates
- **Fallback UI**: Loading states and error boundaries
- **Accessibility**: Full keyboard navigation and screen reader support

### Responsive Design
```css
/* Mobile-first approach */
.board {
  @apply flex flex-col gap-4;
}

/* Tablet and desktop */
@media (min-width: 768px) {
  .board {
    @apply flex-row;
  }
}
```

### Animation and Transitions

**Page Transitions (`components/PageTransition.tsx`)**
- Smooth route transitions
- Split enter/exit animations
- Performance-optimized with CSS transforms
- Reduced motion support for accessibility

**Micro-interactions**
- Button hover states
- Drag feedback
- Loading indicators
- Toast notifications

## 🧪 Testing Strategy

### Component Testing
**Tools**: Vitest + React Testing Library
**Location**: `tests/presentation/`

```typescript
describe('Board Component', () => {
  it('renders columns in correct order', () => {
    render(<Board />);
    const columns = screen.getAllByRole('region');
    expect(columns).toHaveLength(3);
    expect(columns[0]).toHaveTextContent('Ideas');
  });
});
```

### Storybook Integration
**Purpose**: Component documentation and visual testing
**Location**: `components/*.stories.tsx`

```typescript
// Card.stories.tsx
export default {
  title: 'Components/Card',
  component: Card,
  parameters: { layout: 'centered' }
};

export const Default = { args: { title: 'Sample Task' } };
export const WithDescription = { args: { title: 'Task', description: 'Details' } };
```

### E2E Testing
**Tools**: Playwright (planned)
**Coverage**:
- Complete user workflows
- Cross-browser compatibility
- Mobile responsiveness
- Accessibility compliance

## 🎯 Design Decisions

### Why Next.js App Router?
**Benefits:**
- **Server Components**: Better performance and SEO
- **Streaming**: Progressive page loading
- **Nested Layouts**: Shared UI patterns
- **Co-location**: API routes alongside pages

**Trade-offs:**
- **Learning Curve**: New patterns and conventions
- **Complexity**: More concepts than Pages Router
- **Stability**: Newer features may have edge cases

### Why Zustand Over Redux?
**Benefits:**
- **Simplicity**: Less boilerplate than Redux
- **TypeScript**: Excellent TypeScript support
- **Performance**: Optimized re-renders
- **DevTools**: Great debugging experience

**Trade-offs:**
- **Ecosystem**: Smaller ecosystem than Redux
- **Patterns**: Less established patterns for complex state
- **Time Travel**: Limited compared to Redux DevTools

### Why Tailwind CSS?
**Benefits:**
- **Consistency**: Design system constraints
- **Performance**: Purged CSS for small bundles
- **DX**: Fast iteration and prototyping
- **Maintenance**: No custom CSS to maintain

**Trade-offs:**
- **HTML Verbosity**: Long className strings
- **Learning Curve**: Utility class memorization
- **Flexibility**: Less custom styling flexibility

## 🚀 Performance Optimizations

### Core Web Vitals
- **LCP**: Server components and image optimization
- **FID**: Code splitting and lazy loading
- **CLS**: Skeleton loading and defined dimensions

### React Optimizations
```tsx
// Memo for expensive calculations
const expensiveValue = useMemo(() =>
  processLargeDataset(data), [data]);

// Callback memoization
const handleClick = useCallback((id: string) =>
  onItemClick(id), [onItemClick]);

// Component memoization
export default memo(ExpensiveComponent);
```

### Bundle Optimization
- **Code Splitting**: Route-based and component-based
- **Tree Shaking**: Eliminate unused code
- **Image Optimization**: Next.js Image component
- **Font Optimization**: Variable fonts and preloading

## 🔮 Future Enhancements

### Advanced Interactions
- **Real-time Collaboration**: Multiple users editing simultaneously
- **Offline Support**: Service worker with sync
- **Voice Commands**: Accessibility and power user features
- **Keyboard Shortcuts**: Power user efficiency

### Enhanced UI/UX
- **Animation Library**: Framer Motion for complex animations
- **Virtualization**: Handle large datasets efficiently
- **Advanced Filtering**: Multi-criteria search and filtering
- **Customizable Layouts**: User-configurable dashboards

### Developer Experience
- **Component Library**: Standalone design system package
- **Visual Testing**: Chromatic integration
- **Performance Monitoring**: Real User Monitoring (RUM)
- **A/B Testing**: Feature flag integration

### Accessibility Improvements
- **Screen Reader Optimization**: Advanced ARIA patterns
- **High Contrast Mode**: Improved visual accessibility
- **Focus Management**: Enhanced keyboard navigation
- **Voice Control**: Integration with speech recognition

This presentation layer provides a solid foundation for a modern web application while maintaining clean architecture principles and excellent user experience. The modular design allows for easy testing, maintenance, and future enhancements.