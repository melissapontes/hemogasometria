import * as React from 'react'
import { cn } from '../../lib/utils'

export type TextAreaInputProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

export function TextAreaInput({ className, ...props }: TextAreaInputProps) {
  return (
    <textarea
      className={cn(
        'min-h-24 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200',
        className,
      )}
      {...props}
    />
  )
}
