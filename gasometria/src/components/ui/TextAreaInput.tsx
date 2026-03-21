import * as React from 'react'
import { cn } from '../../lib/utils'

export type TextAreaInputProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

export function TextAreaInput({ className, ...props }: TextAreaInputProps) {
  return (
    <textarea
      className={cn(
        'min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 shadow-[0_1px_0_0_rgba(15,23,42,0.02)] outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100',
        className,
      )}
      {...props}
    />
  )
}
