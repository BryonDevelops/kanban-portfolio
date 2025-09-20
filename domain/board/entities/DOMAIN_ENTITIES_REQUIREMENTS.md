# Domain Entities Requirements

## Overview

This document defines the core business entities for the Kanban Portfolio application: **Projects**, **Tasks**, and **Board**. These entities represent the fundamental business concepts and their relationships, business rules, and validation requirements.

## 📋 Project Entity

### **Core Properties**
```typescript
interface Project {
  id: string;                    // Unique identifier
  title: string;                 // Project name (required, 1-100 chars)
  description?: string;          // Optional description (max 500 chars)
  status: ProjectStatus;         // Current project status
  technologies: string[];        // Tech stack used
  tags: string[];               // Categorization tags
  tasks: Task[];                // Associated tasks
  created_at: Date;             // Creation timestamp
  updated_at: Date;             // Last update timestamp

  // Optional business fields
  url?: string;                 // Project URL/repository
  start_date?: Date;            // Project start date
  end_date?: Date;              // Project completion date
  priority?: ProjectPriority;   // Project priority level
  github_username?: string;     // Associated GitHub username
  repositories?: string[];      // GitHub repositories
}
```

### **Project Status Values**
```typescript
enum ProjectStatus {
  PLANNING = 'planning',        // Initial planning phase
  IN_PROGRESS = 'in-progress',   // Actively being worked on
  COMPLETED = 'completed',      // Finished and delivered
  ON_HOLD = 'on-hold',          // Temporarily paused
  CANCELLED = 'cancelled'       // Permanently cancelled
}
```

### **Project Priority Levels**
```typescript
enum ProjectPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}
```

### **Business Rules - Projects**

#### **Creation Rules**
- **Title Required**: Must have a non-empty title
- **Title Uniqueness**: No duplicate titles across all projects
- **Default Status**: New projects default to 'planning'
- **Initial Tasks**: Can be created with or without initial tasks

#### **Status Transition Rules**
```typescript
const validTransitions: Record<ProjectStatus, ProjectStatus[]> = {
  [ProjectStatus.PLANNING]: [ProjectStatus.IN_PROGRESS, ProjectStatus.CANCELLED],
  [ProjectStatus.IN_PROGRESS]: [ProjectStatus.COMPLETED, ProjectStatus.ON_HOLD, ProjectStatus.CANCELLED],
  [ProjectStatus.ON_HOLD]: [ProjectStatus.IN_PROGRESS, ProjectStatus.CANCELLED],
  [ProjectStatus.COMPLETED]: [], // Terminal state
  [ProjectStatus.CANCELLED]: []  // Terminal state
};
```

#### **Update Rules**
- **Title Changes**: Must maintain uniqueness
- **Status Changes**: Must follow valid transitions
- **Date Validation**: end_date cannot be before start_date
- **Technology Updates**: Can add/remove technologies freely

#### **Deletion Rules**
- **Cascade Delete**: All associated tasks are deleted
- **Status Check**: Only non-completed projects can be deleted
- **Audit Trail**: Deletion should be logged

## 📋 Task Entity

### **Core Properties**
```typescript
interface Task {
  id: string;                   // Unique identifier
  title: string;                // Task name (required, 1-100 chars)
  description?: string;         // Optional description (max 500 chars)
  status: TaskStatus;           // Current task status
  order: number;                // Position in column (for drag-drop)
  projectId: string;            // Associated project ID
  columnId: string;             // Current column ID

  created_at: Date;             // Creation timestamp
  updated_at?: Date;            // Last update timestamp

  // Optional business fields
  priority?: TaskPriority;      // Task priority level
  assignee?: string;            // Assigned user
  due_date?: Date;              // Due date
  estimated_hours?: number;     // Estimated effort
  actual_hours?: number;        // Actual effort spent
  tags: string[];              // Task tags
}
```

### **Task Status Values**
```typescript
enum TaskStatus {
  TODO = 'todo',               // Not started
  IN_PROGRESS = 'in-progress',  // Currently working on
  REVIEW = 'review',           // Ready for review
  DONE = 'done'                // Completed
}
```

### **Task Priority Levels**
```typescript
enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}
```

### **Business Rules - Tasks**

#### **Creation Rules**
- **Project Association**: Must belong to an existing project
- **Title Required**: Must have a non-empty title
- **Default Status**: New tasks default to 'todo'
- **Order Assignment**: Automatic order assignment in column

#### **Status Transition Rules**
```typescript
const validTaskTransitions: Record<TaskStatus, TaskStatus[]> = {
  [TaskStatus.TODO]: [TaskStatus.IN_PROGRESS],
  [TaskStatus.IN_PROGRESS]: [TaskStatus.REVIEW, TaskStatus.TODO],
  [TaskStatus.REVIEW]: [TaskStatus.DONE, TaskStatus.IN_PROGRESS],
  [TaskStatus.DONE]: [TaskStatus.IN_PROGRESS] // Allow reopening
};
```

#### **Movement Rules**
- **Column Movement**: Tasks can move between columns
- **Order Maintenance**: Order must be maintained within columns
- **Project Consistency**: Tasks cannot move to different projects

#### **Update Rules**
- **Project Lock**: Cannot change project association
- **Status Validation**: Must follow valid transitions
- **Date Validation**: Due dates cannot be in the past for new tasks

## 📋 Board Entity

### **Core Properties**
```typescript
interface Board {
  id: string;                   // Unique identifier
  name: string;                 // Board name
  description?: string;         // Optional description
  columns: BoardColumn[];       // Board columns configuration
  projects: Project[];          // Projects on this board
  created_at: Date;             // Creation timestamp
  updated_at: Date;             // Last update timestamp

  // Optional configuration
  ownerId: string;              // Board owner
  isPublic: boolean;            // Public visibility
  allowedUsers: string[];       // Users with access
  settings: BoardSettings;      // Board configuration
}
```

### **Board Column Structure**
```typescript
interface BoardColumn {
  id: string;                   // Column identifier
  name: string;                 // Display name
  status: ProjectStatus;        // Associated project status
  order: number;                // Column position
  limit?: number;               // WIP limit (optional)
  color?: string;               // Column color theme
}
```

### **Default Board Columns**
```typescript
const DEFAULT_COLUMNS: BoardColumn[] = [
  { id: 'ideas', name: 'Ideas', status: ProjectStatus.PLANNING, order: 0 },
  { id: 'in-progress', name: 'In Progress', status: ProjectStatus.IN_PROGRESS, order: 1 },
  { id: 'completed', name: 'Completed', status: ProjectStatus.COMPLETED, order: 2 }
];
```

### **Board Settings**
```typescript
interface BoardSettings {
  allowPublicView: boolean;     // Public viewing permission
  allowGuestComments: boolean;  // Guest commenting
  showTaskCounts: boolean;      // Display task counts
  enableTimeTracking: boolean;  // Time tracking features
  defaultTaskPriority: TaskPriority; // Default priority for new tasks
  workingDays: string[];        // Working days of week
}
```

### **Business Rules - Board**

#### **Creation Rules**
- **Default Columns**: Boards start with standard columns
- **Owner Assignment**: Must have an owner
- **Name Uniqueness**: Board names must be unique per user

#### **Project Management**
- **Project Addition**: Projects can be added to any column
- **Status Synchronization**: Project status must match column status
- **Movement Validation**: Projects can only move to valid columns

#### **Column Management**
- **Column Reordering**: Columns can be reordered
- **WIP Limits**: Optional work-in-progress limits per column
- **Custom Columns**: Users can add custom columns

## 🔗 Entity Relationships

### **Project ↔ Task Relationship**
- **One-to-Many**: One project can have multiple tasks
- **Cascade Operations**: Deleting project deletes all tasks
- **Status Dependencies**: Task status can affect project status
- **Consistency**: Tasks must always belong to exactly one project

### **Board ↔ Project Relationship**
- **Many-to-Many**: Projects can exist on multiple boards
- **Board Context**: Projects have different positions on different boards
- **Status Mapping**: Board columns map to project statuses

### **Board ↔ Task Relationship**
- **Indirect**: Through projects
- **Column Organization**: Tasks are organized by project columns
- **Movement**: Tasks move within project contexts

## 📊 Validation Schemas

### **Project Validation Schema**
```typescript
export const ProjectCreateSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title must be 100 characters or less'),
  description: z.string()
    .max(500, 'Description must be 500 characters or less')
    .optional(),
  status: z.enum(['planning', 'in-progress', 'completed', 'on-hold', 'cancelled'])
    .default('planning'),
  technologies: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  url: z.string().url('Invalid URL').optional(),
  start_date: z.date().optional(),
  end_date: z.date().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  github_username: z.string().optional()
}).refine((data) => {
  // Custom validation: end_date cannot be before start_date
  if (data.start_date && data.end_date) {
    return data.end_date >= data.start_date;
  }
  return true;
}, {
  message: 'End date cannot be before start date',
  path: ['end_date']
});
```

### **Task Validation Schema**
```typescript
export const TaskCreateSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title must be 100 characters or less'),
  description: z.string()
    .max(500, 'Description must be 500 characters or less')
    .optional(),
  status: z.enum(['todo', 'in-progress', 'review', 'done'])
    .default('todo'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  assignee: z.string().optional(),
  due_date: z.date().optional(),
  estimated_hours: z.number().positive().optional(),
  actual_hours: z.number().positive().optional(),
  tags: z.array(z.string()).default([]),
  projectId: z.string().min(1, 'Project ID is required')
});
```

### **Board Validation Schema**
```typescript
export const BoardCreateSchema = z.object({
  name: z.string()
    .min(1, 'Board name is required')
    .max(50, 'Board name must be 50 characters or less'),
  description: z.string()
    .max(200, 'Description must be 200 characters or less')
    .optional(),
  ownerId: z.string().min(1, 'Owner ID is required'),
  isPublic: z.boolean().default(false),
  allowedUsers: z.array(z.string()).default([]),
  settings: BoardSettingsSchema.optional()
});

export const BoardSettingsSchema = z.object({
  allowPublicView: z.boolean().default(true),
  allowGuestComments: z.boolean().default(false),
  showTaskCounts: z.boolean().default(true),
  enableTimeTracking: z.boolean().default(false),
  defaultTaskPriority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  workingDays: z.array(z.string()).default(['monday', 'tuesday', 'wednesday', 'thursday', 'friday'])
});
```

## 🎯 Business Logic Examples

### **Project Status Updates**
```typescript
export class Project {
  // Business method for status updates
  updateStatus(newStatus: ProjectStatus): void {
    if (!this.canTransitionTo(newStatus)) {
      throw new DomainError(`Cannot transition from ${this.status} to ${newStatus}`);
    }

    this.status = newStatus;
    this.updated_at = new Date();

    // Update end_date for completed projects
    if (newStatus === ProjectStatus.COMPLETED && !this.end_date) {
      this.end_date = new Date();
    }
  }

  private canTransitionTo(newStatus: ProjectStatus): boolean {
    const validTransitions = {
      [ProjectStatus.PLANNING]: [ProjectStatus.IN_PROGRESS, ProjectStatus.CANCELLED],
      [ProjectStatus.IN_PROGRESS]: [ProjectStatus.COMPLETED, ProjectStatus.ON_HOLD, ProjectStatus.CANCELLED],
      [ProjectStatus.ON_HOLD]: [ProjectStatus.IN_PROGRESS, ProjectStatus.CANCELLED],
      [ProjectStatus.COMPLETED]: [],
      [ProjectStatus.CANCELLED]: []
    };

    return validTransitions[this.status]?.includes(newStatus) ?? false;
  }
}
```

### **Task Management**
```typescript
export class Task {
  // Business method for status updates
  updateStatus(newStatus: TaskStatus): void {
    if (!this.canTransitionTo(newStatus)) {
      throw new DomainError(`Cannot transition task from ${this.status} to ${newStatus}`);
    }

    this.status = newStatus;
    this.updated_at = new Date();
  }

  private canTransitionTo(newStatus: TaskStatus): boolean {
    const validTransitions = {
      [TaskStatus.TODO]: [TaskStatus.IN_PROGRESS],
      [TaskStatus.IN_PROGRESS]: [TaskStatus.REVIEW, TaskStatus.TODO],
      [TaskStatus.REVIEW]: [TaskStatus.DONE, TaskStatus.IN_PROGRESS],
      [TaskStatus.DONE]: [TaskStatus.IN_PROGRESS]
    };

    return validTransitions[this.status]?.includes(newStatus) ?? false;
  }
}
```

## 📈 Metrics and Analytics

### **Project Metrics**
- **Completion Rate**: Projects completed vs total
- **Average Duration**: Time from start to completion
- **Technology Usage**: Most used technologies
- **Status Distribution**: Projects by status

### **Task Metrics**
- **Completion Rate**: Tasks completed vs total
- **Average Cycle Time**: Time from todo to done
- **Bottleneck Analysis**: Tasks stuck in columns
- **Assignee Workload**: Tasks per assignee

### **Board Metrics**
- **Project Velocity**: Projects completed per time period
- **Column Distribution**: Projects/tasks per column
- **WIP Limits**: Adherence to work-in-progress limits

This domain entities specification provides a solid foundation for the Kanban Portfolio application's core business logic and data management.</content>
<parameter name="filePath">e:\_dev\sources\kanban-portfolio\domain\DOMAIN_ENTITIES_REQUIREMENTS.md