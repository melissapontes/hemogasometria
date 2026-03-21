import type { ReactNode } from 'react'

type PageContainerProps = {
  children: ReactNode
  maxWidthClassName?: string
}

export function PageContainer({ children, maxWidthClassName = 'max-w-4xl' }: PageContainerProps) {
  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_5%_-10%,rgba(6,182,212,0.25),transparent_38%),radial-gradient(circle_at_92%_110%,rgba(45,212,191,0.2),transparent_32%),linear-gradient(180deg,#f8fbff,#edf4ff_60%,#eef8f9)] px-3 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 sm:px-6 sm:pb-8 sm:pt-6">
      <div className={`mx-auto w-full ${maxWidthClassName}`}>{children}</div>
    </main>
  )
}
