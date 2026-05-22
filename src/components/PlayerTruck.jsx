import { forwardRef, useImperativeHandle, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PLAYER } from '../constants/gameConstants.js';

const ORANGE = '#e76f21';
const DEEP_ORANGE = '#c95518';
const BLACK = '#151515';
const WINDOW = '#243447';

function Wheel({ position, steerRef, rollRef }) {
  return (
    <group ref={steerRef} position={position}>
      <group ref={rollRef}>
        <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.46, 0.46, 0.45, 12]} />
          <meshStandardMaterial color="#111111" roughness={0.85} flatShading />
        </mesh>
        <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.23, 0.23, 0.49, 8]} />
          <meshStandardMaterial color="#6d7377" roughness={0.65} flatShading />
        </mesh>
      </group>
    </group>
  );
}

const PlayerTruck = forwardRef(function PlayerTruck({ vehicleStateRef, turretYawRef, turretPitchRef, recoilRef }, apiRef) {
  const groupRef = useRef();
  const bodyRef = useRef();
  const turretRef = useRef();
  const barrelRef = useRef();
  const muzzleRef = useRef();
  const frontLeftSteerRef = useRef();
  const frontRightSteerRef = useRef();
  const rearLeftSteerRef = useRef();
  const rearRightSteerRef = useRef();
  const frontLeftRollRef = useRef();
  const frontRightRollRef = useRef();
  const rearLeftRollRef = useRef();
  const rearRightRollRef = useRef();

  useImperativeHandle(apiRef, () => ({
    getMuzzleWorldPosition(target = new THREE.Vector3()) {
      if (!muzzleRef.current) return target.copy(vehicleStateRef.current.position);
      return muzzleRef.current.getWorldPosition(target);
    },
    getMuzzleWorldDirection(target = new THREE.Vector3()) {
      const vehicle = vehicleStateRef.current;
      const worldYaw = vehicle.heading + turretYawRef.current;
      const pitch = turretPitchRef.current;
      const horizontal = Math.cos(pitch);
      return target.set(Math.sin(worldYaw) * horizontal, -Math.sin(pitch), Math.cos(worldYaw) * horizontal).normalize();
    },
    getTurretWorldPosition(target = new THREE.Vector3()) {
      if (!turretRef.current) return target.copy(vehicleStateRef.current.position);
      return turretRef.current.getWorldPosition(target);
    }
  }));

  useFrame((_, deltaTime) => {
    const vehicle = vehicleStateRef.current;
    if (groupRef.current) {
      groupRef.current.position.copy(vehicle.position);
      groupRef.current.rotation.y = vehicle.heading;
    }
    if (bodyRef.current) {
      bodyRef.current.rotation.x = THREE.MathUtils.damp(bodyRef.current.rotation.x, vehicle.bodyPitch ?? 0, 12, deltaTime);
      bodyRef.current.rotation.z = THREE.MathUtils.damp(bodyRef.current.rotation.z, vehicle.bodyRoll ?? 0, 12, deltaTime);
    }
    if (turretRef.current) {
      turretRef.current.rotation.y = turretYawRef.current;
    }
    if (barrelRef.current) {
      barrelRef.current.rotation.x = turretPitchRef.current;
      barrelRef.current.position.z = 0.52 - recoilRef.current * 0.28;
    }
    const frontWheelYaw = (vehicle.steering ?? 0) * PLAYER.MAX_WHEEL_STEER;
    for (const steerRef of [frontLeftSteerRef, frontRightSteerRef]) {
      if (steerRef.current) {
        steerRef.current.rotation.y = THREE.MathUtils.damp(steerRef.current.rotation.y, frontWheelYaw, 18, deltaTime);
      }
    }
    for (const steerRef of [rearLeftSteerRef, rearRightSteerRef]) {
      if (steerRef.current) {
        steerRef.current.rotation.y = THREE.MathUtils.damp(steerRef.current.rotation.y, 0, 18, deltaTime);
      }
    }
    for (const rollRef of [frontLeftRollRef, frontRightRollRef, rearLeftRollRef, rearRightRollRef]) {
      if (rollRef.current) {
        rollRef.current.rotation.x += vehicle.speed * deltaTime * 2.55;
      }
    }
  });

  return (
    <group ref={groupRef} castShadow>
      <group ref={bodyRef}>
      <mesh castShadow receiveShadow position={[0, 0.72, 0]}>
        <boxGeometry args={[2.55, 0.72, 4.25]} />
        <meshStandardMaterial color={ORANGE} roughness={0.72} flatShading />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 1.27, 0.66]}>
        <boxGeometry args={[2.08, 1.05, 1.62]} />
        <meshStandardMaterial color={DEEP_ORANGE} roughness={0.7} flatShading />
      </mesh>
      <mesh castShadow position={[0, 1.43, 1.52]}>
        <boxGeometry args={[1.72, 0.54, 0.12]} />
        <meshStandardMaterial color={WINDOW} roughness={0.5} flatShading />
      </mesh>
      <mesh castShadow position={[-1.08, 1.37, 0.72]}>
        <boxGeometry args={[0.14, 0.52, 0.92]} />
        <meshStandardMaterial color={WINDOW} roughness={0.5} flatShading />
      </mesh>
      <mesh castShadow position={[1.08, 1.37, 0.72]}>
        <boxGeometry args={[0.14, 0.52, 0.92]} />
        <meshStandardMaterial color={WINDOW} roughness={0.5} flatShading />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 1.08, -1.05]}>
        <boxGeometry args={[2.18, 0.35, 1.55]} />
        <meshStandardMaterial color="#b64617" roughness={0.8} flatShading />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 1.33, -1.84]}>
        <boxGeometry args={[2.28, 0.48, 0.18]} />
        <meshStandardMaterial color={ORANGE} roughness={0.75} flatShading />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.48, 2.27]}>
        <boxGeometry args={[2.3, 0.5, 0.24]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.75} flatShading />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.52, -2.28]}>
        <boxGeometry args={[2.15, 0.45, 0.22]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.75} flatShading />
      </mesh>

      <Wheel position={[-1.36, 0.45, 1.36]} steerRef={frontLeftSteerRef} rollRef={frontLeftRollRef} />
      <Wheel position={[1.36, 0.45, 1.36]} steerRef={frontRightSteerRef} rollRef={frontRightRollRef} />
      <Wheel position={[-1.36, 0.45, -1.36]} steerRef={rearLeftSteerRef} rollRef={rearLeftRollRef} />
      <Wheel position={[1.36, 0.45, -1.36]} steerRef={rearRightSteerRef} rollRef={rearRightRollRef} />

      <group ref={turretRef} position={[0, 2.0, 0.28]}>
        <mesh castShadow position={[0, -0.08, 0]}>
          <cylinderGeometry args={[0.48, 0.58, 0.22, 12]} />
          <meshStandardMaterial color={BLACK} roughness={0.65} flatShading />
        </mesh>
        <mesh castShadow position={[0, 0.1, 0]}>
          <sphereGeometry args={[0.36, 12, 8]} />
          <meshStandardMaterial color="#202020" roughness={0.55} flatShading />
        </mesh>
        <group ref={barrelRef} position={[0, 0.12, 0.52]}>
          <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.105, 0.13, 1.62, 10]} />
            <meshStandardMaterial color="#111111" metalness={0.15} roughness={0.52} flatShading />
          </mesh>
          <mesh castShadow position={[0, 0, 0.86]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.16, 0.12, 0.22, 10]} />
            <meshStandardMaterial color="#050505" metalness={0.18} roughness={0.5} flatShading />
          </mesh>
          <group ref={muzzleRef} position={[0, 0, 0.99]} />
        </group>
      </group>
      </group>
    </group>
  );
});

export default PlayerTruck;