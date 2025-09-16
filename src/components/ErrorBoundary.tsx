import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
      console.error('Production error logged:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      });
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-lg w-full shadow-dialog">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <CardTitle className="text-2xl">¡Algo salió mal!</CardTitle>
              <CardDescription>
                Se ha producido un error inesperado en la aplicación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Error:</strong> {this.state.error?.message || 'Error desconocido'}
                </AlertDescription>
              </Alert>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={this.handleRetry} className="flex-1">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reintentar
                </Button>
                <Button variant="outline" onClick={this.handleGoHome} className="flex-1">
                  <Home className="mr-2 h-4 w-4" />
                  Ir al inicio
                </Button>
              </div>

              <Button variant="ghost" onClick={this.handleReload} className="w-full">
                Recargar página
              </Button>

              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="mt-4 p-4 bg-muted rounded-lg">
                  <summary className="cursor-pointer font-medium text-sm">
                    Detalles técnicos (desarrollo)
                  </summary>
                  <div className="mt-2 text-xs font-mono space-y-2">
                    <div>
                      <strong>Error Stack:</strong>
                      <pre className="whitespace-pre-wrap text-destructive">
                        {this.state.error?.stack}
                      </pre>
                    </div>
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="whitespace-pre-wrap text-muted-foreground">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components to handle async errors
export const useErrorHandler = () => {
  return (error: Error, errorInfo?: string) => {
    console.error('Async error caught:', error, errorInfo);
    
    // In a real app, you'd want to show a toast or send to error service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error tracking service
      console.error('Production async error:', {
        message: error.message,
        stack: error.stack,
        info: errorInfo
      });
    }
  };
};