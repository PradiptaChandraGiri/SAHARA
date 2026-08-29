import React, { useState, useEffect } from 'react'
import { Smartphone, Download, X, Check } from 'lucide-react'

export default function InstallAppBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if already in standalone mode (installed Android app / PWA)
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) {
      setIsInstalled(true)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      // Check if user dismissed recently
      const dismissed = localStorage.getItem('sahara_install_dismissed')
      if (!dismissed) {
        setShowBanner(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handler)

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setShowBanner(false)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback info for browsers that don't emit prompt
      alert('To install SAHARA on Android: Tap your browser menu (⋮) and choose "Install App" or "Add to Home screen".')
      return
    }

    deferredPrompt.prompt()
    const choiceResult = await deferredPrompt.userChoice
    if (choiceResult.outcome === 'accepted') {
      setShowBanner(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowBanner(false)
    localStorage.setItem('sahara_install_dismissed', 'true')
  }

  if (isInstalled || !showBanner) return null

  return (
    <aside
      aria-label="Install Android App"
      style={{
        position: 'fixed',
        top: 60,
        left: 16,
        right: 16,
        maxWidth: 480,
        margin: '0 auto',
        zIndex: 95,
        background: 'var(--color-surface)',
        border: '1.5px solid var(--color-primary)',
        borderRadius: 14,
        padding: '12px 16px',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        animation: 'fadeIn 0.3s ease-out',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'var(--color-primary-subtle)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Smartphone size={18} />
        </div>
        <div style={{ minWidth: 0 }}>
          <h4 style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Install SAHARA on Android
          </h4>
          <p style={{ margin: 0, fontSize: 11.5, color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Fast 1-tap launcher icon with zero device storage overhead.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button
          onClick={handleInstallClick}
          className="btn-teal"
          style={{ padding: '6px 12px', fontSize: 12, fontWeight: 700, borderRadius: 8 }}
        >
          <Download size={13} />
          <span>Install</span>
        </button>
        <button
          onClick={handleDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
            padding: 4,
          }}
          title="Dismiss"
        >
          <X size={16} />
        </button>
      </div>
    </aside>
  )
}
