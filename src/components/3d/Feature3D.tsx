import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, RoundedBox, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function FeaturePanel({ position, title, color, icon, index, description }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    // Subtle hover animation - scale and float
    const targetScale = hovered ? 1.1 : 1;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    meshRef.current.position.y = position[1] + Math.sin(t + index) * 0.15;
  });

  return (
    <Float speed={2.5} rotationIntensity={0.1} floatIntensity={0.2}>
      <RoundedBox
        ref={meshRef}
        args={[3.2, 4.2, 0.15]}
        radius={0.15}
        position={position}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <MeshDistortMaterial
          color={hovered ? color : "#111827"}
          speed={hovered ? 4 : 2}
          distort={0.1}
          radius={1}
          emissive={color}
          emissiveIntensity={hovered ? 0.8 : 0.1}
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={0.95}
        />
        <Text
          position={[0, 1.4, 0.1]}
          fontSize={0.25}
          color="white"
          maxWidth={2.5}
          textAlign="center"
          font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGkyMZhrib2Bg-4.ttf"
        >
          {title}
        </Text>
        <Text
          position={[0, 0, 0.1]}
          fontSize={1.4}
          color="white"
        >
          {icon}
        </Text>
        <Text
           position={[0, -1.4, 0.1]}
           fontSize={0.15}
           color="#94a3b8"
           maxWidth={2.5}
           textAlign="center"
        >
          {description}
        </Text>
      </RoundedBox>
    </Float>
  );
}

export default function Feature3D() {
  return (
    <group>
      <FeaturePanel 
        position={[-4.5, 0, 0]} 
        title="AI Planner" 
        color="#8b5cf6" 
        icon="🧠" 
        index={0} 
        description="Dynamic scheduling for peak efficiency"
      />
      <FeaturePanel 
        position={[0, 0, 0]} 
        title="Rush Mode" 
        color="#3b82f6" 
        icon="⚡" 
        index={1}
        description="Panic-free revision for last-minute prep"
      />
      <FeaturePanel 
        position={[4.5, 0, 0]} 
        title="Pulse Tracker" 
        color="#d946ef" 
        icon="📊" 
        index={2} 
        description="Visual streaks and performance metrics"
      />
    </group>
  );
}
