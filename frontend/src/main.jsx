import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, info) {
    console.error('🔴 React crash:', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, color: '#f87171', fontFamily: 'monospace', background: '#0a0f0a', minHeight: '100vh' }}>
          <h2>⚠️ Application Error</h2>
          <pre style={{ marginTop: 16, whiteSpace: 'pre-wrap', fontSize: 13 }}>
            {this.state.error?.toString()}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
)
