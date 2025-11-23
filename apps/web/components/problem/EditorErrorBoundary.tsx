"use client";

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary for Monaco Editor
 * Catches and handles editor crashes gracefully
 */
export class EditorErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Editor Error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full w-full bg-slate-900 flex flex-col items-center justify-center gap-4 p-8">
          <AlertTriangle className="w-16 h-16 text-red-500" />
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold text-white">
              Editor Failed to Load
            </h3>
            <p className="text-slate-400 text-sm max-w-md">
              The code editor encountered an error and couldn&apos;t load properly.
              This might be due to a network issue or browser incompatibility.
            </p>
            {this.state.error && (
              <details className="mt-4 text-left">
                <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-400">
                  Technical Details
                </summary>
                <pre className="mt-2 text-xs text-red-400 bg-slate-800 p-3 rounded overflow-auto max-h-32">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            <RefreshCw size={16} />
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
