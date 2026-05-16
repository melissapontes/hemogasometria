const LOG_KEY = 'gasovet_upload_logs'
const MAX_ENTRIES = 100

export type LogEntry = {
  ts: string
  step: string
  data?: Record<string, unknown>
}

export function logStep(step: string, data?: Record<string, unknown>): void {
  const entry: LogEntry = { ts: new Date().toISOString(), step, data }
  try {
    const raw = localStorage.getItem(LOG_KEY)
    const entries: LogEntry[] = raw ? (JSON.parse(raw) as LogEntry[]) : []
    entries.push(entry)
    if (entries.length > MAX_ENTRIES) entries.splice(0, entries.length - MAX_ENTRIES)
    localStorage.setItem(LOG_KEY, JSON.stringify(entries))
  } catch {
    // localStorage indisponível
  }
}

export function getLogs(): LogEntry[] {
  try {
    const raw = localStorage.getItem(LOG_KEY)
    return raw ? (JSON.parse(raw) as LogEntry[]) : []
  } catch {
    return []
  }
}

export function clearLogs(): void {
  try {
    localStorage.removeItem(LOG_KEY)
  } catch {
    // ignore
  }
}

export function logsAsText(): string {
  return getLogs()
    .map((e) => `[${e.ts}] ${e.step}${e.data ? ' ' + JSON.stringify(e.data) : ''}`)
    .join('\n')
}
