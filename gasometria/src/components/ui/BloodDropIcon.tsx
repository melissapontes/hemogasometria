type BloodDropIconProps = {
  className?: string
  size?: number
}

export function BloodDropIcon({ className, size = 32 }: BloodDropIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 120"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <path
        d="M50,5 C34,28 12,55 12,78 A38,38 0 0,0 88,78 C88,55 66,28 50,5 Z"
        fill="#8B1A2A"
      />
    </svg>
  )
}
