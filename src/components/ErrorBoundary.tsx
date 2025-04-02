import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error boundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="bg-card border rounded-xl shadow-sm p-6 max-w-md w-full">
            <div className="flex items-center gap-3 text-amber-500 mb-4">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-semibold">Ha ocurrido un error</h3>
            </div>
            
            <p className="text-muted-foreground mb-4">
              Algo ha fallado al cargar este componente. Por favor, recargue la página e intente nuevamente.
            </p>
            
            {this.state.error && (
              <div className="bg-secondary/50 p-3 rounded-md mb-4 text-sm font-mono overflow-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}
            
            <button
              onClick={this.handleReload}
              className="w-full flex items-center justify-center gap-2 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              <RefreshCw size={16} />
              <span>Recargar página</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
