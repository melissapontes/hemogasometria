type ErrorReport = {
  message: string
  stack?: string
  context?: string
  url: string
  userAgent: string
  userId?: string
  timestamp: string
}

export function reportError(error: unknown, context?: string, userId?: string): void {
  const message = error instanceof Error ? error.message : String(error)
  const stack = error instanceof Error ? error.stack : undefined

  const report: ErrorReport = {
    message,
    stack,
    context,
    url: window.location.href,
    userAgent: navigator.userAgent,
    userId,
    timestamp: new Date().toISOString(),
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

  if (!supabaseUrl || !supabaseKey) return

  fetch(`${supabaseUrl}/functions/v1/report-error`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: supabaseKey,
    },
    body: JSON.stringify(report),
  }).catch(() => {})
}
