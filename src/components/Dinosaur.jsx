import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useRef } from 'react';
import { DINO_TYPES } from '../constants/gameConstants.js';

function DinoMaterial({ color, flash }) {
  return <meshStandardMaterial color={flash ? '#ff4b4b' : color} roughness={0.82} flatShading />;
}

function Leg({ position, scale = [0.35, 1, 0.38], color, flash }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.38, 0]} scale={scale}>
        <boxGeometry args={[1, 1, 1]} />
        <DinoMaterial color={color} flash={flash} />
      </mesh>
      <mesh castShadow position={[0, -0.1, 0.24]} scale={[scale[0] * 1.28, 0.24, scale[2] * 1.5]}>
        <boxGeometry args={[1, 1, 1]} />
        <DinoMaterial color="#29341f" flash={flash} />
      </mesh>
    </group>
  );
}

function Tail({ color, flash, length = 2.45, height = 0.42 }) {
  return (
    <mesh castShadow position={[0, 1.16, -1.55]} rotation={[0.42, 0, 0]} scale={[0.42, height, length]}>
      <coneGeometry args={[1, 1, 7]} />
      <DinoMaterial color={color} flash={flash} />
    </mesh>
  );
}

function RaptorModel({ archetype, flash }) {
  return (
    <group>
      <mesh castShadow position={[0, 1.28, 0]} rotation={[-0.12, 0, 0]} scale={[0.82, 0.55, 1.55]}>
        <boxGeometry args={[1, 1, 1]} />
        <DinoMaterial color={archetype.color} flash={flash} />
      </mesh>
      <mesh castShadow position={[0, 1.92, 1.24]} rotation={[-0.2, 0, 0]} scale={[0.52, 0.42, 0.78]}>
        <boxGeometry args={[1, 1, 1]} />
        <DinoMaterial color={archetype.color} flash={flash} />
      </mesh>
      <mesh castShadow position={[0, 1.88, 1.88]} scale={[0.42, 0.23, 0.38]}>
        <boxGeometry args={[1, 1, 1]} />
        <DinoMaterial color="#2f3d24" flash={flash} />
      </mesh>
      <Tail color={archetype.color} flash={flash} />
      <Leg position={[-0.46, 0.42, 0.35]} scale={[0.34, 1.08, 0.36]} color={archetype.color} flash={flash} />
      <Leg position={[0.46, 0.42, 0.35]} scale={[0.34, 1.08, 0.36]} color={archetype.color} flash={flash} />
      <Leg position={[-0.42, 0.55, -0.72]} scale={[0.24, 0.72, 0.28]} color={archetype.color} flash={flash} />
      <Leg position={[0.42, 0.55, -0.72]} scale={[0.24, 0.72, 0.28]} color={archetype.color} flash={flash} />
      <mesh castShadow position={[-0.54, 1.52, 0.9]} rotation={[0.2, 0, -0.55]} scale={[0.14, 0.16, 0.72]}>
        <boxGeometry args={[1, 1, 1]} />
        <DinoMaterial color={archetype.accent} flash={flash} />
      </mesh>
      <mesh castShadow position={[0.54, 1.52, 0.9]} rotation={[0.2, 0, 0.55]} scale={[0.14, 0.16, 0.72]}>
        <boxGeometry args={[1, 1, 1]} />
        <DinoMaterial color={archetype.accent} flash={flash} />
      </mesh>
    </group>
  );
}

function DiloModel({ archetype, flash }) {
  return (
    <group>
      <mesh castShadow position={[0, 1.44, -0.04]} rotation={[-0.08, 0, 0]} scale={[0.95, 0.68, 1.75]}>
        <boxGeometry args={[1, 1, 1]} />
        <DinoMaterial color={archetype.color} flash={flash} />
      </mesh>
      <mesh castShadow position={[0, 2.17, 1.24]} rotation={[-0.22, 0, 0]} scale={[0.62, 0.48, 0.82]}>
        <boxGeometry args={[1, 1, 1]} />
        <DinoMaterial color={archetype.color} flash={flash} />
      </mesh>
      <mesh castShadow position={[-0.23, 2.62, 1.32]} rotation={[0.14, 0, -0.16]} scale={[0.12, 0.58, 0.45]}>
        <coneGeometry args={[1, 1, 5]} />
        <DinoMaterial color={archetype.accent} flash={flash} />
      </mesh>
      <mesh castShadow position={[0.23, 2.62, 1.32]} rotation={[0.14, 0, 0.16]} scale={[0.12, 0.58, 0.45]}>
        <coneGeometry args={[1, 1, 5]} />
        <DinoMaterial color={archetype.accent} flash={flash} />
      </mesh>
      <mesh castShadow position={[0, 1.98, 0.1]} rotation={[0.08, 0, 0]} scale={[0.12, 0.75, 1.25]}>
        <boxGeometry args={[1, 1, 1]} />
        <DinoMaterial color={archetype.accent} flash={flash} />
      </mesh>
      <Tail color={archetype.color} flash={flash} length={2.7} height={0.48} />
      <Leg position={[-0.5, 0.48, 0.36]} scale={[0.38, 1.2, 0.42]} color={archetype.color} flash={flash} />
      <Leg position={[0.5, 0.48, 0.36]} scale={[0.38, 1.2, 0.42]} color={archetype.color} flash={flash} />
      <Leg position={[-0.45, 0.62, -0.82]} scale={[0.25, 0.78, 0.3]} color={archetype.color} flash={flash} />
      <Leg position={[0.45, 0.62, -0.82]} scale={[0.25, 0.78, 0.3]} color={archetype.color} flash={flash} />
    </group>
  );
}

function TrexModel({ archetype, flash }) {
  return (
    <group>
      <mesh castShadow position={[0, 1.68, -0.05]} rotation={[-0.12, 0, 0]} scale={[1.08, 0.82, 1.78]}>
        <boxGeometry args={[1, 1, 1]} />
        <DinoMaterial color={archetype.color} flash={flash} />
      </mesh>
      <mesh castShadow position={[0, 2.68, 1.28]} rotation={[-0.18, 0, 0]} scale={[0.88, 0.72, 0.95]}>
        <boxGeometry args={[1, 1, 1]} />
        <DinoMaterial color={archetype.color} flash={flash} />
      </mesh>
      <mesh castShadow position={[0, 2.48, 1.92]} scale={[0.7, 0.32, 0.46]}>
        <boxGeometry args={[1, 1, 1]} />
        <DinoMaterial color="#3c2a1d" flash={flash} />
      </mesh>
      <Tail color={archetype.color} flash={flash} length={3.35} height={0.62} />
      <Leg position={[-0.62, 0.58, 0.34]} scale={[0.48, 1.45, 0.52]} color={archetype.color} flash={flash} />
      <Leg position={[0.62, 0.58, 0.34]} scale={[0.48, 1.45, 0.52]} color={archetype.color} flash={flash} />
      <mesh castShadow position={[-0.74, 1.72, 0.78]} rotation={[0.1, 0, -0.38]} scale={[0.18, 0.16, 0.64]}>
        <boxGeometry args={[1, 1, 1]} />
        <DinoMaterial color={archetype.accent} flash={flash} />
      </mesh>
      <mesh castShadow position={[0.74, 1.72, 0.78]} rotation={[0.1, 0, 0.38]} scale={[0.18, 0.16, 0.64]}>
        <boxGeometry args={[1, 1, 1]} />
        <DinoMaterial color={archetype.accent} flash={flash} />
      </mesh>
      <mesh castShadow position={[0, 3.08, 1.28]} scale={[0.58, 0.18, 0.16]}>
        <boxGeometry args={[1, 1, 1]} />
        <DinoMaterial color={archetype.accent} flash={flash} />
      </mesh>
    </group>
  );
}

function DinosaurModel({ entity, archetype, flash }) {
  if (entity.type === 'trex') return <TrexModel archetype={archetype} flash={flash} />;
  if (entity.type === 'dilo') return <DiloModel archetype={archetype} flash={flash} />;
  return <RaptorModel archetype={archetype} flash={flash} />;
}

export default function Dinosaur({ entity }) {
  const groupRef = useRef();
  const archetype = DINO_TYPES[entity.type];
  const flash = entity.flashTime > 0;
  const healthRatio = Math.max(0, entity.health / archetype.maxHealth);
  const showHealth = !entity.isDying && entity.health < archetype.maxHealth;

  useFrame((_, deltaTime) => {
    if (!groupRef.current) return;
    groupRef.current.position.copy(entity.position);
    groupRef.current.rotation.y = entity.heading;
    const deathProgress = entity.isDying ? Math.min(1, entity.deathAge / 1.05) : 0;
    const livingBob = entity.isDying ? 0 : Math.sin(entity.walkTime * 9) * 0.035;
    const scale = archetype.modelScale * (1 - deathProgress * 0.58);
    groupRef.current.scale.setScalar(Math.max(0.18, scale));
    groupRef.current.position.y = livingBob;
    groupRef.current.rotation.z = entity.isDying ? deathProgress * 1.35 : Math.sin(entity.walkTime * 5) * 0.025;
  });

  return (
    <group ref={groupRef}>
      <DinosaurModel entity={entity} archetype={archetype} flash={flash} />
      {showHealth && (
        <Html position={[0, archetype.healthBarHeight, 0]} center distanceFactor={12} occlude={false}>
          <div className="dino-health" aria-label={`${archetype.label} health`}>
            <div style={{ width: `${healthRatio * 100}%` }} />
          </div>
        </Html>
      )}
    </group>
  );
}