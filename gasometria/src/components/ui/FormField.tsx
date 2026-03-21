import type { ReactNode } from 'react'

type FormFieldProps = {
  id: string
  label: string
  children: ReactNode
  className?: string
}

export function FormField({ id, label, children, className }: FormFieldProps) {
  return (
    <div className={className ?? 'space-y-1.5'}>
      <label className="text-sm font-medium text-slate-700" htmlFor={id}>
        {label}
      </label>
      {children}
    </div>
  )
}
