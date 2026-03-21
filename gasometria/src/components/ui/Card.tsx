import * as React from 'react'
import { cn } from '../../lib/utils'

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-3xl border border-slate-200/90 bg-white/95 shadow-[0_8px_30px_-18px_rgba(15,23,42,0.35)]',
        className,
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5 pb-0 sm:p-6 sm:pb-0', className)} {...props} />
}

export function CardBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5 sm:p-6', className)} {...props} />
}
