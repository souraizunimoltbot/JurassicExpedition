import { useEffect, useRef } from 'react';

export function useKeyboardControls() {
  const keysRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false
  });

  useEffect(() => {
    const setKeyState = (keyboardEvent, isPressed) => {
      const activeKeys = keysRef.current;
      switch (keyboardEvent.code) {
        case 'KeyW':
        case 'ArrowUp':
          activeKeys.forward = isPressed;
          keyboardEvent.preventDefault();
          break;
        case 'KeyS':
        case 'ArrowDown':
          activeKeys.backward = isPressed;
          keyboardEvent.preventDefault();
          break;
        case 'KeyA':
        case 'ArrowLeft':
          activeKeys.left = isPressed;
          keyboardEvent.preventDefault();
          break;
        case 'KeyD':
        case 'ArrowRight':
          activeKeys.right = isPressed;
          keyboardEvent.preventDefault();
          break;
        default:
          break;
      }
    };

    const handleKeyDown = (keyboardEvent) => setKeyState(keyboardEvent, true);
    const handleKeyUp = (keyboardEvent) => setKeyState(keyboardEvent, false);
    const resetKeys = () => {
      keysRef.current.forward = false;
      keysRef.current.backward = false;
      keysRef.current.left = false;
      keysRef.current.right = false;
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp, { passive: false });
    window.addEventListener('blur', resetKeys);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', resetKeys);
    };
  }, []);

  return keysRef;
}