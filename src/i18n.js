export const LOCALES = [
  { code: 'zh-TW', shortLabel: '繁中', label: '繁體中文' },
  { code: 'en', shortLabel: 'EN', label: 'English' }
];

export const DEFAULT_LOCALE = 'zh-TW';

export const TRANSLATIONS = {
  'zh-TW': {
    app: {
      languageLabel: '語系',
      title: '侏羅紀遠征',
      missionAria: '遠征任務',
      controlsAria: '操作方式',
      missionLabel: '任務',
      missionValue: '撐過 6 分鐘',
      riskLabel: '風險',
      riskValue: '恐龍群集',
      statusLabel: '狀態',
      statusValue: '待命出發',
      controlDrive: 'WASD 駕駛',
      controlAim: '滑鼠瞄準',
      controlFire: '左鍵射擊',
      controlPause: 'Esc 暫停',
      victoryLabel: '遠征完成',
      failureLabel: '遠征失敗',
      victoryCode: 'EXTRACTED',
      failureCode: 'OVERRUN',
      finalScore: '最終得分',
      finalKills: '擊殺數',
      survivedSeconds: '存活秒數',
      highestWave: '最高波次',
      restart: '重新開始',
      start: '開始遊戲'
    },
    game: {
      minimap: '小地圖',
      crosshair: '準星',
      expeditionProgress: '遠征進度',
      wave: '波次',
      alive: '存活',
      score: '分數',
      kills: '擊殺',
      combo: '連殺',
      pause: '暫停',
      health: 'HP',
      ammo: '彈藥',
      reload: '裝填',
      pausedKicker: '遠征暫停',
      pausedTitle: '遠征暫停',
      remaining: '剩餘',
      resume: '繼續',
      restart: '重新開始',
      backToTitle: '返回標題',
      sceneFailed: '場景渲染失敗',
      webglFailed: 'WebGL 初始化失敗',
      damageHeadshot: '爆頭',
      mobileControls: '手機控制項',
      mobileMove: '移動',
      mobileAim: '瞄準',
      mobileFire: '射擊',
      dinosaurHealth: '{name} 血量',
      dinosaurs: {
        raptor: '迅猛龍',
        dilo: '雙冠龍',
        trex: '暴龍'
      }
    }
  },
  en: {
    app: {
      languageLabel: 'Language',
      title: 'Jurassic Expedition',
      missionAria: 'Expedition mission',
      controlsAria: 'Controls',
      missionLabel: 'Mission',
      missionValue: 'Survive 6 minutes',
      riskLabel: 'Risk',
      riskValue: 'Dinosaur swarm',
      statusLabel: 'Status',
      statusValue: 'Ready to depart',
      controlDrive: 'WASD Drive',
      controlAim: 'Mouse Aim',
      controlFire: 'Left Click Fire',
      controlPause: 'Esc Pause',
      victoryLabel: 'Expedition Complete',
      failureLabel: 'Expedition Failed',
      victoryCode: 'EXTRACTED',
      failureCode: 'OVERRUN',
      finalScore: 'Final Score',
      finalKills: 'Kills',
      survivedSeconds: 'Seconds Survived',
      highestWave: 'Highest Wave',
      restart: 'Restart',
      start: 'Start Game'
    },
    game: {
      minimap: 'Minimap',
      crosshair: 'Crosshair',
      expeditionProgress: 'Expedition Progress',
      wave: 'Wave',
      alive: 'Alive',
      score: 'Score',
      kills: 'Kills',
      combo: 'Combo',
      pause: 'Pause',
      health: 'HP',
      ammo: 'Ammo',
      reload: 'Reload',
      pausedKicker: 'Expedition Paused',
      pausedTitle: 'Expedition Paused',
      remaining: 'Remaining',
      resume: 'Resume',
      restart: 'Restart',
      backToTitle: 'Back to Title',
      sceneFailed: 'Scene failed to render',
      webglFailed: 'WebGL failed to initialize',
      damageHeadshot: 'HEADSHOT',
      mobileControls: 'Mobile controls',
      mobileMove: 'Move',
      mobileAim: 'Aim',
      mobileFire: 'Fire',
      dinosaurHealth: '{name} health',
      dinosaurs: {
        raptor: 'Raptor',
        dilo: 'Dilophosaur',
        trex: 'T-Rex'
      }
    }
  }
};

export function getTranslation(locale) {
  return TRANSLATIONS[locale] ?? TRANSLATIONS[DEFAULT_LOCALE];
}
