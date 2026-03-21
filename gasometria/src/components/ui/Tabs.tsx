import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '../../lib/utils'

export const Tabs = TabsPrimitive.Root

export function TabsList({ className, ...props }: TabsPrimitive.TabsListProps) {
  return (
    <TabsPrimitive.List
      className={cn('inline-flex w-full rounded-2xl border border-slate-200 bg-slate-50 p-1', className)}
      {...props}
    />
  )
}

export function TabsTrigger({ className, ...props }: TabsPrimitive.TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'flex-1 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm',
        className,
      )}
      {...props}
    />
  )
}

export function TabsContent({ className, ...props }: TabsPrimitive.TabsContentProps) {
  return <TabsPrimitive.Content className={cn('mt-3', className)} {...props} />
}
