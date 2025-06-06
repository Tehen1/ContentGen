"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Error boundary component specifically for Web3-related errors
 * Catches errors thrown by Web3 components and displays a fallback UI
 */
export class Web3ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can log the error to an error reporting service here
    console.error("Web3 Error Boundary caught an error:", error, errorInfo)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center p-6 m-4 text-center border rounded-lg bg-red-50 border-red-200">
            <h2 className="text-xl font-bold text-red-700">Web3 Connection Error</h2>
            <p className="mt-2 text-red-600">{this.state.error?.message || "There was an issue connecting to Web3."}</p>
            <div className="mt-4">
              <button
                className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
                onClick={() => {
                  // Reset the error boundary state
                  this.setState({ hasError: false, error: null })

                  // Reload the window as a last resort
                  window.location.reload()
                }}
              >
                Try Again
              </button>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              If this issue persists, please make sure your wallet is connected and properly configured.
            </p>
          </div>
        )
      )
    }

    return this.props.children
  }
}
