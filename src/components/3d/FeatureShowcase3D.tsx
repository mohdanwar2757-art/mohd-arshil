import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, RoundedBox, Float } from '@react-three/drei';
import * as THREE from 'three';

function FeaturePanel({ position, title, color, icon, index }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.position.y = position[1] + Math.sin(t + index) * 0.1;
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
      <RoundedBox
        ref={meshRef}
        args={[3, 4, 0.2]}
        radius={0.1}
        position={position}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={hovered ? color : "#1e293b"}
          emissive={color}
          emissiveIntensity={hovered ? 0.5 : 0.05}
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={0.9}
        />
        <Text
          position={[0, 1.2, 0.15]}
          fontSize={0.3}
          color="white"
          font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGkyMZhrib2Bg-4.ttf"
        >
          {title}
        </Text>
        <Text
          position={[0, 0, 0.15]}
          fontSize={1.2}
          color="white"
        >
          {icon}
        </Text>
      </RoundedBox>
    </Float>
  );
}

export function FeatureShowcase3D() {
  return (
    <group>
      <FeaturePanel 
        position={[-4, 0, 0]} 
        title="AI Planner" 
        color="#8b5cf6" 
        icon="🧠" 
        index={0} 
      />
      <FeaturePanel 
        position={[0, 0, 0]} 
        title="Last Night Mode" 
        color="#3b82f6" 
        icon="🔥" 
        index={1} 
      />
      <FeaturePanel 
        position={[4, 0, 0]} 
        title="Stats Tracker" 
        color="#d946ef" 
        icon="📈" 
        index={2} 
      />
    </group>
  );
}
