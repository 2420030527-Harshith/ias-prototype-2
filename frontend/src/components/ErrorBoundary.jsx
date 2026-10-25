import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 my-6 bg-slate-900 border border-rose-800/80 rounded-2xl shadow-2xl space-y-4 max-w-2xl mx-auto text-center font-mono">
          <div className="w-12 h-12 rounded-xl bg-rose-950 text-rose-400 mx-auto flex items-center justify-center border border-rose-800">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Component Error Intercepted</h3>
          <p className="text-xs text-slate-300">
            {this.state.error?.message || 'An unexpected rendering error occurred in this module.'}
          </p>
          <div className="pt-2">
            <button
              onClick={this.handleReset}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-rose-600/20"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry / Reload Module</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
