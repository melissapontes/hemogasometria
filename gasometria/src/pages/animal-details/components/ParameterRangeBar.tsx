type ParameterRangeBarProps = {
  label: string
  min: number | null
  max: number | null
  patientValue: number | null
  patientLabel?: string
}

function formatValue(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

export function ParameterRangeBar({ label, min, max, patientValue, patientLabel = 'Paciente' }: ParameterRangeBarProps) {
  if (min === null || max === null || max <= min) {
    return <p className="text-xs text-slate-500">Faixa da maquina indisponivel para {label.toLowerCase()}.</p>
  }

  const span = max - min
  const visualMin = min - span * 0.35
  const visualMax = max + span * 0.35
  const visualSpan = visualMax - visualMin

  const machineMinPercent = ((min - visualMin) / visualSpan) * 100
  const machineMaxPercent = ((max - visualMin) / visualSpan) * 100

  const rawPatientPercent = patientValue === null ? null : ((patientValue - visualMin) / visualSpan) * 100
  const patientPercent = rawPatientPercent === null ? null : Math.min(98, Math.max(2, rawPatientPercent))

  return (
    <div className="space-y-2">
      <div className="relative h-3 rounded-full bg-slate-200">
        <div
          className="absolute h-full rounded-full bg-emerald-300"
          style={{ left: `${machineMinPercent}%`, width: `${machineMaxPercent - machineMinPercent}%` }}
        />

        <div className="absolute top-[-6px] h-6 w-[2px] bg-emerald-700" style={{ left: `${machineMinPercent}%` }} />
        <div className="absolute top-[-6px] h-6 w-[2px] bg-emerald-700" style={{ left: `${machineMaxPercent}%` }} />

        {patientPercent !== null ? (
          <>
            <div
              className="absolute top-[-19px] h-4 w-4 -translate-x-1/2 rounded-full border-2 border-white bg-sky-600 shadow"
              style={{ left: `${patientPercent}%` }}
              title={`${patientLabel}: ${formatValue(patientValue as number)}`}
            />
            <div className="absolute top-[-7px] h-3 w-[2px] -translate-x-1/2 bg-sky-600" style={{ left: `${patientPercent}%` }} />
          </>
        ) : null}
      </div>

      <div className="flex justify-between text-[11px] text-slate-500">
        <span>Min maq: {formatValue(min)}</span>
        <span>Max maq: {formatValue(max)}</span>
      </div>

      <p className="text-[11px] text-slate-600">
        {patientValue === null ? `${patientLabel}: nao encontrado` : `${patientLabel}: ${formatValue(patientValue)}`}
      </p>
    </div>
  )
}
