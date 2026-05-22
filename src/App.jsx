import { useState } from 'react';
import Game from './Game.jsx';

export default function App() {
  const [phase, setPhase] = useState('menu');
  const [runId, setRunId] = useState(0);
  const [finalStats, setFinalStats] = useState({ score: 0, kills: 0, survivedTime: 0, wave: 1, victory: false });

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
        <Game key={runId} onGameOver={handleGameOver} onRestart={startGame} onQuit={() => setPhase('menu')} />
      ) : (
        <div className="screen-overlay screen-overlay--solid">
          <div className="title-panel">
            <div className="title-signal" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <p className="eyebrow">Jurassic Expedition</p>
            <h1>侏羅紀遠征</h1>
            {phase === 'menu' && (
              <>
                <div className="mission-brief" aria-label="遠征任務">
                  <div>
                    <span>任務</span>
                    <strong>撐過 6 分鐘</strong>
                  </div>
                  <div>
                    <span>風險</span>
                    <strong>恐龍群集</strong>
                  </div>
                  <div>
                    <span>狀態</span>
                    <strong>待命出發</strong>
                  </div>
                </div>
                <div className="control-strip" aria-label="操作方式">
                  <span>WASD 駕駛</span>
                  <span>滑鼠瞄準</span>
                  <span>左鍵射擊</span>
                  <span>Esc 暫停</span>
                </div>
              </>
            )}
            {phase === 'gameover' && (
              <div className="final-stats" aria-live="polite">
                <div className={finalStats.victory ? 'final-banner final-banner--victory' : 'final-banner'}>
                  <span>{finalStats.victory ? '遠征完成' : '遠征失敗'}</span>
                  <strong>{finalStats.victory ? 'EXTRACTED' : 'OVERRUN'}</strong>
                </div>
                <div>
                  <span>最終得分</span>
                  <strong>{finalStats.score}</strong>
                </div>
                <div>
                  <span>擊殺數</span>
                  <strong>{finalStats.kills}</strong>
                </div>
                <div>
                  <span>存活秒數</span>
                  <strong>{Math.floor(finalStats.survivedTime)}</strong>
                </div>
                <div>
                  <span>最高波次</span>
                  <strong>{finalStats.wave}</strong>
                </div>
              </div>
            )}
            <button className="primary-action" type="button" onClick={startGame}>
              {phase === 'gameover' ? '重新開始' : '開始遊戲'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}