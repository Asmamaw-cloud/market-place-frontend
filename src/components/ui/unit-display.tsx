import { formatUnit } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { UnitType } from '@/types'

interface UnitDisplayProps {
  quantity: number
  unitType: UnitType
  className?: string
  showUnit?: boolean
  precision?: number
}

export function UnitDisplay({
  quantity,
  unitType,
  className,
  showUnit = true,
  precision = 2
}: UnitDisplayProps) {
  const formattedQuantity = quantity.toFixed(precision)
  const displayText = showUnit 
    ? formatUnit(quantity, unitType)
    : formattedQuantity

  return (
    <span className={cn('font-medium', className)}>
      {displayText}
    </span>
  )
}
