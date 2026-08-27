import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallbackTitle?: string
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled React Error Boundary caught:', error, errorInfo)
    this.setState({ errorInfo })
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '60vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 32,
            background: 'var(--bg-app, #F9F9F8)',
          }}
        >
          <div
            style={{
              maxWidth: 520,
              background: '#FFFFFF',
              border: '1.5px solid #FED7AA',
              borderRadius: 16,
              padding: '32px 36px',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: '#FFF7ED',
                color: '#EA580C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <AlertTriangle size={24} />
            </div>

            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0E1A2B', margin: '0 0 8px' }}>
              {this.props.fallbackTitle || 'Something went wrong displaying this section'}
            </h2>

            <p style={{ fontSize: 13.5, color: '#64748B', lineHeight: 1.5, margin: '0 0 20px' }}>
              {this.state.error?.message || 'An unexpected error occurred while loading this view.'}
            </p>

            <button
              onClick={this.handleReset}
              className="btn-teal"
              style={{ padding: '10px 20px', fontSize: 13.5 }}
            >
              <RotateCcw size={15} />
              <span>Reload Section</span>
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
