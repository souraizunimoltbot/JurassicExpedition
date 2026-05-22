import { useCallback, useEffect, useRef, useState } from 'react';
import { clamp } from '../utils/math.js';

function getDefaultCrosshair() {
  if (typeof window === 'undefined') {
    return { screenX: 640, screenY: 320 };
  }
  return {
    screenX: window.innerWidth * 0.5,
    screenY: window.innerHeight * 0.42
  };
}

export function usePointerAim() {
  const [crosshair, setCrosshair] = useState(getDefaultCrosshair);
  const crosshairRef = useRef(crosshair);
  const firingRef = useRef(false);
  const fireRequestRef = useRef(false);

  const setCrosshairPosition = useCallback((screenX, screenY) => {
    const nextCrosshair = {
      screenX: clamp(screenX, 16, window.innerWidth - 16),
      screenY: clamp(screenY, 16, window.innerHeight - 16)
    };
    crosshairRef.current = nextCrosshair;
    setCrosshair(nextCrosshair);
  }, []);

  const handlePointerMove = useCallback(
    (pointerEvent) => {
      setCrosshairPosition(pointerEvent.clientX, pointerEvent.clientY);
    },
    [setCrosshairPosition]
  );

  const moveCrosshairBy = useCallback(
    (deltaX, deltaY) => {
      const currentCrosshair = crosshairRef.current;
      setCrosshairPosition(currentCrosshair.screenX + deltaX, currentCrosshair.screenY + deltaY);
    },
    [setCrosshairPosition]
  );

  const handlePointerDown = useCallback((pointerEvent) => {
    if (pointerEvent.pointerType !== 'touch' && pointerEvent.button === 0) {
      fireRequestRef.current = true;
      firingRef.current = true;
    }
  }, []);

  const handlePointerUp = useCallback((pointerEvent) => {
    if (pointerEvent.button === 0) {
      firingRef.current = false;
    }
  }, []);

  useEffect(() => {
    const handleWindowMouseUp = () => {
      firingRef.current = false;
    };
    const handleResize = () => {
      setCrosshairPosition(window.innerWidth * 0.5, window.innerHeight * 0.42);
    };

    window.addEventListener('mouseup', handleWindowMouseUp);
    window.addEventListener('blur', handleWindowMouseUp);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mouseup', handleWindowMouseUp);
      window.removeEventListener('blur', handleWindowMouseUp);
      window.removeEventListener('resize', handleResize);
    };
  }, [setCrosshairPosition]);

  return {
    crosshair,
    crosshairRef,
    firingRef,
    fireRequestRef,
    moveCrosshairBy,
    handlePointerMove,
    handlePointerDown,
    handlePointerUp
  };
}