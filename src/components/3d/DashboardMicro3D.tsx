import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

function FloatingIcon({ position, color, type }: any) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.position.y += Math.sin(t * 1.5) * 0.002;
    meshRef.current.rotation.y += 0.01;
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      {type === 'sphere' ? (
        <Sphere ref={meshRef} args={[0.3, 32, 32]} position={position}>
          <MeshDistortMaterial
            color={color}
            speed={4}
            distort={0.4}
            emissive={color}
            emissiveIntensity={0.5}
            metalness={1}
            roughness={0}
          />
        </Sphere>
      ) : (
        <RoundedBox ref={meshRef} args={[0.4, 0.4, 0.4]} radius={0.05} position={position}>
          <meshStandardMaterial 
            color={color} 
            emissive={color} 
            emissiveIntensity={0.5} 
            metalness={0.8} 
            roughness={0.2} 
          />
        </RoundedBox>
      )}
    </Float>
  );
}

export function DashboardMicro3D() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 opacity-40">
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#8b5cf6" />
        <pointLight position={[-5, -5, -5]} intensity={1} color="#3b82f6" />
        
        <FloatingIcon position={[-3, 2, 0]} color="#8b5cf6" type="sphere" />
        <FloatingIcon position={[3, -2, 0]} color="#3b82f6" type="box" />
        <FloatingIcon position={[2, 2, -1]} color="#d946ef" type="sphere" />
      </Canvas>
    </div>
  );
}
