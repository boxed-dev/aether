import { useState, useCallback, useRef, useEffect } from 'react';

export interface TiltState {
  rotateX: number;
  rotateY: number;
  scale: number;
}

export interface UsePhysicsTiltOptions {
  maxTilt?: number;
  scale?: number;
  speed?: number;
  disabled?: boolean;
}

const DEFAULT_STATE: TiltState = { rotateX: 0, rotateY: 0, scale: 1 };

export function usePhysicsTilt(options: UsePhysicsTiltOptions = {}) {
  const { maxTilt = 15, scale = 1.02, speed = 0.1, disabled = false } = options;

  const [tiltState, setTiltState] = useState<TiltState>(DEFAULT_STATE);
  const targetRef = useRef<TiltState>(DEFAULT_STATE);
  const frameRef = useRef<number | undefined>(undefined);

  const animate = useCallback(() => {
    setTiltState((prev) => ({
      rotateX: prev.rotateX + (targetRef.current.rotateX - prev.rotateX) * speed,
      rotateY: prev.rotateY + (targetRef.current.rotateY - prev.rotateY) * speed,
      scale: prev.scale + (targetRef.current.scale - prev.scale) * speed,
    }));

    frameRef.current = requestAnimationFrame(animate);
  }, [speed]);

  useEffect(() => {
    if (disabled) {
      // Cancel any existing animation frame when disabled
      if (frameRef.current !== undefined) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = undefined;
      }
      // Reset to default state
      setTiltState(DEFAULT_STATE);
      targetRef.current = DEFAULT_STATE;
      return;
    }

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current !== undefined) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = undefined;
      }
    };
  }, [animate, disabled]);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (disabled) return;

      const rect = event.currentTarget.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (event.clientX - centerX) / (rect.width / 2);
      const deltaY = (event.clientY - centerY) / (rect.height / 2);

      targetRef.current = {
        rotateX: -deltaY * maxTilt,
        rotateY: deltaX * maxTilt,
        scale,
      };
    },
    [disabled, maxTilt, scale]
  );

  const handleMouseLeave = useCallback(() => {
    targetRef.current = DEFAULT_STATE;
  }, []);

  const getTransformStyle = useCallback(() => {
    if (disabled) return {};

    return {
      transform: `perspective(1000px) rotateX(${tiltState.rotateX}deg) rotateY(${tiltState.rotateY}deg) scale(${tiltState.scale})`,
      transition: 'transform 0.1s ease-out',
    };
  }, [disabled, tiltState]);

  return {
    tiltState,
    handlers: {
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
    },
    getTransformStyle,
  };
}
