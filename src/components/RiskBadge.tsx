import React from 'react'
import { ShieldCheck, AlertCircle, AlertTriangle } from 'lucide-react'

export type RiskTier = 'low' | 'medium' | 'moderate' | 'high'

interface RiskBadgeProps {
  tier?: RiskTier | string
  level?: RiskTier | string
  score?: number
  size?: 'sm' | 'md' | 'lg'
}

export default function RiskBadge({ tier, level, score, size = 'md' }: RiskBadgeProps) {
  let rawTier = tier || level
  if (!rawTier && score !== undefined) {
    rawTier = score > 65 ? 'high' : score > 35 ? 'medium' : 'low'
  }
  const normTier = (rawTier || 'low').toLowerCase()
  const isHigh = normTier === 'high'
  const isMed = normTier === 'medium' || normTier === 'moderate'
  
  let label = 'Low Risk'
  let bg = 'var(--color-risk-low-bg)'
  let text = 'var(--color-risk-low-text)'
  let border = 'var(--color-risk-low-border)'
  let dot = 'var(--color-risk-low)'
  let IconComponent = ShieldCheck

  if (isHigh) {
    label = 'High Priority'
    bg = 'var(--color-risk-high-bg)'
    text = 'var(--color-risk-high-text)'
    border = 'var(--color-risk-high-border)'
    dot = 'var(--color-risk-high)'
    IconComponent = AlertCircle
  } else if (isMed) {
    label = 'Moderate Risk'
    bg = 'var(--color-risk-moderate-bg)'
    text = 'var(--color-risk-moderate-text)'
    border = 'var(--color-risk-moderate-border)'
    dot = 'var(--color-risk-moderate)'
    IconComponent = AlertTriangle
  }

  const padding = size === 'sm' ? '3px 8px' : size === 'lg' ? '6px 14px' : '4px 10px'
  const fontSize = size === 'sm' ? '11.5px' : size === 'lg' ? '14px' : '12.5px'
  const iconSize = size === 'sm' ? 12 : size === 'lg' ? 16 : 14

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
      <IconComponent size={iconSize} color={dot} />
      <span>{label}</span>
      {score !== undefined && (
        <span style={{ opacity: 0.9, fontWeight: 600, fontSize: '0.9em' }}>({score}%)</span>
      )}
    </span>
  )
}
