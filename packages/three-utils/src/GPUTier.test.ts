import { describe, it, expect } from 'vitest';
import { getTierConfig, type PerformanceTier } from './GPUTier';

describe('GPUTier', () => {
  describe('getTierConfig', () => {
    it('returns full features for TIER_2', () => {
      const config = getTierConfig('TIER_2');

      expect(config.dpr).toEqual([1, 2]);
      expect(config.shadows).toBe(true);
      expect(config.physics).toBe(true);
      expect(config.refraction).toBe(true);
      expect(config.particleCount).toBe(1000);
      expect(config.postProcessing).toBe(true);
    });

    it('returns reduced features for TIER_1', () => {
      const config = getTierConfig('TIER_1');

      expect(config.dpr).toEqual([1, 1.5]);
      expect(config.shadows).toBe(false);
      expect(config.physics).toBe(false);
      expect(config.refraction).toBe(false);
      expect(config.particleCount).toBe(100);
      expect(config.postProcessing).toBe(false);
    });

    it('returns minimal features for TIER_0', () => {
      const config = getTierConfig('TIER_0');

      expect(config.dpr).toEqual([1, 1]);
      expect(config.shadows).toBe(false);
      expect(config.physics).toBe(false);
      expect(config.refraction).toBe(false);
      expect(config.particleCount).toBe(0);
      expect(config.postProcessing).toBe(false);
    });

    it('defaults to TIER_0 for unknown tier', () => {
      const config = getTierConfig('UNKNOWN' as PerformanceTier);
      expect(config.particleCount).toBe(0);
    });
  });
});
