import { ReactNode } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import ErrorBoundary from './ErrorBoundary';

interface SafeTooltipProviderProps {
  children: ReactNode;
}

const SafeTooltipProvider = ({ children }: SafeTooltipProviderProps) => {
  try {
    return (
      <ErrorBoundary fallback={children}>
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </ErrorBoundary>
    );
  } catch (error) {
    console.warn('TooltipProvider failed to initialize:', error);
    return <>{children}</>;
  }
};

export default SafeTooltipProvider;