import { Suspense, Component, type ReactNode, type ErrorInfo } from 'react';
import { Canvas, type CanvasProps } from '@react-three/fiber';
import { usePerformanceTier, type PerformanceTierState } from '../hooks/usePerformanceTier';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class CanvasErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Canvas rendering error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

export interface SceneWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  cssOnly?: ReactNode;
  loadingFallback?: ReactNode;
  canvasProps?: Partial<CanvasProps>;
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-white" />
    </div>
  );
}

function DefaultCSSFallback({ children }: { children?: ReactNode }) {
  return (
    <div className="relative w-full h-full backdrop-blur-glass bg-glass-light rounded-2xl overflow-hidden">
      {children}
    </div>
  );
}

export function SceneWrapper({
  children,
  fallback,
  cssOnly,
  loadingFallback = <LoadingSpinner />,
  canvasProps,
}: SceneWrapperProps) {
  const { tier, config, isLoading, hasWebGL } = usePerformanceTier();

  if (isLoading) {
    return <>{loadingFallback}</>;
  }

  if (tier === 'TIER_0' || !hasWebGL) {
    return <>{cssOnly ?? <DefaultCSSFallback>{fallback}</DefaultCSSFallback>}</>;
  }

  const cssFallback = cssOnly ?? <DefaultCSSFallback>{fallback}</DefaultCSSFallback>;

  return (
    <CanvasErrorBoundary fallback={cssFallback}>
      <Canvas
        dpr={config.dpr}
        gl={{
          antialias: tier === 'TIER_2',
          powerPreference: tier === 'TIER_2' ? 'high-performance' : 'low-power',
          alpha: true,
        }}
        {...canvasProps}
      >
        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
    </CanvasErrorBoundary>
  );
}

export interface AdaptiveSceneProps {
  tier: PerformanceTierState;
  highEnd: ReactNode;
  lowEnd: ReactNode;
  cssOnly: ReactNode;
}

export function AdaptiveScene({ tier, highEnd, lowEnd, cssOnly }: AdaptiveSceneProps) {
  if (tier.tier === 'TIER_0' || !tier.hasWebGL) {
    return <>{cssOnly}</>;
  }

  if (tier.tier === 'TIER_1') {
    return <>{lowEnd}</>;
  }

  return <>{highEnd}</>;
}
