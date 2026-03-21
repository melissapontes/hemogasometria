import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-2xl text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 active:scale-[0.99]',
  {
    variants: {
      variant: {
        primary: 'bg-cyan-600 text-white shadow-sm hover:bg-cyan-700',
        secondary: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
      },
      size: {
        default: 'h-11 px-4 py-2',
        sm: 'h-10 px-3.5',
        lg: 'h-12 px-5 text-[0.95rem]',
      },
    },
    defaultVariants: {
      variant: 'secondary',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size, className }))} {...props} />
}
