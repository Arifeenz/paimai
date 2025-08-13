import React, { Component, ErrorInfo, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    
    // Show user-friendly error message
    toast({
      title: "เกิดข้อผิดพลาดในระบบ",
      description: "ระบบพบข้อผิดพลาดที่ไม่คาดคิด กรุณารีเฟรชหน้าเว็บและลองใหม่อีกครั้ง",
      variant: "destructive"
    });

    // Log to console for developers
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-destructive mb-4">เกิดข้อผิดพลาด</h1>
            <p className="text-muted-foreground mb-6">
              ระบบพบข้อผิดพลาดที่ไม่คาดคิด กรุณารีเฟรชหน้าเว็บและลองใหม่อีกครั้ง
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              รีเฟรชหน้า
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;