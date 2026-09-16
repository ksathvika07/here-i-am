"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type CrystalData = {
  position: [number, number, number];
  scale: number;
  rotation: [number, number, number];
  speed: number;
  drift: number;
  phase: number;
};

function MemoryOrb() {
  const orb = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!orb.current) return;

    orb.current.rotation.y += 0.002;

    orb.current.rotation.x = THREE.MathUtils.lerp(
      orb.current.rotation.x,
      state.pointer.y * 0.18,
      0.04
    );

    orb.current.rotation.z = THREE.MathUtils.lerp(
      orb.current.rotation.z,
      -state.pointer.x * 0.18,
      0.04
    );
  });

  return (
    <mesh ref={orb}>
      <sphereGeometry args={[1.25, 64, 64]} />

      <meshPhysicalMaterial
        color="#BFCBD3"
        transparent
        opacity={0.52}
        roughness={0.08}
        metalness={0.05}
        transmission={0.65}
        thickness={1}
        clearcoat={1}
        clearcoatRoughness={0.08}
      />
    </mesh>
  );
}

function Crystal({ crystal }: { crystal: CrystalData }) {
  const crystalRef = useRef<THREE.Mesh>(null);

  const startPosition = useMemo(
    () => new THREE.Vector3(...crystal.position),
    [crystal.position]
  );

  useFrame((state) => {
    if (!crystalRef.current) return;

    const time = state.clock.elapsedTime;

    const x =
      startPosition.x +
      Math.sin(time * crystal.speed + crystal.phase) *
        crystal.drift;

    const y =
      startPosition.y +
      Math.cos(time * crystal.speed * 0.8 + crystal.phase) *
        crystal.drift;

    const z =
      startPosition.z +
      Math.sin(time * crystal.speed * 0.6 + crystal.phase) *
        crystal.drift *
        0.7;

    crystalRef.current.position.x = x;
    crystalRef.current.position.y = y;
    crystalRef.current.position.z = z;

    crystalRef.current.rotation.x += 0.004 * crystal.speed;
    crystalRef.current.rotation.y += 0.006 * crystal.speed;
    crystalRef.current.rotation.z += 0.003 * crystal.speed;
  });

  return (
    <mesh
      ref={crystalRef}
      position={crystal.position}
      rotation={crystal.rotation}
      scale={crystal.scale}
    >
      <octahedronGeometry args={[0.38, 1]} />

      <meshPhysicalMaterial
        color="#889FAB"
        transparent
        opacity={0.68}
        roughness={0.1}
        metalness={0.08}
        transmission={0.5}
        thickness={0.35}
        clearcoat={1}
        clearcoatRoughness={0.08}
      />
    </mesh>
  );
}

function FloatingCrystals() {
  const crystals = useMemo<CrystalData[]>(() => {
    const positions: [number, number, number][] = [
      [-1.9, 1.05, 0.2],
      [-1.55, 0.35, 0.8],
      [-1.85, -0.35, -0.3],
      [-1.55, -1.05, 0.4],
      [-0.95, 1.55, -0.4],
      [-0.35, 1.75, 0.3],
      [0.35, 1.65, -0.5],
      [1.0, 1.45, 0.3],
      [1.65, 1.0, -0.2],
      [1.9, 0.35, 0.5],
      [1.75, -0.35, -0.4],
      [1.55, -1.05, 0.3],
      [0.9, -1.45, -0.5],
      [0.25, -1.7, 0.2],
      [-0.45, -1.6, -0.3],
      [-1.0, -1.4, 0.5],
      [-2.15, 0.05, -0.8],
      [2.15, 0.05, -0.7],
      [-1.25, 0.9, -0.9],
      [1.25, 0.85, -0.8],
      [-1.15, -0.75, -0.8],
      [1.15, -0.8, -0.9],
      [0.0, 2.0, -0.8],
      [0.0, -2.0, -0.6],
      [2.25, 0.85, 0.1],
    ];

    return positions.map((position, index) => ({
      position,
      scale: 0.055 + (index % 4) * 0.018,
      rotation: [
        index * 0.7,
        index * 0.45,
        index * 0.3,
      ] as [number, number, number],
      speed: 0.35 + (index % 5) * 0.08,
      drift: 0.08 + (index % 4) * 0.025,
      phase: index * 1.7,
    }));
  }, []);

  return (
    <>
      {crystals.map((crystal, index) => (
        <Crystal key={index} crystal={crystal} />
      ))}
    </>
  );
}

function OrbitalRing({
  rotation,
  scale,
}: {
  rotation: [number, number, number];
  scale: number;
}) {
  return (
    <mesh rotation={rotation} scale={scale}>
      <torusGeometry args={[1.75, 0.012, 16, 100]} />

      <meshBasicMaterial
        color="#889FAB"
        transparent
        opacity={0.45}
      />
    </mesh>
  );
}

function Scene() {
  const sceneGroup = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!sceneGroup.current) return;

    sceneGroup.current.rotation.y = THREE.MathUtils.lerp(
      sceneGroup.current.rotation.y,
      state.pointer.x * 0.12,
      0.035
    );

    sceneGroup.current.rotation.x = THREE.MathUtils.lerp(
      sceneGroup.current.rotation.x,
      -state.pointer.y * 0.08,
      0.035
    );
  });

  return (
    <>
      <ambientLight intensity={1.6} />

      <directionalLight
        position={[4, 5, 5]}
        intensity={2.5}
      />

      <pointLight
        position={[-3, 2, 4]}
        intensity={2.5}
        color="#BFCBD3"
      />

      <pointLight
        position={[3, -2, 2]}
        intensity={1.5}
        color="#D9D3D5"
      />

      <group ref={sceneGroup}>
        <MemoryOrb />

        <OrbitalRing
          rotation={[Math.PI / 2.4, 0.2, 0]}
          scale={1}
        />

        <OrbitalRing
          rotation={[Math.PI / 3, Math.PI / 5, 0]}
          scale={0.85}
        />

        <OrbitalRing
          rotation={[Math.PI / 2, Math.PI / 4, 0]}
          scale={0.7}
        />

        <FloatingCrystals />
      </group>

      <Sparkles
        count={90}
        scale={[6, 4, 4]}
        size={2}
        speed={0.25}
        opacity={0.5}
        color="#BFCBD3"
      />
    </>
  );
}

export default function HeroScene() {
  return (
    <div className="h-[480px] w-full">
      <Canvas
        camera={{
          position: [0, 0, 5.2],
          fov: 45,
        }}
        dpr={[1, 2]}
      >
        <Scene />
      </Canvas>
    </div>
  );
}