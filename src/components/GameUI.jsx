import { DINO_TYPES, GAME, PLAYER, WEAPON, WORLD } from '../constants/gameConstants.js';

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

export default function GameUI({ hud, crosshair, isPaused, onPause, onResume, onRestart, onQuit, text }) {
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

      {hud.threatLevel !== 'CLEAR' && (
        <div className={`threat-indicator threat-indicator--${hud.threatLevel.toLowerCase()}`} style={{ '--bearing': `${hud.threatBearing}deg` }}>
          <span />
        </div>
      )}

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