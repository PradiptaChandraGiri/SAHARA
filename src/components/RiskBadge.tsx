import React from 'react'

export type RiskTier = 'low' | 'medium' | 'moderate' | 'high'

interface RiskBadgeProps {
  tier: RiskTier | string
  score?: number
  size?: 'sm' | 'md' | 'lg'
}

export default function RiskBadge({ tier, score, size = 'md' }: RiskBadgeProps) {
  const normTier = (tier || 'low').toLowerCase()
  const isHigh = normTier === 'high'
  const isMed = normTier === 'medium' || normTier === 'moderate'
  
  // Design System Rules:
  // Low = Green (#16A34A / #F0FDF4 / #BBF7D0)
  // Moderate = Amber (#D97706 / #FFFBEB / #FDE68A)
  // High = Red-Orange (#EA580C / #FFF7ED / #FED7AA) - never pure alarm-red
  
  let label = 'Low Risk'
  let bg = '#F0FDF4'
  let text = '#166534'
  let border = '#BBF7D0'
  let dot = '#16A34A'

  if (isHigh) {
    label = 'High Priority'
    bg = '#FFF7ED'
    text = '#9A3412'
    border = '#FED7AA'
    dot = '#EA580C'
  } else if (isMed) {
    label = 'Moderate Risk'
    bg = '#FFFBEB'
    text = '#92400E'
    border = '#FDE68A'
    dot = '#D97706'
  }

  const padding = size === 'sm' ? '3px 8px' : size === 'lg' ? '6px 14px' : '4px 10px'
  const fontSize = size === 'sm' ? '11.5px' : size === 'lg' ? '14px' : '12.5px'
  const dotSize = size === 'sm' ? 6 : size === 'lg' ? 8 : 7

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding,
        borderRadius: 999,
        background: bg,
        color: text,
        border: `1px solid ${border}`,
        fontSize,
        fontWeight: 700,
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: '50%',
          backgroundColor: dot,
        }}
      />
      <span>{label}</span>
      {score !== undefined && (
        <span style={{ opacity: 0.85, fontWeight: 500, fontSize: '0.9em' }}>({score}%)</span>
      )}
    </span>
  )
}
