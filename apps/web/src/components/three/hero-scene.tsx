'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

const TEAL = '#0d6b62';
const MINT = '#8cd1c5';
const SOFT = '#e3f2ef';

function ResumeSheet({ position, rotation, scale, tint }: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  tint: string;
}) {
  return (
    <Float speed={1.4} rotationIntensity={0.35} floatIntensity={1.1}>
      <RoundedBox args={[1.41, 2, 0.04]} radius={0.06} smoothness={4}
        position={position} rotation={rotation} scale={scale}>
        <meshStandardMaterial color={tint} roughness={0.45} metalness={0.08} />
      </RoundedBox>
      {/* text lines on the sheet */}
      <group position={position} rotation={rotation} scale={scale}>
        {[0.55, 0.3, -0.05, -0.35].map((y, i) => (
          <mesh key={i} position={[i === 0 ? -0.25 : -0.42, y, 0.03]}>
            <planeGeometry args={[i === 0 ? 0.7 : 0.85, 0.07]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={i === 0 ? 0.85 : 0.4} />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

function Particles({ count = 350 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 18;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 10;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
    }
    return arr;
  }, [count]);

  useFrame(state => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.035} color={MINT} transparent opacity={0.55} sizeAttenuation />
    </points>
  );
}

function ParallaxRig({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  useFrame(state => {
    if (!group.current) return;
    const { x, y } = state.pointer;
    group.current.rotation.y += (x * 0.12 - group.current.rotation.y) * 0.04;
    group.current.rotation.x += (-y * 0.08 - group.current.rotation.x) * 0.04;
  });
  return <group ref={group}>{children}</group>;
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 42 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
      aria-hidden
    >
      <ambientLight intensity={0.75} />
      <directionalLight position={[4, 6, 5]} intensity={1.1} color="#ffffff" />
      <directionalLight position={[-5, -3, 2]} intensity={0.4} color={MINT} />
      <ParallaxRig>
        <ResumeSheet position={[-3.1, 0.4, 0]} rotation={[0.05, 0.45, 0.06]} scale={1.15} tint={TEAL} />
        <ResumeSheet position={[3.2, -0.3, -0.6]} rotation={[-0.06, -0.5, -0.08]} scale={1.05} tint={MINT} />
        <ResumeSheet position={[0.2, 1.9, -2.4]} rotation={[0.12, 0.15, 0.1]} scale={0.8} tint={SOFT} />
        <ResumeSheet position={[-1.4, -2.1, -1.8]} rotation={[-0.1, 0.3, -0.12]} scale={0.65} tint={SOFT} />
        <Particles />
      </ParallaxRig>
    </Canvas>
  );
}
