# Domain Layer

The domain layer is the source of truth for business rules. It is written in framework-agnostic TypeScript and is safe to run in any environment.

## Directory overview
- `board/` – kanban entities, repository contracts, and zod schemas for projects, tasks, and board workflows.
- `admin/` – feature flag entity and repository contract that powers the admin console.
- `microblog/` – post and category entities plus repository contracts for the microblog experience.
- `user.ts` – shared user aggregate used by multiple modules.

## Entities and value objects
### Board
- `Project` (`board/entities/project.ts`) tracks portfolio work, status transitions, metadata, and relations to tasks.
- `Task` (`board/entities/task.ts`) represents kanban cards with status, ordering, and timestamps.
- Status enums cover `idea`, `planning`, `in-progress`, `completed`, `on-hold`, and `archived`.

### Admin
- `FeatureFlag` (`admin/entities/featureFlag.ts`) encapsulates toggle metadata, categories, and audit fields.

### Microblog
- `Post` (`microblog/entities/post.ts`) stores authoring data, read time metrics, tags, and publishing state.
- `Category` (`microblog/entities/category.ts`) defines taxonomy used for grouping posts.

## Repository contracts
Interfaces live alongside their modules and express the capabilities infrastructure must satisfy:

- `board/repositories/boardRepository.interface.ts`, `projectRepository.ts`, and `taskRepository.ts` define CRUD operations and drag-and-drop mutations for projects and tasks.
- `board/repositories/tagRepository.interface.ts` isolates tag management.
- `admin/repositories/featureFlagRepository.interface.ts` exposes feature flag management primitives.
- `microblog/repositories/microblogRepository.ts` and `categoryRepository.ts` cover post lifecycles, searching, and taxonomy queries.

Infrastructure adapters (for example, `SupabaseBoardRepository`, `SupabaseMicroblogRepository`) implement these contracts without leaking implementation details into the domain layer.

## Schemas and validation
The `schemas/` folders use Zod to perform runtime validation and to generate typed DTOs that match the domain entities. This ensures API inputs, Supabase payloads, and Sanity documents all conform to the same invariants.

## Guidelines
- Do not import from Next.js, React, or any browser/Node-specific modules.
- Keep business rules here; push framework or IO specifics down into `services/` or `infrastructure/`.
- Prefer pure functions and immutable data; use TypeScript types and Zod schemas to enforce invariants.
- When adding a new capability, update both the entity type and its companion repository contract so downstream layers know how to interact with it.

## Testing
Unit tests that target the domain live in `tests/domain` (pure business rules) and `tests/unit` (domain-focused unit tests that use mocks). Run them with:

```bash
npm run test:domain
npm run test:unit
```

## Extending the domain
When modelling a new feature:

1. Add or update entity definitions and schemas.
2. Extend the appropriate repository interface (or create a new one).
3. Cover the business rules with tests in `tests/domain`.
4. Update infrastructure adapters to implement the new contract.
