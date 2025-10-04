# Logger

The logger in `lib/logger.ts` provides a tiny, scoped wrapper around the native console for both browser and Node runtimes. It standardises prefixes, honours configurable log levels, persists browser overrides, and exposes a small API for building feature-specific loggers.

## Features at a glance
- Scoped loggers built with `createLogger(...)` and optional `child(...)` for nested contexts.
- Consistent output prefix including ISO timestamp, level, and colon-separated scope.
- Environment-aware log level detection with browser persistence and runtime overrides.
- Subscription API (`onLogLevelChange`) to build UI controls and react to changes.
- Defensive console invocation with fallbacks for older environments.

## Log levels
| Level | Behaviour | Typical usage |
| --- | --- | --- |
| `silent` | No logs emitted. | Disable logging entirely (rare). |
| `error` | Only `logger.error`. | Production issues, tests. |
| `warn` | `warn` + `error`. | Production default. |
| `info` | `info` + higher. | Feature rollout monitoring. |
| `debug` | All logs. | Local development default. |

## How the active log level is chosen
1. `process.env.NEXT_PUBLIC_LOG_LEVEL` (browser/server) or `process.env.LOG_LEVEL` (server).
2. `window.__KANBAN_LOG_LEVEL__` (if set by tooling) or `localStorage["kanban:log-level"]`.
3. `process.env.NODE_ENV` heuristics: `warn` in production, `error` in tests, `debug` otherwise.

The resolved level is cached on `globalThis.__KANBAN_LOG_LEVEL__` so it is consistent across server requests and client renders.

## Quick start
```ts
import { createLogger } from '@/lib/logger'

const microblogLogger = createLogger(['presentation', 'microblog', 'StreamlinedBlogEditor'])

microblogLogger.info('Editor mounted', { featureFlag: 'microblog-v1' })

const saveLogger = microblogLogger.child('handleSave')
saveLogger.warn('Validation failed before publishing', { hasTitle: false })
```

Pass an array of scope segments (or a colon-delimited string) to produce readable prefixes such as `presentation:microblog:StreamlinedBlogEditor`. Use `child('operationName')` to derive nested loggers without recomputing the base scope.

## Logging errors and metadata
`logger.error` accepts an error object and additional metadata. Errors are serialised to plain objects so they remain inspectable even after structured logging.

```ts
import { createLogger } from '@/lib/logger'

const authLogger = createLogger(['services', 'auth'])

try {
  await login()
} catch (error) {
  authLogger.error('Login failed', error, { retryable: false, userId })
}
```

Other argument types such as functions or symbols are stringified safely.

## Runtime log level controls
Use the exported helpers to inspect and update the level on demand:

```ts
import { getLogLevel, setLogLevel, onLogLevelChange } from '@/lib/logger'

console.log(getLogLevel()) // -> "debug"

const unsubscribe = onLogLevelChange((level) => {
  console.log('Log level changed to', level)
})

setLogLevel('warn') // persists in the browser and notifies subscribers

unsubscribe()
```

`setLogLevel` validates input, updates `globalThis.__KANBAN_LOG_LEVEL__`, and persists to `localStorage` in the browser so the choice survives reloads.

## Browser overrides
You can flip logging without touching code:

```js
// From the DevTools console
localStorage.setItem('kanban:log-level', 'debug')
// or
window.__KANBAN_LOG_LEVEL__ = 'info'
```

Reloading the page will reuse the stored value. Remove the key or call `setLogLevel('warn')` to revert.

## Server-side behaviour
On the server the logger falls back to environment variables and never touches `window` or `localStorage`. The same API works in API routes, background jobs, and React Server Components.

## The default logger
`defaultLogger` exposes a ready-made `createLogger('app')`. Use it for very high-level bootstrap messages when a more specific scope is not available.

## Sample output
```
[2025-10-02T12:34:56.789Z] [INFO] [presentation:microblog:StreamlinedBlogEditor] Attempting to publish microblog post {"canSaveToDatabase":true,"wordCount":128}
[2025-10-02T12:34:56.912Z] [ERROR] [presentation:microblog:StreamlinedBlogEditor:handleSave] Failed to publish microblog post {"message":"Network error","stack":"Error: ..."}
```

## Best practices
- Favour descriptive scopes that mirror the file or feature path.
- Log the intent before performing a side-effect, then log the outcome (success or failure).
- Include lightweight metadata objects rather than concatenating strings.
- Downgrade chatty logs to `debug` so production noise stays low.
- Never log secrets, access tokens, or other sensitive data; mask or omit them instead.
