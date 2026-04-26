import type { CSSProperties, ReactNode } from 'react'

type PageContainerProps = {
  children: ReactNode
  maxWidthClassName?: string
  style?: CSSProperties
  overlay?: CSSProperties
}

export function PageContainer({ children, maxWidthClassName = 'max-w-4xl', style, overlay }: PageContainerProps) {
  return (
    <main
      className="relative min-h-dvh bg-[#303136] px-3 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 sm:px-6 sm:pb-8 sm:pt-6"
      style={style}
    >
      {overlay && <div className="pointer-events-none absolute inset-0" style={overlay} />}
      <div className={`relative mx-auto w-full ${maxWidthClassName}`}>{children}</div>
    </main>
  )
}
