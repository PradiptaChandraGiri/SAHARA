import React, { useEffect, useRef, useState } from 'react'

interface AnalyzingVisualizationProps {
  statuses?: string[]
  size?: 'sm' | 'md' | 'lg'
  subtext?: string
  className?: string
}

const DEFAULT_STATUSES = [
  'Reading your check-in answers',
  'Weighing sleep and stress factors',
  'Comparing against the trained model',
  'Preparing your results',
]

export default function AnalyzingVisualization({
  statuses = DEFAULT_STATUSES,
  size = 'md',
  subtext,
  className = '',
}: AnalyzingVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [statusIdx, setStatusIdx] = useState(0)
  const [dotIdx, setDotIdx] = useState(0)
  const [hasCanvasSupport, setHasCanvasSupport] = useState(true)

  // Size dimensions
  const dims = size === 'sm' ? { w: 180, h: 180, r: 70 } : size === 'lg' ? { w: 320, h: 320, r: 120 } : { w: 260, h: 260, r: 95 }

  // Cycle status text
  useEffect(() => {
    if (!statuses || statuses.length <= 1) return
    const interval = setInterval(() => {
      setStatusIdx((prev) => (prev + 1) % statuses.length)
    }, 1800)
    return () => clearInterval(interval)
  }, [statuses])

  // Cycle animated 3-dot indicator
  useEffect(() => {
    const interval = setInterval(() => {
      setDotIdx((prev) => (prev + 1) % 3)
    }, 450)
    return () => clearInterval(interval)
  }, [])

  // 3D Point-Cloud Sphere Animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      setHasCanvasSupport(false)
      return
    }

    let animationFrameId: number
    const W = canvas.width
    const H = canvas.height
    const cx = W / 2
    const cy = H / 2
    const radius = dims.r

    // Detect dark theme from document data-mode / dark class / system preference
    const checkIsDark = () => {
      if (typeof document === 'undefined') return false
      const mode = document.documentElement.getAttribute('data-mode') || document.body.getAttribute('data-mode')
      if (mode === 'dark' || document.documentElement.classList.contains('dark')) return true
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    }

    const isDark = checkIsDark()
    const nodeColor = isDark ? '#5DCAA5' : '#0F6E56'
    const lineColor = isDark ? 'rgba(93, 202, 165, 0.25)' : 'rgba(15, 110, 86, 0.2)'

    // Generate ~44 points on sphere using golden spiral (Fibonacci sphere)
    const nodeCount = 44
    const pts: { x0: number; y0: number; z0: number }[] = []
    for (let i = 0; i < nodeCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / nodeCount)
      const theta = Math.sqrt(nodeCount * Math.PI) * phi
      pts.push({
        x0: Math.cos(theta) * Math.sin(phi),
        y0: Math.sin(theta) * Math.sin(phi),
        z0: Math.cos(phi),
      })
    }

    // Connect close neighbors
    const links: [number, number][] = []
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x0 - pts[j].x0
        const dy = pts[i].y0 - pts[j].y0
        const dz = pts[i].z0 - pts[j].z0
        if (Math.sqrt(dx * dx + dy * dy + dz * dz) < 0.55) {
          links.push([i, j])
        }
      }
    }

    const t0 = performance.now()

    const renderFrame = (now: number) => {
      const t = (now - t0) / 1000
      const ay = t * 0.45 // Y-axis rotation ~0.45 rad/sec
      const ax = Math.sin(t * 0.3) * 0.25 // Slight wobble on X
      const scale = radius * (1 + Math.sin(t * 1.6) * 0.02) // Subtle ~2% breathing pulse

      const proj = pts.map((p) => {
        const x = p.x0
        const y = p.y0
        const z = p.z0
        const cosA = Math.cos(ay)
        const sinA = Math.sin(ay)
        const x1 = x * cosA - z * sinA
        const z1 = x * sinA + z * cosA
        const cosB = Math.cos(ax)
        const sinB = Math.sin(ax)
        const y1 = y * cosB - z1 * sinB
        const z2 = y * sinB + z1 * cosB
        const persp = 2.6 / (2.6 - z2)
        return {
          x: cx + x1 * scale * persp,
          y: cy + y1 * scale * persp,
          z: z2,
          s: persp,
        }
      })

      ctx.clearRect(0, 0, W, H)

      // Draw connecting lines
      ctx.lineWidth = 1.2
      ctx.strokeStyle = lineColor
      for (let i = 0; i < links.length; i++) {
        const a = proj[links[i][0]]
        const b = proj[links[i][1]]
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.stroke()
      }

      // Draw point nodes
      for (let i = 0; i < proj.length; i++) {
        const p = proj[i]
        ctx.beginPath()
        ctx.fillStyle = nodeColor
        ctx.globalAlpha = 0.45 + 0.55 * ((p.z + 1) / 2)
        ctx.arc(p.x, p.y, 2.5 * p.s, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      animationFrameId = requestAnimationFrame(renderFrame)
    }

    animationFrameId = requestAnimationFrame(renderFrame)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [dims.r])

  return (
    <div
      className={`analyzing-visualization-container ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        gap: 16,
        userSelect: 'none',
      }}
    >
      {/* 3D Sphere Canvas / Fallback */}
      {hasCanvasSupport ? (
        <canvas
          ref={canvasRef}
          width={dims.w}
          height={dims.h}
          style={{
            width: dims.w,
            height: dims.h,
            background: 'transparent',
            display: 'block',
          }}
        />
      ) : (
        /* CSS-only fallback when canvas is unsupported */
        <div
          style={{
            width: dims.w,
            height: dims.h,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              border: '3px solid var(--color-primary-subtle, rgba(15,110,86,0.2))',
              borderTopColor: 'var(--color-primary, #0F6E56)',
              animation: 'spin 1s linear infinite',
            }}
          />
        </div>
      )}

      {/* Cycling Status Label */}
      <div style={{ textAlign: 'center', maxWidth: 360 }}>
        <p
          style={{
            fontSize: size === 'sm' ? 13 : 14.5,
            fontWeight: 600,
            color: 'var(--color-text-secondary, #475569)',
            margin: 0,
            minHeight: 22,
            transition: 'opacity 0.2s ease',
            lineHeight: 1.4,
          }}
        >
          {statuses[statusIdx] || 'Analyzing wellbeing factors...'}
        </p>

        {subtext && (
          <p style={{ fontSize: 12, color: 'var(--color-text-muted, #94A3B8)', margin: '4px 0 0' }}>
            {subtext}
          </p>
        )}

        {/* Animated 3-dot step indicator */}
        <div
          style={{
            display: 'flex',
            gap: 6,
            justifyContent: 'center',
            marginTop: 10,
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background:
                  i === dotIdx
                    ? 'var(--color-primary, #0F6E56)'
                    : 'var(--color-border, rgba(15,110,86,0.25))',
                transition: 'background-color 0.25s ease',
                transform: i === dotIdx ? 'scale(1.2)' : 'scale(1)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
