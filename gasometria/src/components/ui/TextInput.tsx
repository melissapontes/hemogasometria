import * as React from 'react'
import { cn } from '../../lib/utils'

export type TextInputProps = React.InputHTMLAttributes<HTMLInputElement>

export function TextInput({ className, ...props }: TextInputProps) {
  return (
    <input
      className={cn(
        'h-12 w-full rounded-2xl border border-slate-200 bg-white px-3.5 text-sm text-[#4d4d4d] shadow-[0_1px_0_0_rgba(15,23,42,0.02)] outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100',
        className,
      )}
      {...props}
    />
  )
}
