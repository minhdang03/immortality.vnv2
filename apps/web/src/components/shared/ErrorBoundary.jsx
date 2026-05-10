import { Component } from 'react'

// Class component required — React only calls componentDidCatch on classes.
// Wraps a route subtree so a single component crash doesn't whitescreen the entire app.
export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // Surface to console + analytics (if wired). Keep silent in prod console for end users.
    console.error('[ErrorBoundary]', error, info?.componentStack)
  }

  reset = () => this.setState({ error: null })

  render() {
    if (!this.state.error) return this.props.children
    const lang = (typeof navigator !== 'undefined' && navigator.language?.startsWith('en')) ? 'en' : 'vi'
    return (
      <div style={{
        padding: '40px 20px', textAlign: 'center', maxWidth: 480, margin: '0 auto',
        color: 'var(--text, #e0c890)'
      }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: 12 }}>
          {lang === 'vi' ? 'Đã có lỗi xảy ra' : 'Something went wrong'}
        </h2>
        <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: 20 }}>
          {lang === 'vi'
            ? 'Trang này gặp sự cố. Bạn có thể thử lại hoặc về trang chủ.'
            : 'This page hit an error. Try again or go home.'}
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button onClick={this.reset} style={btn}>{lang === 'vi' ? 'Thử lại' : 'Retry'}</button>
          <button onClick={() => { window.location.href = '/' }} style={btn}>
            {lang === 'vi' ? 'Trang chủ' : 'Home'}
          </button>
        </div>
        {import.meta.env.DEV && (
          <pre style={{ marginTop: 24, fontSize: 11, textAlign: 'left', opacity: 0.6, overflow: 'auto' }}>
            {this.state.error?.stack || String(this.state.error)}
          </pre>
        )}
      </div>
    )
  }
}

const btn = {
  padding: '8px 16px', fontSize: '0.85rem', borderRadius: 6,
  background: 'rgba(201,168,108,0.15)', color: 'var(--text, #e0c890)',
  border: '1px solid rgba(201,168,108,0.3)', cursor: 'pointer',
}
