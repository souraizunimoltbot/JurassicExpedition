import { useEffect, useState } from 'react';
import Game from './Game.jsx';
import { DEFAULT_LOCALE, LOCALES, getTranslation } from './i18n.js';

function getInitialLocale() {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  const savedLocale = window.localStorage.getItem('jurassic-expedition-locale');
  if (LOCALES.some((locale) => locale.code === savedLocale)) return savedLocale;
  return window.navigator.language.toLowerCase().startsWith('en') ? 'en' : DEFAULT_LOCALE;
}

export default function App() {
  const [locale, setLocale] = useState(getInitialLocale);
  const [phase, setPhase] = useState('menu');
  const [runId, setRunId] = useState(0);
  const [finalStats, setFinalStats] = useState({ score: 0, kills: 0, survivedTime: 0, wave: 1, victory: false });
  const text = getTranslation(locale).app;

  useEffect(() => {
    document.documentElement.lang = locale === 'en' ? 'en' : 'zh-Hant';
    window.localStorage.setItem('jurassic-expedition-locale', locale);
  }, [locale]);

  const startGame = () => {
    setRunId((currentRunId) => currentRunId + 1);
    setFinalStats({ score: 0, kills: 0, survivedTime: 0, wave: 1, victory: false });
    setPhase('playing');
  };

  const handleGameOver = (stats) => {
    setFinalStats(stats);
    setPhase('gameover');
  };

  return (
    <div className="app-shell">
      {phase === 'playing' ? (
        <Game key={runId} locale={locale} onGameOver={handleGameOver} onRestart={startGame} onQuit={() => setPhase('menu')} />
      ) : (
        <div className="screen-overlay screen-overlay--solid">
          <div className="title-panel">
            <div className="language-switch" aria-label={text.languageLabel}>
              {LOCALES.map((availableLocale) => (
                <button
                  key={availableLocale.code}
                  className={availableLocale.code === locale ? 'language-switch__button language-switch__button--active' : 'language-switch__button'}
                  type="button"
                  onClick={() => setLocale(availableLocale.code)}
                  aria-pressed={availableLocale.code === locale}
                  title={availableLocale.label}
                >
                  {availableLocale.shortLabel}
                </button>
              ))}
            </div>
            <div className="title-signal" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <p className="eyebrow">Jurassic Expedition</p>
            <h1>{text.title}</h1>
            {phase === 'menu' && (
              <>
                <div className="mission-brief" aria-label={text.missionAria}>
                  <div>
                    <span>{text.missionLabel}</span>
                    <strong>{text.missionValue}</strong>
                  </div>
                  <div>
                    <span>{text.riskLabel}</span>
                    <strong>{text.riskValue}</strong>
                  </div>
                  <div>
                    <span>{text.statusLabel}</span>
                    <strong>{text.statusValue}</strong>
                  </div>
                </div>
                <div className="control-strip" aria-label={text.controlsAria}>
                  <span>{text.controlDrive}</span>
                  <span>{text.controlAim}</span>
                  <span>{text.controlFire}</span>
                  <span>{text.controlPause}</span>
                </div>
              </>
            )}
            {phase === 'gameover' && (
              <div className="final-stats" aria-live="polite">
                <div className={finalStats.victory ? 'final-banner final-banner--victory' : 'final-banner'}>
                  <span>{finalStats.victory ? text.victoryLabel : text.failureLabel}</span>
                  <strong>{finalStats.victory ? text.victoryCode : text.failureCode}</strong>
                </div>
                <div>
                  <span>{text.finalScore}</span>
                  <strong>{finalStats.score}</strong>
                </div>
                <div>
                  <span>{text.finalKills}</span>
                  <strong>{finalStats.kills}</strong>
                </div>
                <div>
                  <span>{text.survivedSeconds}</span>
                  <strong>{Math.floor(finalStats.survivedTime)}</strong>
                </div>
                <div>
                  <span>{text.highestWave}</span>
                  <strong>{finalStats.wave}</strong>
                </div>
              </div>
            )}
            <button className="primary-action" type="button" onClick={startGame}>
              {phase === 'gameover' ? text.restart : text.start}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}