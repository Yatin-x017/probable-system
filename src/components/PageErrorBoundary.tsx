import { Component, type ReactNode } from 'react'
import { RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  /** Changing this (e.g. the route path) remounts the boundary, clearing
   * any previous error so the next page gets a fresh start. */
  resetKey: string
}

interface State {
  hasError: boolean
}

// Without this, an uncaught render error anywhere on a page (a bad API
// response, a third-party library like react-three-fiber failing to get a
// WebGL context, etc.) unmounts the entire React tree and leaves a blank
// white screen with no way to recover short of a manual reload.
export default class PageErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error('Page crashed:', error, info)
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Something went wrong loading this page
          </h2>
          <p className="text-gray-500 mb-6 max-w-md">
            Try reloading — if it keeps happening, head back to the homepage.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold px-4 py-2.5 rounded-full transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reload page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
