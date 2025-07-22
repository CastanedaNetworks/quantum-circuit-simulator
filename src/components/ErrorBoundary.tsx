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
        <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-red-900/20 border border-red-500 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">!</span>
              </div>
              <h1 className="text-xl font-bold text-red-400">
                {componentName} Error
              </h1>
            </div>
            
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-white mb-2">Error Message:</h2>
                <p className="text-red-300 bg-red-900/30 p-3 rounded font-mono text-sm">
                  {this.state.error?.message || 'Unknown error occurred'}
                </p>
              </div>

              {this.state.error?.stack && (
                <div>
                  <h2 className="text-lg font-semibold text-white mb-2">Stack Trace:</h2>
                  <pre className="text-gray-300 bg-gray-900 p-3 rounded text-xs overflow-auto max-h-64">
                    {this.state.error.stack}
                  </pre>
                </div>
              )}

              {this.state.errorInfo?.componentStack && (
                <div>
                  <h2 className="text-lg font-semibold text-white mb-2">Component Stack:</h2>
                  <pre className="text-gray-300 bg-gray-900 p-3 rounded text-xs overflow-auto max-h-64">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}

              <div className="pt-4 border-t border-gray-700">
                <button 
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
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
        <div className="bg-red-900/20 border border-red-500 rounded p-4 m-4">
          <p className="text-red-400">Error in {name} component</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
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