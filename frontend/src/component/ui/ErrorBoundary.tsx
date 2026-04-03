import { Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'
import { MESSAGES } from '../../constants/messages'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    // Could integrate with error tracking service here (Sentry, etc.)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className='min-h-screen w-full flex flex-col items-center justify-center bg-red-50 p-4'>
          <div className='max-w-md text-center'>
            <h1 className='text-3xl font-bold text-red-700 mb-4'>❌ Oups!</h1>
            <p className='text-red-600 mb-4'>Une erreur inattendue s\'est produite.</p>
            
            <details className='mb-6 text-left bg-white rounded-lg p-4 border border-red-200'>
              <summary className='cursor-pointer font-semibold text-red-700 mb-2'>
                Détails de l\'erreur
              </summary>
              <code className='block text-xs text-red-600 overflow-auto max-h-32 whitespace-pre-wrap break-words'>
                {this.state.error?.message || MESSAGES.UNKNOWN_ERROR}
              </code>
            </details>

            <button
              onClick={this.handleReset}
              className='bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md transition-colors'
            >
              Retourner à l'accueil
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
