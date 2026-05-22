import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Component, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { DINO_TYPE_KEYS, DINO_TYPES, GAME, PLAYER, WEAPON, WORLD } from './constants/gameConstants.js';
import Dinosaur from './components/Dinosaur.jsx';
import Effects from './components/Effects.jsx';
import Environment from './components/Environment.jsx';
import GameUI from './components/GameUI.jsx';
import PlayerTruck from './components/PlayerTruck.jsx';
import { useKeyboardControls } from './hooks/useKeyboardControls.js';
import { usePointerAim } from './hooks/usePointerAim.js';
import {
  chooseWeighted,
  clamp,
  createSeededRandom,
  damp,
  getSpawnPosition,
  lerpAngle,
  makePlainVector,
  normalizeAngle,
  randomRange,
  raySphereDistance,
  rotateLocalOffset,
  vectorFromHeading
} from './utils/math.js';

const DINO_WEIGHTS = [
  { value: 'raptor', weight: 5 },
  { value: 'dilo', weight: 3 },
  { value: 'trex', weight: 1.35 }
];

function createInitialHud() {
  return {
    score: 0,
    kills: 0,
    health: PLAYER.MAX_HEALTH,
    ammo: WEAPON.MAGAZINE_SIZE,
    reloadTime: 0,
    elapsedTime: 0,
    remainingTime: GAME.EXPEDITION_DURATION,
    progress: 0,
    wave: 1,
    combo: 0,
    aliveCount: 0,
    aimZone: 'none',
    hitMarker: false,
    hitMarkerZone: 'none',
    threatLevel: 'CLEAR',
    nearestThreatDistance: null,
    threatBearing: 0,
    player: { x: 0, z: 0, heading: 0 },
    dinosaurs: []
  };
}

function getWaveForTime(elapsedTime) {
  return Math.min(GAME.MAX_WAVE, Math.floor(elapsedTime / GAME.WAVE_LENGTH) + 1);
}

function getDinoWeightsForWave(wave) {
  return [
    { value: 'raptor', weight: Math.max(2.4, 5.2 - wave * 0.18) },
    { value: 'dilo', weight: 2.7 + wave * 0.38 },
    { value: 'trex', weight: 0.75 + Math.max(0, wave - 1) * 0.46 }
  ];
}

function createDinosaurEntity(type, position, random, id) {
  const archetype = DINO_TYPES[type];
  return {
    id,
    type,
    position,
    heading: randomRange(random, -Math.PI, Math.PI),
    health: archetype.maxHealth,
    patrolTarget: getSpawnPosition(position, WORLD.MAP_SIZE, 8, 26, random),
    aiState: 'patrol',
    attackCooldown: randomRange(random, 0, 0.8),
    flashTime: 0,
    walkTime: 0,
    isDying: false,
    deathAge: 0
  };
}

function getDinosaurHitCenter(entity, archetype, hitbox) {
  const scaledOffset = hitbox.offset.map((component) => component * archetype.modelScale);
  return entity.position.clone().add(rotateLocalOffset(entity.heading, scaledOffset));
}

function makeImpactParticles(random) {
  return Array.from({ length: 12 }, () => ({
    offset: new THREE.Vector3(randomRange(random, -0.12, 0.12), randomRange(random, -0.05, 0.18), randomRange(random, -0.12, 0.12)),
    velocity: new THREE.Vector3(randomRange(random, -1.7, 1.7), randomRange(random, 0.7, 2.8), randomRange(random, -1.7, 1.7)),
    size: randomRange(random, 0.045, 0.11),
    color: random() > 0.35 ? '#ff2f2f' : '#8b1010'
  }));
}

function GameScene({ controlsRef, aimRefs, setHud, onGameOver, isPaused }) {
  const { camera, size } = useThree();
  const randomRef = useRef(createSeededRandom(9132026));
  const vehicleStateRef = useRef({
    position: new THREE.Vector3(0, 0, 0),
    heading: 0,
    speed: 0,
    steering: 0,
    bodyRoll: 0,
    bodyPitch: 0,
    health: PLAYER.MAX_HEALTH
  });
  const truckApiRef = useRef();
  const turretYawRef = useRef(0);
  const turretPitchRef = useRef(0);
  const recoilRef = useRef(0);
  const weaponRef = useRef({ cooldown: 0, ammo: WEAPON.MAGAZINE_SIZE, reloadTime: 0 });
  const dinosaursRef = useRef([]);
  const effectIdRef = useRef(0);
  const dinosaurIdRef = useRef(0);
  const effectsRef = useRef([]);
  const scoreRef = useRef({ score: 0, kills: 0 });
  const directorRef = useRef({
    elapsedTime: 0,
    wave: 1,
    combo: 0,
    comboTimer: 0,
    aimZone: 'none',
    hitMarkerTime: 0,
    hitMarkerZone: 'none'
  });
  const spawnTimerRef = useRef(WORLD.SPAWN_INTERVAL);
  const snapshotTimerRef = useRef(0);
  const gameOverRef = useRef(false);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const groundPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const [dinosaurs, setDinosaurs] = useState([]);
  const [effects, setEffects] = useState([]);

  const addEffect = useCallback((effect) => {
    effectsRef.current.push({ id: `effect-${effectIdRef.current}`, ...effect });
    effectIdRef.current += 1;
    setEffects([...effectsRef.current]);
  }, []);

  const spawnDinosaur = useCallback((forcedType) => {
    const random = randomRef.current;
    const playerPosition = vehicleStateRef.current.position;
    const wave = directorRef.current.wave;
    const type = forcedType ?? chooseWeighted(random, wave > 1 ? getDinoWeightsForWave(wave) : DINO_WEIGHTS);
    const position = getSpawnPosition(playerPosition, WORLD.MAP_SIZE, WORLD.SPAWN_MIN_DISTANCE, WORLD.SPAWN_MAX_DISTANCE, random);
    const entity = createDinosaurEntity(type, position, random, `dino-${dinosaurIdRef.current}`);
    dinosaurIdRef.current += 1;
    dinosaursRef.current.push(entity);
    return entity;
  }, []);

  useEffect(() => {
    DINO_TYPE_KEYS.forEach((type) => spawnDinosaur(type));
    while (dinosaursRef.current.length < WORLD.INITIAL_DINOSAURS) spawnDinosaur();
    setDinosaurs([...dinosaursRef.current]);
    setHud((currentHud) => ({
      ...currentHud,
      aliveCount: dinosaursRef.current.filter((entity) => !entity.isDying).length,
      dinosaurs: dinosaursRef.current
        .filter((entity) => !entity.isDying)
        .map((entity) => ({ id: entity.id, type: entity.type, ...makePlainVector(entity.position), heading: entity.heading }))
    }));
  }, [setHud, spawnDinosaur]);

  const updateVehicle = useCallback((deltaTime) => {
    const vehicle = vehicleStateRef.current;
    const controls = controlsRef.current;
    const throttle = controls.forward && !controls.backward ? 1 : controls.backward && !controls.forward ? -1 : 0;
    const targetSpeed = throttle > 0 ? PLAYER.MAX_SPEED : throttle < 0 ? -PLAYER.REVERSE_MAX_SPEED : 0;
    const isChangingDirection = targetSpeed !== 0 && Math.sign(targetSpeed) !== Math.sign(vehicle.speed) && Math.abs(vehicle.speed) > 0.6;
    const speedResponse = targetSpeed === 0 ? PLAYER.COAST_RESPONSE : isChangingDirection ? PLAYER.BRAKE_RESPONSE : PLAYER.ACCELERATION_RESPONSE;

    vehicle.speed = damp(vehicle.speed, targetSpeed, speedResponse, deltaTime);
    vehicle.speed = clamp(vehicle.speed, -PLAYER.REVERSE_MAX_SPEED, PLAYER.MAX_SPEED);
    if (targetSpeed === 0 && Math.abs(vehicle.speed) < 0.035) vehicle.speed = 0;

    const targetSteering = (controls.left ? 1 : 0) + (controls.right ? -1 : 0);
    vehicle.steering = damp(vehicle.steering, targetSteering, PLAYER.STEERING_RESPONSE, deltaTime);
    const speedRatio = clamp(Math.abs(vehicle.speed) / PLAYER.MAX_SPEED, 0, 1);
    const reverseTurn = vehicle.speed >= 0 ? 1 : -1;
    vehicle.heading += vehicle.steering * PLAYER.TURN_SPEED * (0.28 + speedRatio * 0.9) * reverseTurn * deltaTime;
    vehicle.heading = normalizeAngle(vehicle.heading);
    vehicle.bodyRoll = damp(vehicle.bodyRoll, -vehicle.steering * speedRatio * 0.12, PLAYER.VISUAL_RESPONSE * 0.55, deltaTime);
    vehicle.bodyPitch = damp(vehicle.bodyPitch, -throttle * speedRatio * 0.035, PLAYER.VISUAL_RESPONSE * 0.45, deltaTime);

    const forward = vectorFromHeading(vehicle.heading);
    vehicle.position.addScaledVector(forward, vehicle.speed * deltaTime);
    vehicle.position.x = clamp(vehicle.position.x, -WORLD.MAP_SIZE + 4, WORLD.MAP_SIZE - 4);
    vehicle.position.z = clamp(vehicle.position.z, -WORLD.MAP_SIZE + 4, WORLD.MAP_SIZE - 4);
  }, [controlsRef]);

  const collectShotCandidates = useCallback((origin, direction, maxRange = WEAPON.RANGE) => {
    const candidates = [];
    for (const entity of dinosaursRef.current) {
      if (entity.isDying || entity.health <= 0) continue;
      const archetype = DINO_TYPES[entity.type];
      const zones = [
        { zone: 'head', hitbox: archetype.headHitbox },
        { zone: 'body', hitbox: archetype.bodyHitbox }
      ];

      for (const { zone, hitbox } of zones) {
        const center = getDinosaurHitCenter(entity, archetype, hitbox);
        const distance = raySphereDistance(origin, direction, center, hitbox.radius * archetype.modelScale);
        if (distance !== null && distance <= maxRange) {
          candidates.push({ entity, zone, distance, center, point: origin.clone().addScaledVector(direction, distance) });
        }
      }
    }
    candidates.sort((first, second) => first.distance - second.distance);
    return candidates;
  }, []);

  const chooseBestShotCandidate = useCallback((candidates) => {
    if (candidates.length === 0) return null;
    const nearest = candidates[0];
    const assistedHeadshot = candidates.find((candidate) => candidate.zone === 'head' && candidate.distance <= nearest.distance + WEAPON.HEADSHOT_ASSIST);
    return assistedHeadshot ?? nearest;
  }, []);

  const getCameraAimPoint = useCallback(
    (cameraRay) => {
      const aimedHit = chooseBestShotCandidate(collectShotCandidates(cameraRay.origin, cameraRay.direction, WEAPON.RANGE * 1.45));
      directorRef.current.aimZone = aimedHit?.zone ?? 'none';
      if (aimedHit) {
        return aimedHit.zone === 'head'
          ? aimedHit.point.clone().lerp(aimedHit.center, 0.45)
          : aimedHit.point.clone().lerp(aimedHit.center, 0.18);
      }

      const groundAimPoint = new THREE.Vector3();
      const intersectsGround = cameraRay.intersectPlane(groundPlane, groundAimPoint);
      if (intersectsGround && groundAimPoint.distanceTo(vehicleStateRef.current.position) >= 6) {
        return groundAimPoint;
      }
      directorRef.current.aimZone = 'none';
      return cameraRay.origin.clone().addScaledVector(cameraRay.direction, WEAPON.RANGE);
    },
    [chooseBestShotCandidate, collectShotCandidates, groundPlane]
  );

  const updateCameraAndTurret = useCallback(
    (deltaTime) => {
      const vehicle = vehicleStateRef.current;
      const forward = vectorFromHeading(vehicle.heading);
      const desiredCamera = vehicle.position.clone().addScaledVector(forward, -10.5).add(new THREE.Vector3(0, 6.4, 0));
      const lookTarget = vehicle.position.clone().addScaledVector(forward, 8.5).add(new THREE.Vector3(0, 1.7, 0));
      camera.position.lerp(desiredCamera, 1 - Math.exp(-5.2 * deltaTime));
      camera.lookAt(lookTarget);

      const crosshair = aimRefs.crosshairRef.current;
      if (!size.width || !size.height) return;
      const normalizedDeviceCoordinates = new THREE.Vector2(
        (crosshair.screenX / size.width) * 2 - 1,
        -(crosshair.screenY / size.height) * 2 + 1
      );
      raycaster.setFromCamera(normalizedDeviceCoordinates, camera);

      const aimPoint = getCameraAimPoint(raycaster.ray);
      const muzzlePosition = truckApiRef.current?.getMuzzleWorldPosition(new THREE.Vector3()) ?? vehicle.position.clone();
      const aimDirection = aimPoint.sub(muzzlePosition);
      if (aimDirection.lengthSq() < 0.001) aimDirection.copy(forward);
      aimDirection.normalize();
      const flatAimDirection = new THREE.Vector3(aimDirection.x, 0, aimDirection.z);
      if (flatAimDirection.lengthSq() < 0.001) flatAimDirection.copy(forward);
      flatAimDirection.normalize();
      const worldTurretYaw = Math.atan2(flatAimDirection.x, flatAimDirection.z);
      const targetLocalYaw = normalizeAngle(worldTurretYaw - vehicle.heading);
      const targetPitch = clamp(-Math.atan2(aimDirection.y, Math.hypot(aimDirection.x, aimDirection.z)), -0.82, 0.48);
      turretYawRef.current = lerpAngle(turretYawRef.current, targetLocalYaw, 1 - Math.exp(-18 * deltaTime));
      turretPitchRef.current = damp(turretPitchRef.current, targetPitch, 18, deltaTime);
    },
    [aimRefs.crosshairRef, camera, getCameraAimPoint, raycaster, size.height, size.width]
  );

  const findShotHit = useCallback((origin, direction) => {
    return chooseBestShotCandidate(collectShotCandidates(origin, direction, WEAPON.RANGE));
  }, [chooseBestShotCandidate, collectShotCandidates]);

  const fireWeapon = useCallback(
    (elapsedTime) => {
      if (!truckApiRef.current) return;
      const random = randomRef.current;
      const origin = truckApiRef.current.getMuzzleWorldPosition(new THREE.Vector3());
      const direction = truckApiRef.current.getMuzzleWorldDirection(new THREE.Vector3());
      const hit = findShotHit(origin, direction);
      const tracerEnd = hit ? hit.point.clone() : origin.clone().addScaledVector(direction, WEAPON.RANGE);

      addEffect({
        type: 'tracer',
        start: origin.clone(),
        end: tracerEnd,
        createdAt: elapsedTime,
        duration: WEAPON.TRACER_DURATION
      });
      addEffect({
        type: 'muzzle',
        position: origin.clone(),
        direction: direction.clone(),
        createdAt: elapsedTime,
        duration: WEAPON.MUZZLE_DURATION
      });

      recoilRef.current = 1;

      if (!hit) return;

      const archetype = DINO_TYPES[hit.entity.type];
      const isHeadshot = hit.zone === 'head';
      const damage = isHeadshot ? WEAPON.HEAD_DAMAGE : WEAPON.BODY_DAMAGE;
      hit.entity.health = Math.max(0, hit.entity.health - damage);
      hit.entity.flashTime = 0.16;
      directorRef.current.hitMarkerTime = 0.18;
      directorRef.current.hitMarkerZone = hit.zone;

      addEffect({
        type: 'impact',
        position: hit.point.clone(),
        particles: makeImpactParticles(random),
        createdAt: elapsedTime,
        duration: WEAPON.IMPACT_DURATION
      });
      addEffect({
        type: 'damage',
        position: getDinosaurHitCenter(hit.entity, archetype, isHeadshot ? archetype.headHitbox : archetype.bodyHitbox),
        text: isHeadshot ? `HEADSHOT -${damage}` : `-${damage}`,
        headshot: isHeadshot,
        createdAt: elapsedTime,
        duration: WEAPON.DAMAGE_TEXT_DURATION
      });

      if (hit.entity.health <= 0 && !hit.entity.isDying) {
        hit.entity.isDying = true;
        hit.entity.deathAge = 0;
        directorRef.current.combo = directorRef.current.comboTimer > 0 ? directorRef.current.combo + 1 : 1;
        directorRef.current.comboTimer = GAME.COMBO_WINDOW;
        const comboMultiplier = 1 + Math.min(4, Math.max(0, directorRef.current.combo - 1)) * 0.15;
        const reward = Math.round(archetype.score * (isHeadshot ? 2 : 1) * comboMultiplier);
        scoreRef.current.kills += 1;
        scoreRef.current.score += reward;
        addEffect({
          type: 'damage',
          position: hit.entity.position.clone().add(new THREE.Vector3(0, archetype.healthBarHeight + 0.7, 0)),
          text: directorRef.current.combo > 1 ? `x${directorRef.current.combo} +${reward}` : `+${reward}`,
          headshot: isHeadshot,
          createdAt: elapsedTime,
          duration: WEAPON.DAMAGE_TEXT_DURATION
        });
      }
    },
    [addEffect, findShotHit]
  );

  const updateWeapon = useCallback(
    (deltaTime, elapsedTime) => {
      const weapon = weaponRef.current;
      weapon.cooldown = Math.max(0, weapon.cooldown - deltaTime);
      recoilRef.current = damp(recoilRef.current, 0, 18, deltaTime);

      if (weapon.reloadTime > 0) {
        weapon.reloadTime = Math.max(0, weapon.reloadTime - deltaTime);
        if (weapon.reloadTime === 0) weapon.ammo = WEAPON.MAGAZINE_SIZE;
        return;
      }

      if (weapon.ammo <= 0) {
        weapon.reloadTime = WEAPON.RELOAD_TIME;
        return;
      }

      if (aimRefs.firingRef.current && weapon.cooldown <= 0) {
        fireWeapon(elapsedTime);
        weapon.ammo -= 1;
        weapon.cooldown = WEAPON.FIRE_INTERVAL;
      }
    },
    [aimRefs.firingRef, fireWeapon]
  );

  const updateDinosaurs = useCallback((deltaTime) => {
    const random = randomRef.current;
    const playerPosition = vehicleStateRef.current.position;
    const vehicle = vehicleStateRef.current;

    for (const entity of dinosaursRef.current) {
      const archetype = DINO_TYPES[entity.type];
      const difficultyMultiplier = 1 + Math.min(0.55, (directorRef.current.wave - 1) * 0.065);
      entity.flashTime = Math.max(0, entity.flashTime - deltaTime);
      entity.attackCooldown = Math.max(0, entity.attackCooldown - deltaTime);

      if (entity.isDying) {
        entity.deathAge += deltaTime;
        continue;
      }

      const distanceToPlayer = entity.position.distanceTo(playerPosition);
      entity.aiState = distanceToPlayer <= archetype.aggroRange ? 'chase' : 'patrol';

      let targetPosition = entity.patrolTarget;
      let moveSpeed = archetype.patrolSpeed;
      if (entity.aiState === 'chase') {
        targetPosition = playerPosition;
        moveSpeed = archetype.speed * difficultyMultiplier;
      } else if (entity.position.distanceTo(entity.patrolTarget) < 3) {
        entity.patrolTarget = getSpawnPosition(entity.position, WORLD.MAP_SIZE, 12, 34, random);
      }

      const moveDirection = targetPosition.clone().sub(entity.position);
      moveDirection.y = 0;
      if (moveDirection.lengthSq() > 0.01) {
        moveDirection.normalize();
        const targetHeading = Math.atan2(moveDirection.x, moveDirection.z);
        entity.heading = lerpAngle(entity.heading, targetHeading, archetype.turnSpeed * deltaTime);
        const facing = vectorFromHeading(entity.heading);
        entity.position.addScaledVector(facing, moveSpeed * deltaTime);
        entity.position.x = clamp(entity.position.x, -WORLD.MAP_SIZE + 4, WORLD.MAP_SIZE - 4);
        entity.position.z = clamp(entity.position.z, -WORLD.MAP_SIZE + 4, WORLD.MAP_SIZE - 4);
        entity.walkTime += deltaTime * moveSpeed;
      }

      if (distanceToPlayer <= archetype.attackRange + PLAYER.COLLISION_RADIUS && entity.attackCooldown <= 0) {
        vehicle.health = Math.max(0, vehicle.health - Math.round(archetype.attackDamage * difficultyMultiplier));
        entity.attackCooldown = archetype.attackCooldown;
      }
    }

    const beforeRemovalCount = dinosaursRef.current.length;
    dinosaursRef.current = dinosaursRef.current.filter((entity) => !entity.isDying || entity.deathAge < 1.15);
    if (dinosaursRef.current.length !== beforeRemovalCount) {
      setDinosaurs([...dinosaursRef.current]);
    }
  }, [setDinosaurs]);

  const updateSpawning = useCallback((deltaTime) => {
    spawnTimerRef.current -= deltaTime;
    const activeCount = dinosaursRef.current.filter((entity) => !entity.isDying).length;
    const wave = directorRef.current.wave;
    const activeCap = Math.min(GAME.MAX_DINOSAURS_HARD_CAP, WORLD.MAX_DINOSAURS + Math.floor((wave - 1) * 1.55));
    if (spawnTimerRef.current <= 0 && activeCount < activeCap) {
      const forceTrex = wave >= 3 && randomRef.current() < Math.min(0.25, 0.08 + wave * 0.018);
      spawnDinosaur(forceTrex ? 'trex' : undefined);
      setDinosaurs([...dinosaursRef.current]);
      spawnTimerRef.current = Math.max(1.05, WORLD.SPAWN_INTERVAL - (wave - 1) * 0.17);
    }
  }, [setDinosaurs, spawnDinosaur]);

  const updateDirector = useCallback((deltaTime) => {
    const director = directorRef.current;
    director.elapsedTime += deltaTime;
    director.wave = getWaveForTime(director.elapsedTime);
    director.comboTimer = Math.max(0, director.comboTimer - deltaTime);
    director.hitMarkerTime = Math.max(0, director.hitMarkerTime - deltaTime);
    if (director.comboTimer === 0) director.combo = 0;
  }, []);

  const getThreatSnapshot = useCallback(() => {
    const playerPosition = vehicleStateRef.current.position;
    const playerHeading = vehicleStateRef.current.heading;
    let nearestThreat = null;

    for (const entity of dinosaursRef.current) {
      if (entity.isDying || entity.health <= 0) continue;
      const distance = entity.position.distanceTo(playerPosition);
      if (!nearestThreat || distance < nearestThreat.distance) {
        nearestThreat = { entity, distance };
      }
    }

    if (!nearestThreat) {
      return { threatLevel: 'CLEAR', nearestThreatDistance: null, threatBearing: 0 };
    }

    const relativeX = nearestThreat.entity.position.x - playerPosition.x;
    const relativeZ = nearestThreat.entity.position.z - playerPosition.z;
    const rotationCos = Math.cos(-playerHeading);
    const rotationSin = Math.sin(-playerHeading);
    const rotatedX = relativeX * rotationCos - relativeZ * rotationSin;
    const rotatedZ = relativeX * rotationSin + relativeZ * rotationCos;
    const threatBearing = Math.atan2(rotatedX, -rotatedZ) * THREE.MathUtils.RAD2DEG;
    const threatLevel = nearestThreat.distance <= GAME.CLOSE_THREAT_DISTANCE ? 'DANGER' : nearestThreat.distance <= 72 ? 'HUNTED' : 'CLEAR';

    return {
      threatLevel,
      nearestThreatDistance: nearestThreat.distance,
      threatBearing
    };
  }, []);

  const publishSnapshots = useCallback((deltaTime, elapsedTime) => {
    snapshotTimerRef.current += deltaTime;
    const activeEffects = effectsRef.current.filter((effect) => elapsedTime - effect.createdAt < effect.duration + 0.18);
    if (activeEffects.length !== effectsRef.current.length) {
      effectsRef.current = activeEffects;
      setEffects([...effectsRef.current]);
    }

    if (snapshotTimerRef.current < 0.075) return;
    snapshotTimerRef.current = 0;

    const vehicle = vehicleStateRef.current;
    const weapon = weaponRef.current;
    const director = directorRef.current;
    const threat = getThreatSnapshot();
    const remainingTime = Math.max(0, GAME.EXPEDITION_DURATION - director.elapsedTime);
    setHud({
      score: scoreRef.current.score,
      kills: scoreRef.current.kills,
      health: vehicle.health,
      ammo: weapon.ammo,
      reloadTime: weapon.reloadTime,
      elapsedTime: director.elapsedTime,
      remainingTime,
      progress: clamp(director.elapsedTime / GAME.EXPEDITION_DURATION, 0, 1),
      wave: director.wave,
      combo: director.combo,
      aliveCount: dinosaursRef.current.filter((entity) => !entity.isDying).length,
      aimZone: director.aimZone,
      hitMarker: director.hitMarkerTime > 0,
      hitMarkerZone: director.hitMarkerZone,
      ...threat,
      player: { x: vehicle.position.x, z: vehicle.position.z, heading: vehicle.heading },
      dinosaurs: dinosaursRef.current
        .filter((entity) => !entity.isDying)
        .map((entity) => ({ id: entity.id, type: entity.type, ...makePlainVector(entity.position), heading: entity.heading }))
    });
  }, [getThreatSnapshot, setHud]);

  useFrame(({ clock }, deltaTime) => {
    if (gameOverRef.current) return;
    if (isPaused) return;
    const clampedDelta = Math.min(deltaTime, 0.05);
    const elapsedTime = clock.elapsedTime;

    updateDirector(clampedDelta);
    updateVehicle(clampedDelta);
    updateCameraAndTurret(clampedDelta);
    updateWeapon(clampedDelta, elapsedTime);
    updateDinosaurs(clampedDelta);
    updateSpawning(clampedDelta);
    publishSnapshots(clampedDelta, elapsedTime);

    if (directorRef.current.elapsedTime >= GAME.EXPEDITION_DURATION && !gameOverRef.current) {
      gameOverRef.current = true;
      scoreRef.current.score += GAME.COMPLETION_BONUS;
      onGameOver({
        score: scoreRef.current.score,
        kills: scoreRef.current.kills,
        survivedTime: directorRef.current.elapsedTime,
        wave: directorRef.current.wave,
        victory: true
      });
      return;
    }

    if (vehicleStateRef.current.health <= 0 && !gameOverRef.current) {
      gameOverRef.current = true;
      onGameOver({
        score: scoreRef.current.score,
        kills: scoreRef.current.kills,
        survivedTime: directorRef.current.elapsedTime,
        wave: directorRef.current.wave,
        victory: false
      });
    }
  }, -100);

  return (
    <>
      <color attach="background" args={['#9fc4e5']} />
      <fog attach="fog" args={['#9fc4e5', 88, 330]} />
      <ambientLight intensity={0.72} />
      <directionalLight
        castShadow
        position={[28, 42, 18]}
        intensity={1.05}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-120}
        shadow-camera-right={120}
        shadow-camera-top={120}
        shadow-camera-bottom={-120}
        shadow-camera-near={0.5}
        shadow-camera-far={160}
        shadow-bias={-0.0002}
      />
      <hemisphereLight args={['#c8ebff', '#76a654', 0.55]} />
      <Environment />
      <PlayerTruck ref={truckApiRef} vehicleStateRef={vehicleStateRef} turretYawRef={turretYawRef} turretPitchRef={turretPitchRef} recoilRef={recoilRef} />
      {dinosaurs.map((entity) => (
        <Dinosaur key={entity.id} entity={entity} />
      ))}
      <Effects effects={effects} />
    </>
  );
}

const MemoizedGameScene = memo(GameScene);

class SceneErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    console.error('Jurassic Expedition scene error:', error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="scene-error">
          <strong>Scene failed to render</strong>
          <span>{this.state.error.message}</span>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function Game({ onGameOver, onRestart, onQuit }) {
  const controlsRef = useKeyboardControls();
  const pointerAim = usePointerAim();
  const [hud, setHud] = useState(createInitialHud);
  const [isPaused, setIsPaused] = useState(false);
  const aimRefs = useMemo(() => ({
    crosshairRef: pointerAim.crosshairRef,
    firingRef: pointerAim.firingRef
  }), [pointerAim.crosshairRef, pointerAim.firingRef]);

  const togglePause = useCallback(() => {
    setIsPaused((current) => !current);
  }, []);

  const resumeGame = useCallback(() => {
    setIsPaused(false);
  }, []);

  useEffect(() => {
    const handlePauseKey = (keyboardEvent) => {
      if (keyboardEvent.code === 'Escape' || keyboardEvent.code === 'KeyP') {
        keyboardEvent.preventDefault();
        togglePause();
      }
    };
    window.addEventListener('keydown', handlePauseKey, { passive: false });
    return () => window.removeEventListener('keydown', handlePauseKey);
  }, [togglePause]);

  useEffect(() => {
    if (isPaused) pointerAim.firingRef.current = false;
  }, [isPaused, pointerAim.firingRef]);

  return (
    <div className="game-shell" onContextMenu={(contextMenuEvent) => contextMenuEvent.preventDefault()}>
      <SceneErrorBoundary>
        <Canvas
          shadows="soft"
          dpr={[1, 1.5]}
          camera={{ position: [0, 6.4, -11.2], fov: 58, near: 0.1, far: 420 }}
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance', stencil: false }}
          fallback={<div className="scene-error">WebGL 初始化失敗</div>}
          onCreated={({ gl }) => gl.setClearColor('#9fc4e5')}
          onPointerMove={pointerAim.handlePointerMove}
          onPointerDown={(pointerEvent) => {
            if (!isPaused) pointerAim.handlePointerDown(pointerEvent);
          }}
          onPointerUp={pointerAim.handlePointerUp}
        >
          <MemoizedGameScene
            controlsRef={controlsRef}
            aimRefs={aimRefs}
            setHud={setHud}
            onGameOver={onGameOver}
            isPaused={isPaused}
          />
        </Canvas>
      </SceneErrorBoundary>
      <GameUI
        hud={hud}
        crosshair={pointerAim.crosshair}
        isPaused={isPaused}
        onPause={togglePause}
        onResume={resumeGame}
        onRestart={onRestart}
        onQuit={onQuit}
      />
    </div>
  );
}