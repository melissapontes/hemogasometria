type ParameterRangeBarProps = {
  label: string
  min: number | null
  max: number | null
  patientValue: number | null
  patientLabel?: string
  refText?: string
  forcedVisualMin?: number
  forcedVisualMax?: number
  barColor?: string
  labelDecimals?: number
  labelColor?: string
}

function formatValue(value: number, decimals?: number): string {
  return decimals !== undefined ? value.toFixed(decimals) : String(value)
}

export function ParameterRangeBar({ label, min, max, patientValue, patientLabel = 'Paciente', refText, forcedVisualMin, forcedVisualMax, barColor = '#1b9bb6', labelDecimals, labelColor = '#4d4d4d' }: ParameterRangeBarProps) {
  if (min === null || max === null || max <= min) {
    return <p className="text-xs text-slate-500">Faixa da máquina indisponível para {label.toLowerCase()}.</p>
  }

  const span = max - min
  const visualMin = forcedVisualMin ?? min - span * 0.35
  const visualMax = forcedVisualMax ?? max + span * 0.35
  const visualSpan = visualMax - visualMin

  const machineMinPercent = ((min - visualMin) / visualSpan) * 100
  const machineMaxPercent = ((max - visualMin) / visualSpan) * 100

  const rawPatientPercent = patientValue === null ? null : ((patientValue - visualMin) / visualSpan) * 100
  const patientPercent = rawPatientPercent === null ? null : Math.min(98, Math.max(2, rawPatientPercent))

  return (
    <div>
      {/* Barra com espaço acima para o pin do paciente */}
      <div className="relative mt-6 h-3 rounded-full bg-slate-200">
        {/* Faixa de referência da máquina */}
        <div
          className="absolute h-full rounded-full"
          style={{ left: `${machineMinPercent}%`, width: `${machineMaxPercent - machineMinPercent}%`, zIndex: 1, backgroundColor: barColor }}
        />

        {/* Marcadores das extremidades da máquina */}
        <div className="absolute top-[-6px] h-6 w-[2px] bg-emerald-700" style={{ left: `${machineMinPercent}%`, zIndex: 2 }} />
        <div className="absolute top-[-6px] h-6 w-[2px] bg-emerald-700" style={{ left: `${machineMaxPercent}%`, zIndex: 2 }} />

        {/* Pin do paciente */}
        {patientPercent !== null ? (
          <>
            <div
              className="absolute top-[-19px] h-4 w-4 -translate-x-1/2 rounded-full border-2 border-white bg-sky-600 shadow"
              style={{ left: `${patientPercent}%`, zIndex: 3 }}
              title={`${patientLabel}: ${formatValue(patientValue as number)}`}
            />
            <div className="absolute top-[-7px] h-3 w-[2px] -translate-x-1/2 bg-sky-600" style={{ left: `${patientPercent}%`, zIndex: 3 }} />
          </>
        ) : null}
      </div>

      {/* Labels min/max abaixo da barra */}
      <div className="relative mt-3 h-4">
        <span
          className="absolute -translate-x-1/2 text-xs font-semibold"
          style={{ left: `${machineMinPercent}%`, color: labelColor }}
        >
          {formatValue(min, labelDecimals)}
        </span>
        <span
          className="absolute -translate-x-1/2 text-xs font-semibold"
          style={{ left: `${machineMaxPercent}%`, color: labelColor }}
        >
          {formatValue(max, labelDecimals)}
        </span>
      </div>

      {refText && (
        <div className="text-[13px] text-slate-700 mt-1">{refText}</div>
      )}
    </div>
  )
}
