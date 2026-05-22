export const WORLD = {
  MAP_SIZE: 320,
  SAFE_SPAWN_RADIUS: 52,
  SPAWN_MIN_DISTANCE: 68,
  SPAWN_MAX_DISTANCE: 148,
  INITIAL_DINOSAURS: 13,
  MAX_DINOSAURS: 24,
  SPAWN_INTERVAL: 2.45,
  MINIMAP_RANGE: 170
};

export const GAME = {
  EXPEDITION_DURATION: 360,
  WAVE_LENGTH: 45,
  MAX_WAVE: 8,
  MAX_DINOSAURS_HARD_CAP: 34,
  COMPLETION_BONUS: 2500,
  COMBO_WINDOW: 4.5,
  LOW_HEALTH_THRESHOLD: 32
};

export const PLAYER = {
  MAX_HEALTH: 100,
  ACCELERATION_RESPONSE: 1.9,
  BRAKE_RESPONSE: 3.2,
  COAST_RESPONSE: 0.82,
  STEERING_RESPONSE: 8.5,
  VISUAL_RESPONSE: 18,
  MAX_SPEED: 20,
  REVERSE_MAX_SPEED: 8,
  TURN_SPEED: 1.85,
  MAX_WHEEL_STEER: 0.58,
  COLLISION_RADIUS: 2.2
};

export const WEAPON = {
  FIRE_INTERVAL: 0.095,
  RANGE: 125,
  HEADSHOT_ASSIST: 1.35,
  MAGAZINE_SIZE: 90,
  RELOAD_TIME: 1.35,
  BODY_DAMAGE: 22,
  HEAD_DAMAGE: 100,
  TRACER_DURATION: 0.12,
  MUZZLE_DURATION: 0.07,
  IMPACT_DURATION: 0.55,
  DAMAGE_TEXT_DURATION: 0.85
};

export const DINO_TYPES = {
  raptor: {
    key: 'raptor',
    label: 'Raptor',
    color: '#6faa3f',
    accent: '#d4e270',
    maxHealth: 70,
    speed: 7.4,
    patrolSpeed: 2.1,
    turnSpeed: 4.3,
    aggroRange: 46,
    attackDamage: 7,
    attackRange: 2.4,
    attackCooldown: 0.82,
    score: 100,
    modelScale: 1,
    healthBarHeight: 3.15,
    bodyHitbox: { offset: [0, 1.12, -0.1], radius: 0.92 },
    headHitbox: { offset: [0, 1.9, 1.32], radius: 0.62 }
  },
  dilo: {
    key: 'dilo',
    label: 'Dilophosaur',
    color: '#4f9ec4',
    accent: '#f2d15c',
    maxHealth: 135,
    speed: 5.3,
    patrolSpeed: 1.8,
    turnSpeed: 3.2,
    aggroRange: 55,
    attackDamage: 12,
    attackRange: 2.8,
    attackCooldown: 1.08,
    score: 250,
    modelScale: 1.18,
    healthBarHeight: 3.95,
    bodyHitbox: { offset: [0, 1.32, -0.08], radius: 1.0 },
    headHitbox: { offset: [0, 2.22, 1.42], radius: 0.72 }
  },
  trex: {
    key: 'trex',
    label: 'T-Rex',
    color: '#8b6748',
    accent: '#e47b3a',
    maxHealth: 270,
    speed: 3.75,
    patrolSpeed: 1.2,
    turnSpeed: 2.15,
    aggroRange: 68,
    attackDamage: 23,
    attackRange: 3.8,
    attackCooldown: 1.45,
    score: 500,
    modelScale: 1.7,
    healthBarHeight: 5.2,
    bodyHitbox: { offset: [0, 1.55, -0.1], radius: 1.12 },
    headHitbox: { offset: [0, 2.75, 1.48], radius: 0.76 }
  }
};

export const DINO_TYPE_KEYS = Object.keys(DINO_TYPES);