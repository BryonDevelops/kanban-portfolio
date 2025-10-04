const LOG_LEVEL_VALUES = ['silent', 'error', 'warn', 'info', 'debug'] as const

export type LogLevel = (typeof LOG_LEVEL_VALUES)[number]

type ActiveLogLevel = Exclude<LogLevel, 'silent'>

type LogSubscriber = (level: LogLevel) => void

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  silent: -1,
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
}

const LOG_METHOD_BY_LEVEL: Record<ActiveLogLevel, keyof Console> = {
  error: 'error',
  warn: 'warn',
  info: 'info',
  debug: 'debug',
}

const subscribers = new Set<LogSubscriber>()

const globalScope = globalThis as typeof globalThis & { __KANBAN_LOG_LEVEL__?: LogLevel }

const browserStorageKey = 'kanban:log-level'

function isLogLevel(value: string): value is LogLevel {
  return (LOG_LEVEL_VALUES as readonly string[]).includes(value)
}

function normalizeLevel(value?: string | null): LogLevel | null {
  if (!value) {
    return null
  }

  const normalized = value.trim().toLowerCase()
  return isLogLevel(normalized) ? (normalized as LogLevel) : null
}

function readBrowserPersistedLevel(): LogLevel | null {
  if (typeof window === 'undefined') {
    return null
  }

  const browserScope = window as typeof window & { __KANBAN_LOG_LEVEL__?: string }

  const runtimeLevel = normalizeLevel(browserScope.__KANBAN_LOG_LEVEL__)
  if (runtimeLevel) {
    return runtimeLevel
  }

  try {
    const stored = window.localStorage?.getItem(browserStorageKey)
    const storedLevel = normalizeLevel(stored)
    if (storedLevel) {
      browserScope.__KANBAN_LOG_LEVEL__ = storedLevel
      return storedLevel
    }
  } catch (error) {
    console.warn('[logger] Unable to read persisted log level', error)
  }

  return null
}

function readEnvLogLevel(): LogLevel | null {
  if (typeof process === 'undefined') {
    return null
  }

  const candidates = [process.env.NEXT_PUBLIC_LOG_LEVEL, process.env.LOG_LEVEL]
  for (const candidate of candidates) {
    const level = normalizeLevel(candidate)
    if (level) {
      return level
    }
  }

  return null
}

const resolvedDefaultLevel: LogLevel = (() => {
  const envLevel = readEnvLogLevel()
  if (envLevel) {
    return envLevel
  }

  const browserLevel = readBrowserPersistedLevel()
  if (browserLevel) {
    return browserLevel
  }

  const nodeEnv = typeof process !== 'undefined' ? process.env.NODE_ENV : undefined

  if (nodeEnv === 'production') {
    return 'warn'
  }

  if (nodeEnv === 'test') {
    return 'error'
  }

  return 'debug'
})()

let currentLevel: LogLevel = globalScope.__KANBAN_LOG_LEVEL__ || resolvedDefaultLevel

globalScope.__KANBAN_LOG_LEVEL__ = currentLevel

function shouldLog(level: ActiveLogLevel): boolean {
  return LOG_LEVEL_PRIORITY[level] <= LOG_LEVEL_PRIORITY[currentLevel]
}

function formatPrefix(level: ActiveLogLevel, context?: string): string {
  const timestamp = new Date().toISOString()
  const segments = [`[${timestamp}]`, `[${level.toUpperCase()}]`]
  if (context) {
    segments.push(`[${context}]`)
  }
  return segments.join(' ')
}

function normalizeOptionalParam(param: unknown): unknown {
  if (param instanceof Error) {
    return {
      name: param.name,
      message: param.message,
      stack: param.stack,
    }
  }

  if (typeof param === 'function') {
    return `[Function ${param.name || 'anonymous'}]`
  }

  if (typeof param === 'symbol') {
    return param.toString()
  }

  return param
}

function getConsoleMethod(level: ActiveLogLevel): ((...args: unknown[]) => void) {
  if (typeof console === 'undefined') {
    return () => {}
  }

  const methodName = LOG_METHOD_BY_LEVEL[level]
  const method = console[methodName]
  const fallback = (console.log || console.error || (() => {})) as (...fnArgs: unknown[]) => void

  if (typeof method === 'function') {
    return (...args: unknown[]) => {
      try {
        Reflect.apply(method as (...fnArgs: unknown[]) => void, console, args)
      } catch {
        // Some environments like older browsers throw when applying to console methods
        Reflect.apply(fallback, console, args)
      }
    }
  }

  return (...args: unknown[]) => {
    Reflect.apply(fallback, console, args)
  }
}

function emit(level: ActiveLogLevel, context: string, message: string, optionalParams: unknown[]): void {
  if (!shouldLog(level)) {
    return
  }

  const prefix = formatPrefix(level, context)
  const normalizedParams = optionalParams.map(normalizeOptionalParam)
  const consoleMethod = getConsoleMethod(level)

  if (normalizedParams.length > 0) {
    consoleMethod(`${prefix} ${message}`, ...normalizedParams)
  } else {
    consoleMethod(`${prefix} ${message}`)
  }
}

function persistBrowserLevel(level: LogLevel): void {
  if (typeof window === 'undefined') {
    return
  }

  const browserScope = window as typeof window & { __KANBAN_LOG_LEVEL__?: string }
  browserScope.__KANBAN_LOG_LEVEL__ = level

  try {
    window.localStorage?.setItem(browserStorageKey, level)
  } catch (error) {
    console.warn('[logger] Unable to persist log level', error)
  }
}

export function getLogLevel(): LogLevel {
  return currentLevel
}

export function setLogLevel(level: LogLevel): void {
  if (!isLogLevel(level)) {
    throw new Error(`Invalid log level: ${level}`)
  }

  if (currentLevel === level) {
    return
  }

  currentLevel = level
  globalScope.__KANBAN_LOG_LEVEL__ = level

  if (typeof window !== 'undefined') {
    persistBrowserLevel(level)
  }

  subscribers.forEach((subscriber) => {
    try {
      subscriber(level)
    } catch (error) {
      getConsoleMethod('warn')('[logger] Log subscriber threw an error', normalizeOptionalParam(error))
    }
  })
}

export function onLogLevelChange(subscriber: LogSubscriber): () => void {
  subscribers.add(subscriber)

  try {
    subscriber(currentLevel)
  } catch (error) {
    getConsoleMethod('warn')('[logger] Initial log level notification failed', normalizeOptionalParam(error))
  }

  return () => {
    subscribers.delete(subscriber)
  }
}

export interface Logger {
  debug(message: string, ...optionalParams: unknown[]): void
  info(message: string, ...optionalParams: unknown[]): void
  warn(message: string, ...optionalParams: unknown[]): void
  error(message: string, ...optionalParams: unknown[]): void
  child(scope: string): Logger
}

export function createLogger(scope?: string | string[]): Logger {
  const resolvedScope = Array.isArray(scope) ? scope.filter(Boolean).join(':') : scope || ''
  const baseContext = resolvedScope

  const logWithLevel = (level: ActiveLogLevel) => (message: string, ...optionalParams: unknown[]) => {
    emit(level, baseContext, message, optionalParams)
  }

  return {
    debug: logWithLevel('debug'),
    info: logWithLevel('info'),
    warn: logWithLevel('warn'),
    error: logWithLevel('error'),
    child(nextScope: string): Logger {
      const nextContext = [baseContext, nextScope].filter(Boolean).join(':')
      return createLogger(nextContext)
    },
  }
}

export const defaultLogger = createLogger('app')
