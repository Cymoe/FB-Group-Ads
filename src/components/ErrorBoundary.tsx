import React, { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

class ErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })

    // You can log to an error reporting service here
    // Example: logErrorToService(error, errorInfo)
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <ErrorFallback 
          error={this.state.error} 
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
        />
      )
    }

    return this.props.children
  }
}

// Separate component for error display
function ErrorFallback({ 
  error, 
  errorInfo, 
  onReset 
}: { 
  error: Error | null
  errorInfo: ErrorInfo | null
  onReset: () => void
}) {
  const isDarkMode = document.documentElement.classList.contains('dark') || 
                     window.matchMedia('(prefers-color-scheme: dark)').matches
  
  const handleGoHome = () => {
    onReset()
    window.location.href = '/'
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: isDarkMode ? '#111827' : '#ffffff' }}
    >
      <div 
        className="max-w-md w-full rounded-lg p-6 shadow-xl"
        style={{ 
          backgroundColor: isDarkMode ? '#1F2937' : '#ffffff',
          border: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
          >
            <AlertTriangle size={24} className="text-red-500" />
          </div>
          <div>
            <h2 
              className="text-lg font-semibold"
              style={{ color: isDarkMode ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.95)' }}
            >
              Something went wrong
            </h2>
            <p 
              className="text-sm mt-1"
              style={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}
            >
              An unexpected error occurred
            </p>
          </div>
        </div>

        {error && (
          <div 
            className="mb-4 p-3 rounded text-xs font-mono overflow-auto max-h-32"
            style={{ 
              backgroundColor: isDarkMode ? '#111827' : '#F9FAFB',
              border: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`,
              color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'
            }}
          >
            <div className="font-semibold mb-1" style={{ color: '#EF4444' }}>
              {error.name}: {error.message}
            </div>
            {error.stack && (
              <div className="text-[10px] opacity-75 whitespace-pre-wrap">
                {error.stack.split('\n').slice(0, 5).join('\n')}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={onReset}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded text-sm font-medium transition-colors"
            style={{ 
              backgroundColor: '#3B82F6',
              color: '#ffffff'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3B82F6'}
          >
            <RefreshCw size={16} />
            Try Again
          </button>
          <button
            onClick={handleGoHome}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded text-sm font-medium transition-colors"
            style={{ 
              backgroundColor: isDarkMode ? '#374151' : '#F3F4F6',
              color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)',
              border: `1px solid ${isDarkMode ? '#4B5563' : '#D1D5DB'}`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isDarkMode ? '#4B5563' : '#E5E7EB'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = isDarkMode ? '#374151' : '#F3F4F6'
            }}
          >
            <Home size={16} />
            Go Home
          </button>
        </div>

        {process.env.NODE_ENV === 'development' && errorInfo && (
          <details 
            className="mt-4 p-3 rounded text-xs"
            style={{ 
              backgroundColor: isDarkMode ? '#111827' : '#F9FAFB',
              border: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`
            }}
          >
            <summary 
              className="cursor-pointer font-medium mb-2"
              style={{ color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}
            >
              Error Details (Development Only)
            </summary>
            <pre 
              className="text-[10px] overflow-auto max-h-40 font-mono"
              style={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}
            >
              {errorInfo.componentStack}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}

// Wrapper component to use hooks
export const ErrorBoundary: React.FC<Props> = (props) => {
  return <ErrorBoundaryClass {...props} />
}
