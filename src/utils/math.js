import * as THREE from 'three';

export function clamp(value, minValue, maxValue) {
  return Math.min(maxValue, Math.max(minValue, value));
}

export function damp(currentValue, targetValue, smoothing, deltaTime) {
  return THREE.MathUtils.lerp(currentValue, targetValue, 1 - Math.exp(-smoothing * deltaTime));
}

export function normalizeAngle(angle) {
  let normalizedAngle = angle;
  while (normalizedAngle > Math.PI) normalizedAngle -= Math.PI * 2;
  while (normalizedAngle < -Math.PI) normalizedAngle += Math.PI * 2;
  return normalizedAngle;
}

export function lerpAngle(currentAngle, targetAngle, amount) {
  return currentAngle + normalizeAngle(targetAngle - currentAngle) * clamp(amount, 0, 1);
}

export function vectorFromHeading(heading) {
  return new THREE.Vector3(Math.sin(heading), 0, Math.cos(heading));
}

export function rotateLocalOffset(heading, offset) {
  const localOffset = new THREE.Vector3(offset[0], offset[1], offset[2]);
  localOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), heading);
  return localOffset;
}

export function createSeededRandom(seed) {
  let randomState = seed >>> 0;
  return function seededRandom() {
    randomState += 0x6d2b79f5;
    let mixedState = randomState;
    mixedState = Math.imul(mixedState ^ (mixedState >>> 15), mixedState | 1);
    mixedState ^= mixedState + Math.imul(mixedState ^ (mixedState >>> 7), mixedState | 61);
    return ((mixedState ^ (mixedState >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomRange(random, minValue, maxValue) {
  return minValue + (maxValue - minValue) * random();
}

export function chooseWeighted(random, weightedItems) {
  const totalWeight = weightedItems.reduce((sum, item) => sum + item.weight, 0);
  let cursor = random() * totalWeight;
  for (const item of weightedItems) {
    cursor -= item.weight;
    if (cursor <= 0) return item.value;
  }
  return weightedItems[weightedItems.length - 1].value;
}

export function getSpawnPosition(playerPosition, mapSize, minDistance, maxDistance, random) {
  const spawnAngle = randomRange(random, 0, Math.PI * 2);
  const spawnDistance = randomRange(random, minDistance, maxDistance);
  const rawPosition = new THREE.Vector3(
    playerPosition.x + Math.sin(spawnAngle) * spawnDistance,
    0,
    playerPosition.z + Math.cos(spawnAngle) * spawnDistance
  );

  rawPosition.x = clamp(rawPosition.x, -mapSize + 8, mapSize - 8);
  rawPosition.z = clamp(rawPosition.z, -mapSize + 8, mapSize - 8);
  return rawPosition;
}

export function raySphereDistance(rayOrigin, rayDirection, sphereCenter, sphereRadius) {
  const originToCenter = sphereCenter.clone().sub(rayOrigin);
  const projectionDistance = originToCenter.dot(rayDirection);
  if (projectionDistance < 0) return null;

  const closestPoint = rayOrigin.clone().addScaledVector(rayDirection, projectionDistance);
  const distanceSquared = closestPoint.distanceToSquared(sphereCenter);
  const radiusSquared = sphereRadius * sphereRadius;
  if (distanceSquared > radiusSquared) return null;

  const backtrackDistance = Math.sqrt(radiusSquared - distanceSquared);
  return Math.max(0, projectionDistance - backtrackDistance);
}

export function makePlainVector(vector) {
  return { x: vector.x, y: vector.y, z: vector.z };
}