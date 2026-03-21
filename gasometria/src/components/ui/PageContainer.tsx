import type { ReactNode } from 'react'

type PageContainerProps = {
  children: ReactNode
  maxWidthClassName?: string
}

export function PageContainer({ children, maxWidthClassName = 'max-w-4xl' }: PageContainerProps) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_10%_10%,rgba(14,165,233,0.2),transparent_32%),radial-gradient(circle_at_90%_90%,rgba(34,197,94,0.18),transparent_30%),linear-gradient(180deg,#f8fbff,#eff6ff)] px-3 py-5 sm:px-6 sm:py-8">
      <div className={`mx-auto w-full ${maxWidthClassName}`}>{children}</div>
    </main>
  )
}
