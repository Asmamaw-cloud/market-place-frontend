import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface PriceDisplayProps {
  amount: number
  currency?: string
  className?: string
  showCurrency?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'muted' | 'destructive' | 'success'
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl'
}

const variantClasses = {
  default: 'text-foreground',
  muted: 'text-muted-foreground',
  destructive: 'text-destructive',
  success: 'text-green-600'
}

export function PriceDisplay({
  amount,
  currency = 'ETB',
  className,
  showCurrency = true,
  size = 'md',
  variant = 'default'
}: PriceDisplayProps) {
  const formattedAmount = formatCurrency(amount)
  const displayText = showCurrency ? formattedAmount : formattedAmount.replace(' ETB', '')

  return (
    <span
      className={cn(
        'font-semibold',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      {displayText}
    </span>
  )
}
