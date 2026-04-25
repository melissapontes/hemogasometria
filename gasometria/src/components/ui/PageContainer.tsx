import type { CSSProperties, ReactNode } from 'react'

type PageContainerProps = {
  children: ReactNode
  maxWidthClassName?: string
  style?: CSSProperties
}

export function PageContainer({ children, maxWidthClassName = 'max-w-4xl', style }: PageContainerProps) {
  return (
    <main
      className="min-h-dvh bg-[#303136] px-3 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 sm:px-6 sm:pb-8 sm:pt-6"
      style={style}
    >
      <div className={`mx-auto w-full ${maxWidthClassName}`}>{children}</div>
    </main>
  )
}
