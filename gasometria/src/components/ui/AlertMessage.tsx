import { cn } from '../../lib/utils'

type AlertTone = 'error' | 'info'

type AlertMessageProps = {
  message: string
  tone?: AlertTone
}

export function AlertMessage({ message, tone = 'error' }: AlertMessageProps) {
  return (
    <div
      className={cn(
        'mb-4 rounded-xl border px-4 py-3 text-sm',
        tone === 'error'
          ? 'border-red-200 bg-red-50 text-red-700'
          : 'border-sky-200 bg-sky-50 text-sky-700',
      )}
    >
      {message}
    </div>
  )
}
