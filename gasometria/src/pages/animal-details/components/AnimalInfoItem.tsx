type AnimalInfoItemProps = {
  label: string
  value: string
  breakAll?: boolean
}

export function AnimalInfoItem({ label, value, breakAll = false }: AnimalInfoItemProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 font-semibold text-slate-800 ${breakAll ? 'break-all' : ''}`}>{value}</p>
    </div>
  )
}
