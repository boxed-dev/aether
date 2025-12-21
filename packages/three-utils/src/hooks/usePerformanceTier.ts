import { useState, useEffect } from 'react';
import {
  detectGPUTier,
  checkWebGLSupport,
  getTierConfig,
  type PerformanceTier,
  type GPUInfo,
} from '../GPUTier';

export interface PerformanceTierState {
  tier: PerformanceTier;
  config: ReturnType<typeof getTierConfig>;
  gpuInfo: GPUInfo | null;
  isLoading: boolean;
  hasWebGL: boolean;
}

export function usePerformanceTier(): PerformanceTierState {
  const [state, setState] = useState<PerformanceTierState>({
    tier: 'TIER_0',
    config: getTierConfig('TIER_0'),
    gpuInfo: null,
    isLoading: true,
    hasWebGL: false,
  });

  useEffect(() => {
    let mounted = true;

    const detect = async () => {
      const hasWebGL = checkWebGLSupport();

      if (!hasWebGL) {
        if (mounted) {
          setState({
            tier: 'TIER_0',
            config: getTierConfig('TIER_0'),
            gpuInfo: null,
            isLoading: false,
            hasWebGL: false,
          });
        }
        return;
      }

      const gpuInfo = await detectGPUTier();

      if (mounted) {
        setState({
          tier: gpuInfo.tier,
          config: getTierConfig(gpuInfo.tier),
          gpuInfo,
          isLoading: false,
          hasWebGL: true,
        });
      }
    };

    detect();

    return () => {
      mounted = false;
    };
  }, []);

  return state;
}
