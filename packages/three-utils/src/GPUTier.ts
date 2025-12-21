import { getGPUTier, type TierResult } from 'detect-gpu';

export type PerformanceTier = 'TIER_0' | 'TIER_1' | 'TIER_2';

export interface GPUInfo {
  tier: PerformanceTier;
  gpu: string | undefined;
  isMobile: boolean;
  fps: number | undefined;
}

let cachedTierResult: TierResult | null = null;

export async function detectGPUTier(): Promise<GPUInfo> {
  if (typeof window === 'undefined') {
    return { tier: 'TIER_0', gpu: undefined, isMobile: false, fps: undefined };
  }

  if (!cachedTierResult) {
    cachedTierResult = await getGPUTier();
  }

  const result = cachedTierResult;
  let tier: PerformanceTier;

  if (result.tier === 0 || !result.gpu) {
    tier = 'TIER_0';
  } else if (result.tier <= 2 || result.isMobile) {
    tier = 'TIER_1';
  } else {
    tier = 'TIER_2';
  }

  return {
    tier,
    gpu: result.gpu,
    isMobile: result.isMobile ?? false,
    fps: result.fps,
  };
}

export function checkWebGLSupport(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    return gl !== null;
  } catch {
    return false;
  }
}

export function getTierConfig(tier: PerformanceTier) {
  switch (tier) {
    case 'TIER_2':
      return {
        dpr: [1, 2] as [number, number],
        shadows: true,
        physics: true,
        refraction: true,
        particleCount: 1000,
        postProcessing: true,
      };
    case 'TIER_1':
      return {
        dpr: [1, 1.5] as [number, number],
        shadows: false,
        physics: false,
        refraction: false,
        particleCount: 100,
        postProcessing: false,
      };
    case 'TIER_0':
    default:
      return {
        dpr: [1, 1] as [number, number],
        shadows: false,
        physics: false,
        refraction: false,
        particleCount: 0,
        postProcessing: false,
      };
  }
}
