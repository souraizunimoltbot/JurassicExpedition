import { useMemo } from 'react';
import { WORLD } from '../constants/gameConstants.js';
import { createSeededRandom, randomRange } from '../utils/math.js';

function Tree({ position, scale, trunkColor, leafColor }) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.16, 0.22, 1.7, 6]} />
        <meshStandardMaterial color={trunkColor} flatShading />
      </mesh>
      <mesh castShadow position={[0, 2.0, 0]}>
        <coneGeometry args={[0.95, 1.8, 7]} />
        <meshStandardMaterial color={leafColor} flatShading />
      </mesh>
      <mesh castShadow position={[0, 2.95, 0]}>
        <coneGeometry args={[0.68, 1.35, 7]} />
        <meshStandardMaterial color="#2f7f4a" flatShading />
      </mesh>
    </group>
  );
}

function Rock({ position, scale, rotation }) {
  return (
    <mesh castShadow receiveShadow position={position} scale={scale} rotation={rotation}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#8d9488" roughness={0.9} flatShading />
    </mesh>
  );
}

function ExpeditionCamp({ position, rotation = 0 }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh castShadow receiveShadow position={[0, 0.08, 0]}>
        <boxGeometry args={[8.5, 0.16, 6.2]} />
        <meshStandardMaterial color="#b18a52" roughness={0.95} flatShading />
      </mesh>
      <mesh castShadow position={[-2.6, 0.82, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[2.2, 1.4, 3.2]} />
        <meshStandardMaterial color="#d7c36d" roughness={0.9} flatShading />
      </mesh>
      <mesh castShadow position={[1.9, 0.62, -1.2]}>
        <boxGeometry args={[1.2, 1.2, 1.2]} />
        <meshStandardMaterial color="#7b5d38" roughness={0.9} flatShading />
      </mesh>
      <mesh castShadow position={[3.2, 0.48, 1.3]}>
        <boxGeometry args={[1.5, 0.95, 1]} />
        <meshStandardMaterial color="#5f6b48" roughness={0.9} flatShading />
      </mesh>
      <mesh castShadow position={[0.4, 2.2, 2.2]}>
        <cylinderGeometry args={[0.06, 0.08, 4.2, 5]} />
        <meshStandardMaterial color="#2c2c2c" roughness={0.75} flatShading />
      </mesh>
      <mesh castShadow position={[0.4, 4.45, 2.2]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[1.2, 0.12, 0.12]} />
        <meshStandardMaterial color="#ecf0da" roughness={0.7} flatShading />
      </mesh>
    </group>
  );
}

function StoneArch({ position, rotation = 0, scale = 1 }) {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      <mesh castShadow receiveShadow position={[-1.6, 1.15, 0]} rotation={[0.1, 0, -0.08]}>
        <boxGeometry args={[1.0, 2.3, 1.1]} />
        <meshStandardMaterial color="#777f72" roughness={0.95} flatShading />
      </mesh>
      <mesh castShadow receiveShadow position={[1.6, 1.15, 0]} rotation={[-0.06, 0, 0.08]}>
        <boxGeometry args={[1.0, 2.3, 1.1]} />
        <meshStandardMaterial color="#70786d" roughness={0.95} flatShading />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 2.55, 0]} rotation={[0, 0, 0.04]}>
        <boxGeometry args={[4.2, 0.85, 1.08]} />
        <meshStandardMaterial color="#858b7c" roughness={0.95} flatShading />
      </mesh>
    </group>
  );
}

function WaterHole({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
        <circleGeometry args={[8, 14]} />
        <meshStandardMaterial color="#4aa6b8" roughness={0.45} metalness={0.05} transparent opacity={0.82} flatShading />
      </mesh>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.018, 0]}>
        <ringGeometry args={[8.1, 10, 14]} />
        <meshStandardMaterial color="#6b8f54" roughness={1} flatShading />
      </mesh>
    </group>
  );
}

export default function Environment() {
  const props = useMemo(() => {
    const random = createSeededRandom(20260521);
    const trees = [];
    const rocks = [];
    const patches = [];
    const camps = [];
    const arches = [];
    const waterHoles = [];

    for (let index = 0; index < 178; index += 1) {
      const sideBias = random() < 0.35 ? randomRange(random, 48, WORLD.MAP_SIZE - 10) : randomRange(random, 14, WORLD.MAP_SIZE - 12);
      const angle = randomRange(random, 0, Math.PI * 2);
      trees.push({
        position: [Math.sin(angle) * sideBias, 0, Math.cos(angle) * sideBias],
        scale: randomRange(random, 0.75, 1.55),
        trunkColor: random() > 0.5 ? '#6f4b2f' : '#7d5734',
        leafColor: random() > 0.45 ? '#326f42' : '#3b8b4d'
      });
    }

    for (let index = 0; index < 132; index += 1) {
      rocks.push({
        position: [randomRange(random, -WORLD.MAP_SIZE + 8, WORLD.MAP_SIZE - 8), 0.24, randomRange(random, -WORLD.MAP_SIZE + 8, WORLD.MAP_SIZE - 8)],
        scale: [randomRange(random, 0.45, 1.45), randomRange(random, 0.25, 0.85), randomRange(random, 0.45, 1.45)],
        rotation: [randomRange(random, -0.25, 0.25), randomRange(random, 0, Math.PI), randomRange(random, -0.25, 0.25)]
      });
    }

    for (let index = 0; index < 235; index += 1) {
      patches.push({
        position: [randomRange(random, -WORLD.MAP_SIZE, WORLD.MAP_SIZE), 0.012, randomRange(random, -WORLD.MAP_SIZE, WORLD.MAP_SIZE)],
        scale: [randomRange(random, 4, 16), randomRange(random, 3, 13), 1],
        rotation: [Math.PI * -0.5, 0, randomRange(random, 0, Math.PI)],
        color: random() > 0.5 ? '#75b84a' : '#8ac65a'
      });
    }

    camps.push(
      { position: [46, 0, 58], rotation: -0.45 },
      { position: [-138, 0, 112], rotation: 0.82 },
      { position: [162, 0, -128], rotation: 2.1 }
    );
    arches.push(
      { position: [-82, 0, -78], rotation: 0.55, scale: 1.35 },
      { position: [118, 0, 96], rotation: -0.8, scale: 1.15 },
      { position: [-208, 0, -152], rotation: 1.3, scale: 1.55 }
    );
    waterHoles.push(
      { position: [86, 0, -62], scale: 1.15 },
      { position: [-174, 0, 42], scale: 0.92 },
      { position: [214, 0, 146], scale: 1.35 }
    );

    return { trees, rocks, patches, camps, arches, waterHoles };
  }, []);

  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[WORLD.MAP_SIZE * 2.2, WORLD.MAP_SIZE * 2.2, 18, 18]} />
        <meshStandardMaterial color="#6fa55a" roughness={0.95} flatShading />
      </mesh>
      {props.patches.map((patch, index) => (
        <mesh key={`patch-${index}`} receiveShadow position={patch.position} rotation={patch.rotation} scale={patch.scale}>
          <planeGeometry args={[1, 1]} />
          <meshStandardMaterial color={patch.color} roughness={1} />
        </mesh>
      ))}
      <gridHelper args={[WORLD.MAP_SIZE * 2, 36, '#89bd6f', '#5f8e51']} position={[0, 0.03, 0]} />
      {props.waterHoles.map((waterHole, index) => (
        <WaterHole key={`water-${index}`} {...waterHole} />
      ))}
      {props.arches.map((arch, index) => (
        <StoneArch key={`arch-${index}`} {...arch} />
      ))}
      {props.camps.map((camp, index) => (
        <ExpeditionCamp key={`camp-${index}`} {...camp} />
      ))}
      {props.trees.map((tree, index) => (
        <Tree key={`tree-${index}`} {...tree} />
      ))}
      {props.rocks.map((rock, index) => (
        <Rock key={`rock-${index}`} {...rock} />
      ))}
    </group>
  );
}