import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error('[ErrorBoundary] Error caught:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Component stack trace:', errorInfo.componentStack);
    console.error('[ErrorBoundary] Error details:', error);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      const componentName = this.props.componentName || 'Component';
      
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white border border-slate-200 rounded-md shadow-sm">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200">
              <div className="w-7 h-7 border border-red-300 bg-red-50 text-red-700 rounded flex items-center justify-center font-mono">
                !
              </div>
              <h1 className="text-base font-semibold text-slate-900">
                {componentName} Error
              </h1>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Error Message</h2>
                <p className="text-red-700 bg-red-50 border border-red-200 p-3 rounded font-mono text-sm">
                  {this.state.error?.message || 'Unknown error occurred'}
                </p>
              </div>

              {this.state.error?.stack && (
                <div>
                  <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Stack Trace</h2>
                  <pre className="text-slate-600 bg-slate-50 border border-slate-200 p-3 rounded text-xs overflow-auto max-h-64 font-mono">
                    {this.state.error.stack}
                  </pre>
                </div>
              )}

              {this.state.errorInfo?.componentStack && (
                <div>
                  <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Component Stack</h2>
                  <pre className="text-slate-600 bg-slate-50 border border-slate-200 p-3 rounded text-xs overflow-auto max-h-64 font-mono">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}

              <div className="pt-4 border-t border-slate-200">
                <button
                  onClick={() => window.location.reload()}
                  className="px-3 py-1.5 bg-blue-700 text-white text-sm font-medium rounded hover:bg-blue-800 transition-colors"
                >
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Simple functional error boundary for specific components
export const SimpleErrorBoundary: React.FC<{ children: ReactNode; name: string }> = ({ 
  children, 
  name 
}) => {
  return (
    <ErrorBoundary 
      componentName={name}
      fallback={
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-700">Error in {name} component</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded text-sm hover:bg-slate-50 transition-colors"
          >
            Reload
          </button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
};