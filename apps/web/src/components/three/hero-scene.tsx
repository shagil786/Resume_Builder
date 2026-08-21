'use client';

import { useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

const TEAL = '#0d6b62';
const SAGE = '#8cd1c5';
const MIST = '#cfe6e0';

function Sheet({ position, rotation, scale, tint, opacity }: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  tint: string;
  opacity: number;
}) {
  return (
    <Float speed={1.1} rotationIntensity={0.25} floatIntensity={0.7}>
      <RoundedBox args={[1.41, 2, 0.05]} radius={0.07} smoothness={4}
        position={position} rotation={rotation} scale={scale}>
        <meshStandardMaterial color={tint} roughness={0.55} metalness={0.05} transparent opacity={opacity} />
      </RoundedBox>
    </Float>
  );
}

function Particles({ count = 300 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 14 + 2;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 9;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6 - 3;
    }
    return arr;
  }, [count]);

  useFrame(state => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.015;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color={SAGE} transparent opacity={0.45} sizeAttenuation />
    </points>
  );
}

/** Camera drifts down and tilts as the user scrolls through the hero. */
function ScrollDrift({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      };
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useFrame(() => {
    if (!group.current) return;
    const scrollProgress = Math.min(1, window.scrollY / 800);
    const targetY = -scrollProgress * 1.2;
    const targetRotX = scrollProgress * 0.18;

    group.current.position.y += (targetY - group.current.position.y) * 0.06;
    group.current.rotation.x += (targetRotX - group.current.rotation.x) * 0.06;
    group.current.rotation.y += (pointer.current.x * 0.1 - group.current.rotation.y) * 0.04;
    group.current.rotation.z += (pointer.current.y * 0.02 - group.current.rotation.z) * 0.04;
  });

  return <group ref={group}>{children}</group>;
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 9], fov: 40 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
      aria-hidden
    >
      <fog attach="fog" args={[typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? '#0e1514' : '#f6f8f7', 9, 16]} />
      <ambientLight intensity={0.85} />
      <directionalLight position={[5, 6, 5]} intensity={1.0} color="#ffffff" />
      <directionalLight position={[-4, -2, 3]} intensity={0.35} color={SAGE} />
      <ScrollDrift>
        {/* Cluster stays in the right half of the frame; camera x-offset shifts view left */}
        <group position={[2.4, 0, 0]}>
          <Sheet position={[0.6, 0.5, -1]} rotation={[0.08, -0.35, 0.1]} scale={1.25} tint={TEAL} opacity={0.96} />
          <Sheet position={[3.1, -0.6, -2.2]} rotation={[-0.1, 0.42, -0.12]} scale={1.0} tint={SAGE} opacity={0.85} />
          <Sheet position={[-1.6, 2.1, -3.4]} rotation={[0.14, 0.22, 0.14]} scale={0.75} tint={MIST} opacity={0.7} />
          <Sheet position={[-0.8, -2.2, -3.0]} rotation={[-0.12, -0.28, -0.1]} scale={0.65} tint={MIST} opacity={0.6} />
          <Particles />
        </group>
      </ScrollDrift>
    </Canvas>
  );
}
