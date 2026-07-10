/**
 * VaultAudit AI — Error Boundary Component
 *
 * Catches React rendering errors in child components and displays
 * a graceful fallback instead of crashing the entire app.
 */

import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[VaultAudit] Component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center py-10 text-center rounded-2xl border border-rose-400/20 bg-rose-500/[0.06] p-6">
          <p className="text-sm font-semibold text-rose-300">Something went wrong</p>
          <p className="mt-1 text-xs text-white/40 max-w-xs">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-3 text-xs font-medium text-rose-300 hover:text-rose-200 underline"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
