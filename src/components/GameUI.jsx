import { useEffect, useRef, useState } from 'react';
import { DINO_TYPES, GAME, PLAYER, WEAPON, WORLD } from '../constants/gameConstants.js';

const JOYSTICK_RADIUS = 54;
const JOYSTICK_DEAD_ZONE = 0.18;
const AIM_SENSITIVITY = 1.15;

function clampValue(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function resetVehicleControls(controlsRef) {
  const controls = controlsRef.current;
  controls.forward = false;
  controls.backward = false;
  controls.left = false;
  controls.right = false;
}

function formatTime(totalSeconds) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60).toString();
  const seconds = (safeSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function Minimap({ player, dinosaurs, text }) {
  const range = WORLD.MINIMAP_RANGE;
  const rotationCos = Math.cos(-player.heading);
  const rotationSin = Math.sin(-player.heading);

  const visibleDinosaurs = dinosaurs
    .map((dinosaur) => {
      const relativeX = dinosaur.x - player.x;
      const relativeZ = dinosaur.z - player.z;
      const rotatedX = relativeX * rotationCos - relativeZ * rotationSin;
      const rotatedZ = relativeX * rotationSin + relativeZ * rotationCos;
      const distance = Math.hypot(rotatedX, rotatedZ);
      return {
        ...dinosaur,
        left: 50 + (rotatedX / range) * 45,
        top: 50 - (rotatedZ / range) * 45,
        distance
      };
    })
    .filter((dinosaur) => dinosaur.distance <= range);

  return (
    <div className="minimap" aria-label={text.minimap}>
      <div className="minimap-ring" />
      <div className="minimap-player" />
      {visibleDinosaurs.map((dinosaur) => (
        <span
          key={dinosaur.id}
          className={`minimap-dot minimap-dot--${dinosaur.type}`}
          style={{ left: `${dinosaur.left}%`, top: `${dinosaur.top}%` }}
          title={text.dinosaurs[dinosaur.type] ?? DINO_TYPES[dinosaur.type].label}
        />
      ))}
    </div>
  );
}

function MobileControls({ controlsRef, firingRef, fireRequestRef, moveCrosshairBy, isPaused, text }) {
  const stickPointerRef = useRef(null);
  const stickBoundsRef = useRef(null);
  const aimPointerRef = useRef(null);
  const aimLastRef = useRef({ x: 0, y: 0 });
  const [stick, setStick] = useState({ x: 0, y: 0, active: false });
  const [aimActive, setAimActive] = useState(false);

  const resetAll = () => {
    stickPointerRef.current = null;
    aimPointerRef.current = null;
    stickBoundsRef.current = null;
    firingRef.current = false;
    fireRequestRef.current = false;
    resetVehicleControls(controlsRef);
    setStick({ x: 0, y: 0, active: false });
    setAimActive(false);
  };

  const updateStick = (pointerEvent) => {
    const bounds = stickBoundsRef.current ?? pointerEvent.currentTarget.getBoundingClientRect();
    stickBoundsRef.current = bounds;
    const rawX = pointerEvent.clientX - (bounds.left + bounds.width * 0.5);
    const rawY = pointerEvent.clientY - (bounds.top + bounds.height * 0.5);
    const distance = Math.hypot(rawX, rawY);
    const scale = distance > JOYSTICK_RADIUS ? JOYSTICK_RADIUS / distance : 1;
    const x = rawX * scale;
    const y = rawY * scale;
    const normalizedX = x / JOYSTICK_RADIUS;
    const normalizedY = y / JOYSTICK_RADIUS;
    const controls = controlsRef.current;
    controls.forward = normalizedY < -JOYSTICK_DEAD_ZONE;
    controls.backward = normalizedY > JOYSTICK_DEAD_ZONE;
    controls.left = normalizedX < -JOYSTICK_DEAD_ZONE;
    controls.right = normalizedX > JOYSTICK_DEAD_ZONE;
    setStick({ x, y, active: true });
  };

  const handleStickDown = (pointerEvent) => {
    if (isPaused) return;
    pointerEvent.preventDefault();
    pointerEvent.stopPropagation();
    stickPointerRef.current = pointerEvent.pointerId;
    stickBoundsRef.current = pointerEvent.currentTarget.getBoundingClientRect();
    pointerEvent.currentTarget.setPointerCapture(pointerEvent.pointerId);
    updateStick(pointerEvent);
  };

  const handleStickMove = (pointerEvent) => {
    if (stickPointerRef.current !== pointerEvent.pointerId) return;
    pointerEvent.preventDefault();
    updateStick(pointerEvent);
  };

  const handleStickUp = (pointerEvent) => {
    if (stickPointerRef.current !== pointerEvent.pointerId) return;
    pointerEvent.preventDefault();
    if (pointerEvent.currentTarget.hasPointerCapture(pointerEvent.pointerId)) {
      pointerEvent.currentTarget.releasePointerCapture(pointerEvent.pointerId);
    }
    stickPointerRef.current = null;
    stickBoundsRef.current = null;
    resetVehicleControls(controlsRef);
    setStick({ x: 0, y: 0, active: false });
  };

  const handleAimDown = (pointerEvent) => {
    if (isPaused) return;
    pointerEvent.preventDefault();
    pointerEvent.stopPropagation();
    aimPointerRef.current = pointerEvent.pointerId;
    aimLastRef.current = { x: pointerEvent.clientX, y: pointerEvent.clientY };
    pointerEvent.currentTarget.setPointerCapture(pointerEvent.pointerId);
    fireRequestRef.current = true;
    firingRef.current = true;
    setAimActive(true);
  };

  const handleAimMove = (pointerEvent) => {
    if (aimPointerRef.current !== pointerEvent.pointerId) return;
    pointerEvent.preventDefault();
    const lastAim = aimLastRef.current;
    moveCrosshairBy((pointerEvent.clientX - lastAim.x) * AIM_SENSITIVITY, (pointerEvent.clientY - lastAim.y) * AIM_SENSITIVITY);
    aimLastRef.current = { x: pointerEvent.clientX, y: pointerEvent.clientY };
  };

  const handleAimUp = (pointerEvent) => {
    if (aimPointerRef.current !== pointerEvent.pointerId) return;
    pointerEvent.preventDefault();
    if (pointerEvent.currentTarget.hasPointerCapture(pointerEvent.pointerId)) {
      pointerEvent.currentTarget.releasePointerCapture(pointerEvent.pointerId);
    }
    aimPointerRef.current = null;
    firingRef.current = false;
    setAimActive(false);
  };

  useEffect(() => {
    if (isPaused) resetAll();
  }, [isPaused]);

  useEffect(() => {
    window.addEventListener('blur', resetAll);
    return () => {
      window.removeEventListener('blur', resetAll);
      firingRef.current = false;
      fireRequestRef.current = false;
      resetVehicleControls(controlsRef);
    };
  }, []);

  return (
    <div className="mobile-controls" aria-label={text.mobileControls}>
      <div
        className={stick.active ? 'mobile-stick mobile-stick--active' : 'mobile-stick'}
        role="application"
        aria-label={text.mobileMove}
        onPointerDown={handleStickDown}
        onPointerMove={handleStickMove}
        onPointerUp={handleStickUp}
        onPointerCancel={handleStickUp}
      >
        <div className="mobile-stick__base" />
        <div className="mobile-stick__knob" style={{ transform: `translate(${clampValue(stick.x, -JOYSTICK_RADIUS, JOYSTICK_RADIUS)}px, ${clampValue(stick.y, -JOYSTICK_RADIUS, JOYSTICK_RADIUS)}px)` }} />
      </div>
      <div
        className={aimActive ? 'mobile-aim-pad mobile-aim-pad--active' : 'mobile-aim-pad'}
        role="application"
        aria-label={text.mobileAim}
        onPointerDown={handleAimDown}
        onPointerMove={handleAimMove}
        onPointerUp={handleAimUp}
        onPointerCancel={handleAimUp}
      >
        <span>{text.mobileAim}</span>
      </div>
    </div>
  );
}

export default function GameUI({ hud, crosshair, isPaused, onPause, onResume, onRestart, onQuit, text, controlsRef, firingRef, fireRequestRef, moveCrosshairBy }) {
  const healthRatio = Math.max(0, hud.health / PLAYER.MAX_HEALTH);
  const reloadRatio = hud.reloadTime > 0 ? 1 - hud.reloadTime / WEAPON.RELOAD_TIME : 1;
  const ammoLabel = hud.reloadTime > 0 ? text.reload.toUpperCase() : `${hud.ammo}/${WEAPON.MAGAZINE_SIZE}`;
  const crosshairClasses = [
    'crosshair',
    hud.aimZone === 'head' ? 'crosshair--head' : '',
    hud.aimZone === 'body' ? 'crosshair--body' : '',
    hud.hitMarker ? 'crosshair--hit' : '',
    hud.hitMarkerZone === 'head' && hud.hitMarker ? 'crosshair--hit-head' : '',
    hud.reloadTime > 0 ? 'crosshair--reload' : ''
  ].filter(Boolean).join(' ');
  const lowHealth = hud.health <= GAME.LOW_HEALTH_THRESHOLD;

  return (
    <div className="game-ui">
      <div
        className={crosshairClasses}
        style={{ left: `${crosshair.screenX}px`, top: `${crosshair.screenY}px` }}
        aria-label={text.crosshair}
      >
        <span />
        <span />
      </div>

      {lowHealth && <div className="low-health-vignette" />}

      <div className="hud-panel hud-panel--map">
        <Minimap player={hud.player} dinosaurs={hud.dinosaurs} text={text} />
      </div>

      <div className="hud-panel hud-panel--objective">
        <div className="objective-row">
          <span>{text.expeditionProgress}</span>
          <strong>{formatTime(hud.remainingTime)}</strong>
        </div>
        <div className="objective-bar">
          <div style={{ width: `${hud.progress * 100}%` }} />
        </div>
        <div className="objective-meta">
          <span>{text.wave.toUpperCase()} {hud.wave}</span>
          <span>{text.alive.toUpperCase()} {hud.aliveCount}</span>
        </div>
      </div>

      <div className="hud-panel hud-panel--score">
        <div>
          <span>{text.score}</span>
          <strong>{hud.score}</strong>
        </div>
        <div>
          <span>{text.kills}</span>
          <strong>{hud.kills}</strong>
        </div>
        {hud.combo > 1 && (
          <div className="combo-cell">
            <span>{text.combo}</span>
            <strong>x{hud.combo}</strong>
          </div>
        )}
      </div>

      <button className="pause-button" type="button" onClick={onPause} aria-label={text.pause}>
        II
      </button>

      <div className="health-panel">
        <span>{text.health}</span>
        <div className={lowHealth ? 'health-bar health-bar--low' : 'health-bar'}>
          <div style={{ width: `${healthRatio * 100}%` }} />
        </div>
        <strong>{Math.ceil(hud.health)}</strong>
      </div>

      <div className={hud.reloadTime > 0 ? 'ammo-panel ammo-panel--reload' : 'ammo-panel'}>
        <span>{text.ammo}</span>
        <strong>{ammoLabel}</strong>
        {hud.reloadTime > 0 && (
          <div className="reload-bar">
            <div style={{ width: `${reloadRatio * 100}%` }} />
          </div>
        )}
      </div>

      <MobileControls controlsRef={controlsRef} firingRef={firingRef} fireRequestRef={fireRequestRef} moveCrosshairBy={moveCrosshairBy} isPaused={isPaused} text={text} />

      {isPaused && (
        <div className="pause-overlay">
          <div className="pause-panel">
            <span className="pause-kicker">{text.pausedKicker}</span>
            <h2>{text.pausedTitle}</h2>
            <div className="pause-stats">
              <div>
                <span>{text.score}</span>
                <strong>{hud.score}</strong>
              </div>
              <div>
                <span>{text.wave}</span>
                <strong>{hud.wave}</strong>
              </div>
              <div>
                <span>{text.remaining}</span>
                <strong>{formatTime(hud.remainingTime)}</strong>
              </div>
            </div>
            <div className="pause-actions">
              <button className="primary-action" type="button" onClick={onResume}>{text.resume}</button>
              <button className="secondary-action" type="button" onClick={onRestart}>{text.restart}</button>
              <button className="secondary-action" type="button" onClick={onQuit}>{text.backToTitle}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}