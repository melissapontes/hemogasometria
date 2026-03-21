import * as React from 'react'
import { cn } from '../../lib/utils'

export type SelectInputProps = React.SelectHTMLAttributes<HTMLSelectElement>

export function SelectInput({ className, children, ...props }: SelectInputProps) {
  return (
    <select
      className={cn(
        'h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}
