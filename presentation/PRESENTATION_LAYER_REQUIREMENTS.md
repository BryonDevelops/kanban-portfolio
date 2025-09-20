# Presentation Layer Architecture Requirements

## Overview

The **Presentation Layer** is responsible for all user interface concerns, including React components, state management, and UI-specific logic. This layer serves as the boundary between the user interface and the application's business logic.

## 📁 Directory Structure

```
presentation/
├── components/               # React components
│   ├── ui/                  # Reusable UI components (shadcn/ui)
│   ├── board/               # Board-specific components
│   ├── forms/               # Form components
│   ├── layout/              # Layout components
│   └── shared/              # Shared components
├── stores/                  # State management (Zustand)
│   ├── board/               # Board-related stores
│   ├── ui/                  # UI state stores
│   └── shared/              # Shared stores
├── hooks/                   # Custom React hooks
├── utils/                   # UI utilities and helpers
├── types/                   # UI-specific type definitions
└── styles/                  # Component-specific styles
```

## 🎯 Responsibilities

### **Components** (`presentation/components/`)
- **Purpose**: Render UI and handle user interactions
- **Scope**: React components, JSX, component logic
- **Dependencies**: Can import from stores, hooks, and utils within presentation layer
- **External Dependencies**: Services through stores (not direct imports)

### **Stores** (`presentation/stores/`)
- **Purpose**: Manage UI state and coordinate with services
- **Scope**: Zustand stores, state management logic
- **Dependencies**: Can import from services layer
- **Responsibilities**: Data fetching, state synchronization, business logic coordination

### **Hooks** (`presentation/hooks/`)
- **Purpose**: Encapsulate component logic and side effects
- **Scope**: Custom React hooks for data fetching, UI state, etc.
- **Dependencies**: Can use stores and services through stores

### **Utils** (`presentation/utils/`)
- **Purpose**: UI-specific utility functions
- **Scope**: Formatting, calculations, UI helpers
- **Dependencies**: Pure functions, no external dependencies

## 🔄 Data Flow Architecture

### **Component → Store → Service → Repository**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Component     │───▶│     Store       │───▶│    Service      │───▶│  Repository     │
│                 │    │                 │    │                 │    │                 │
│ • User Actions  │    │ • State Mgmt    │    │ • Business Logic│    │ • Data Access   │
│ • UI Rendering  │    │ • Data Fetching │    │ • Validation    │    │ • Persistence   │
│ • Event Handling│    │ • Cache Mgmt    │    │ • Coordination  │    │ • External APIs │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Store Responsibilities**
- **Data Fetching**: Call services, handle loading/error states
- **State Management**: UI state, form state, component state
- **Business Logic Coordination**: Orchestrate service calls
- **Cache Management**: Local state caching and synchronization

## 📋 Component Organization

### **Component Types**

#### **Page Components** (`presentation/components/pages/`)
- **Purpose**: Route-level components
- **Naming**: `[Feature]Page.tsx`
- **Examples**: `BoardPage.tsx`, `ProjectsPage.tsx`
- **Responsibilities**: Layout, routing, page-level state

#### **Feature Components** (`presentation/components/[feature]/`)
- **Purpose**: Feature-specific components
- **Naming**: PascalCase, descriptive names
- **Examples**: `KanbanBoard.tsx`, `ProjectCard.tsx`
- **Responsibilities**: Feature logic, data presentation

#### **UI Components** (`presentation/components/ui/`)
- **Purpose**: Reusable design system components
- **Naming**: Follow shadcn/ui conventions
- **Examples**: `Button.tsx`, `Card.tsx`, `Dialog.tsx`
- **Responsibilities**: Consistent styling, accessibility

#### **Shared Components** (`presentation/components/shared/`)
- **Purpose**: Cross-feature reusable components
- **Naming**: Generic, reusable names
- **Examples**: `LoadingSpinner.tsx`, `ErrorBoundary.tsx`
- **Responsibilities**: Common UI patterns

### **Component Structure**

Each component should follow this structure:
```typescript
// ComponentName.tsx
import { useStore } from '../stores/[feature]/[storeName]';
import { useCustomHook } from '../hooks/[hookName]';
import { formatData } from '../utils/[utilName]';

export function ComponentName() {
  // Component logic here
  const { data, actions } = useStore();
  const { computedValue } = useCustomHook();

  return (
    // JSX here
  );
}
```

## 🏪 Store Organization

### **Store Types**

#### **Feature Stores** (`presentation/stores/[feature]/`)
- **Purpose**: Feature-specific state management
- **Naming**: `[Feature]Store.ts`
- **Examples**: `BoardStore.ts`, `ProjectStore.ts`
- **Responsibilities**: Feature state, data fetching, business logic

#### **UI Stores** (`presentation/stores/ui/`)
- **Purpose**: UI-specific state
- **Naming**: `[UIConcern]Store.ts`
- **Examples**: `ModalStore.ts`, `ThemeStore.ts`
- **Responsibilities**: UI state, preferences, temporary state

#### **Shared Stores** (`presentation/stores/shared/`)
- **Purpose**: Cross-feature state
- **Naming**: `[SharedConcern]Store.ts`
- **Examples**: `AuthStore.ts`, `NotificationStore.ts`
- **Responsibilities**: Global state, shared data

### **Store Structure**

Each store should follow this pattern:
```typescript
// [Feature]Store.ts
import { create } from 'zustand';
import { [Feature]Service } from '../../../services/[feature]/[feature]Service';

interface [Feature]State {
  // State properties
  data: [DataType][];
  loading: boolean;
  error: string | null;
}

interface [Feature]Actions {
  // Actions
  loadData: () => Promise<void>;
  createItem: (item: [DataType]) => Promise<void>;
  updateItem: (id: string, updates: Partial<[DataType]>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
}

export const use[Feature]Store = create<[Feature]State & [Feature]Actions>((set, get) => ({
  // Initial state
  data: [],
  loading: false,
  error: null,

  // Actions
  loadData: async () => {
    set({ loading: true, error: null });
    try {
      const service = new [Feature]Service();
      const data = await service.getData();
      set({ data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // ... other actions
}));
```

## 🎣 Custom Hooks

### **Hook Categories**

#### **Data Hooks** (`presentation/hooks/use[Feature]Data.ts`)
- **Purpose**: Data fetching and management
- **Examples**: `useProjects.ts`, `useBoardData.ts`
- **Responsibilities**: API calls, caching, synchronization

#### **UI Hooks** (`presentation/hooks/use[UIConcern].ts`)
- **Purpose**: UI state and interactions
- **Examples**: `useModal.ts`, `useTheme.ts`
- **Responsibilities**: UI state, event handling

#### **Utility Hooks** (`presentation/hooks/use[Utility].ts`)
- **Purpose**: Common patterns and utilities
- **Examples**: `useDebounce.ts`, `useLocalStorage.ts`
- **Responsibilities**: Reusable logic patterns

### **Hook Structure**

```typescript
// use[Feature].ts
import { use[Feature]Store } from '../stores/[feature]/[feature]Store';

export function use[Feature]() {
  const store = use[Feature]Store();

  // Custom logic here
  const computedValue = useMemo(() => {
    // Computation logic
  }, [store.data]);

  return {
    ...store,
    computedValue,
  };
}
```

## 🛠️ Utilities

### **Utility Categories**

#### **Formatters** (`presentation/utils/formatters.ts`)
- **Purpose**: Data formatting for display
- **Examples**: Date formatting, number formatting
- **Responsibilities**: Consistent data presentation

#### **Validators** (`presentation/utils/validators.ts`)
- **Purpose**: Client-side validation
- **Examples**: Form validation, input validation
- **Responsibilities**: UI validation logic

#### **Helpers** (`presentation/utils/helpers.ts`)
- **Purpose**: Common utility functions
- **Examples**: Array manipulation, object utilities
- **Responsibilities**: Pure utility functions

## 🎨 Styling Guidelines

### **Component Styling**
- **Primary**: Tailwind CSS classes
- **Secondary**: CSS modules for complex styles
- **Tertiary**: Styled components only when necessary

### **Style Organization**
```typescript
// ComponentName.tsx
import styles from './ComponentName.module.css';

export function ComponentName() {
  return (
    <div className={`${styles.container} bg-white p-4`}>
      {/* Component content */}
    </div>
  );
}
```

## 🧪 Testing Strategy

### **Test Location**: `tests/presentation/`
- **Config**: `tests/presentation/config/jest.presentation.config.js`
- **Setup**: `tests/presentation/setup/jest.presentation.setup.js`

### **Test Types**
- **Component Tests**: Rendering, interactions, props
- **Store Tests**: State management, actions, selectors
- **Hook Tests**: Custom hook logic, side effects
- **Integration Tests**: Component + store integration

### **Testing Patterns**
```typescript
// ComponentName.test.tsx
import { render, screen } from '@testing-library/react';
import { ComponentName } from '../ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

## 🚫 Boundaries and Restrictions

### **What Belongs in Presentation Layer**
- ✅ React components and JSX
- ✅ Zustand stores and state management
- ✅ Custom React hooks
- ✅ UI utilities and formatters
- ✅ Component-specific styles
- ✅ UI-specific types and interfaces

### **What Does NOT Belong in Presentation Layer**
- ❌ Business logic (belongs in services)
- ❌ Data access (belongs in repositories)
- ❌ Domain entities (belongs in domain)
- ❌ External API calls (belongs in services)
- ❌ Database operations (belongs in infrastructure)

### **Import Restrictions**
- **Components**: Can import from stores, hooks, utils within presentation
- **Stores**: Can import from services layer
- **Hooks**: Can import from stores and utils
- **Utils**: Pure functions, no external dependencies

## 📋 Naming Conventions

### **Files and Directories**
- **Components**: `PascalCase.tsx`
- **Stores**: `[Feature]Store.ts`
- **Hooks**: `use[Feature].ts` or `use[Utility].ts`
- **Utils**: `camelCase.ts`
- **Directories**: `kebab-case`

### **Components**
- **Pages**: `[Feature]Page`
- **Features**: `[Feature][Purpose]`
- **UI**: Follow shadcn/ui naming
- **Shared**: Generic descriptive names

## 🔧 Development Guidelines

### **Component Development**
1. **Start with Store**: Define store interface and actions first
2. **Create Component**: Build component using store hooks
3. **Add Custom Hooks**: Extract complex logic into custom hooks
4. **Test Thoroughly**: Write tests for component, store, and hooks

### **Store Development**
1. **Define Interface**: State and actions interface
2. **Implement Actions**: Async actions with error handling
3. **Add Selectors**: Computed values and derived state
4. **Test Logic**: Unit tests for all actions and selectors

### **Code Organization**
- **Single Responsibility**: Each file has one clear purpose
- **DRY Principle**: Extract common logic into utilities
- **Consistent Patterns**: Follow established patterns
- **Documentation**: JSDoc for complex logic

This architecture ensures a clean separation between UI concerns and business logic, making the codebase maintainable and testable.</content>
<parameter name="filePath">e:\_dev\sources\kanban-portfolio\presentation\PRESENTATION_LAYER_REQUIREMENTS.md