import { Html, Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

function Tracer({ effect }) {
  const lineRef = useRef();

  useFrame(({ clock }) => {
    if (!lineRef.current?.material) return;
    const progress = Math.min(1, (clock.elapsedTime - effect.createdAt) / effect.duration);
    lineRef.current.material.opacity = 1 - progress;
  });

  return (
    <Line
      ref={lineRef}
      points={[effect.start, effect.end]}
      color="#ffd45a"
      lineWidth={4}
      transparent
      opacity={0.95}
    />
  );
}

function MuzzleFlash({ effect }) {
  const groupRef = useRef();

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const progress = Math.min(1, (clock.elapsedTime - effect.createdAt) / effect.duration);
    const scale = 1 - progress * 0.75;
    groupRef.current.scale.setScalar(scale);
  });

  return (
    <group ref={groupRef} position={effect.position}>
      <mesh castShadow>
        <sphereGeometry args={[0.34, 9, 7]} />
        <meshBasicMaterial color="#ff741f" transparent opacity={0.86} />
      </mesh>
      <mesh position={effect.direction.clone().multiplyScalar(0.28)}>
        <sphereGeometry args={[0.18, 8, 6]} />
        <meshBasicMaterial color="#ffe26b" transparent opacity={0.75} />
      </mesh>
    </group>
  );
}

function ImpactParticles({ effect }) {
  const groupRef = useRef();
  const particles = useMemo(() => effect.particles, [effect.particles]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const progress = Math.min(1, (clock.elapsedTime - effect.createdAt) / effect.duration);
    groupRef.current.children.forEach((child, index) => {
      const particle = particles[index];
      child.position.copy(particle.velocity).multiplyScalar(progress).add(particle.offset);
      child.scale.setScalar((1 - progress) * particle.size);
      if (child.material) child.material.opacity = 1 - progress;
    });
  });

  return (
    <group ref={groupRef} position={effect.position}>
      {particles.map((particle, index) => (
        <mesh key={`particle-${index}`} position={particle.offset} scale={particle.size}>
          <sphereGeometry args={[1, 6, 5]} />
          <meshBasicMaterial color={particle.color} transparent opacity={0.95} />
        </mesh>
      ))}
    </group>
  );
}

function DamageNumber({ effect }) {
  const groupRef = useRef();
  const labelRef = useRef();
  const basePosition = useMemo(() => effect.position.clone(), [effect.position]);

  useFrame(({ clock }) => {
    if (!groupRef.current || !labelRef.current) return;
    const progress = Math.min(1, (clock.elapsedTime - effect.createdAt) / effect.duration);
    groupRef.current.position.copy(basePosition).add(new THREE.Vector3(0, progress * 1.8, 0));
    labelRef.current.style.opacity = `${1 - progress}`;
    labelRef.current.style.transform = `translate(-50%, -50%) scale(${1 + progress * 0.25})`;
  });

  return (
    <group ref={groupRef} position={basePosition}>
      <Html center distanceFactor={10} occlude={false}>
        <div ref={labelRef} className={effect.headshot ? 'damage-number damage-number--headshot' : 'damage-number'}>
          {effect.text}
        </div>
      </Html>
    </group>
  );
}

export default function Effects({ effects }) {
  return effects.map((effect) => {
    if (effect.type === 'tracer') return <Tracer key={effect.id} effect={effect} />;
    if (effect.type === 'muzzle') return <MuzzleFlash key={effect.id} effect={effect} />;
    if (effect.type === 'impact') return <ImpactParticles key={effect.id} effect={effect} />;
    if (effect.type === 'damage') return <DamageNumber key={effect.id} effect={effect} />;
    return null;
  });
}