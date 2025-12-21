import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePhysicsTilt } from './usePhysicsTilt';

describe('usePhysicsTilt', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns initial state with zero rotation', () => {
    const { result } = renderHook(() => usePhysicsTilt());

    expect(result.current.tiltState).toEqual({
      rotateX: 0,
      rotateY: 0,
      scale: 1,
    });
  });

  it('provides mouse handlers', () => {
    const { result } = renderHook(() => usePhysicsTilt());

    expect(result.current.handlers.onMouseMove).toBeDefined();
    expect(result.current.handlers.onMouseLeave).toBeDefined();
  });

  it('provides getTransformStyle function', () => {
    const { result } = renderHook(() => usePhysicsTilt());

    const style = result.current.getTransformStyle();
    expect(style.transform).toContain('perspective(1000px)');
    expect(style.transform).toContain('rotateX(0deg)');
    expect(style.transform).toContain('rotateY(0deg)');
    expect(style.transform).toContain('scale(1)');
  });

  it('returns empty style when disabled', () => {
    const { result } = renderHook(() => usePhysicsTilt({ disabled: true }));

    const style = result.current.getTransformStyle();
    expect(style).toEqual({});
  });

  it('respects custom maxTilt option', () => {
    const { result } = renderHook(() => usePhysicsTilt({ maxTilt: 30 }));
    expect(result.current).toBeDefined();
  });

  it('respects custom scale option', () => {
    const { result } = renderHook(() => usePhysicsTilt({ scale: 1.1 }));
    expect(result.current).toBeDefined();
  });
});
