import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, PerspectiveCamera, Environment, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

function StudyCard({ position, color, rotation, delay }: { position: [number, number, number], color: string, rotation: [number, number, number], delay: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime() + delay;
    meshRef.current.rotation.x = rotation[0] + Math.cos(t / 4) / 8;
    meshRef.current.rotation.y = rotation[1] + Math.sin(t / 4) / 8;
    meshRef.current.position.y = position[1] + Math.sin(t / 2) / 10;
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <RoundedBox
        ref={meshRef}
        args={[1.2, 1.8, 0.05]} // Width, height, depth
        radius={0.1} // Corner radius
        smoothness={4}
        position={position}
        rotation={rotation}
      >
        <MeshDistortMaterial
          color={color}
          speed={2}
          distort={0.1}
          radius={1}
          emissive={color}
          emissiveIntensity={0.2}
          roughness={0.2}
          metalness={0.8}
        />
      </RoundedBox>
    </Float>
  );
}

function FloatingParticles({ count = 20 }) {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 10;
      p[i * 3 + 1] = (Math.random() - 0.5) * 10;
      p[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return p;
  }, [count]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={points}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#8b5cf6" transparent opacity={0.4} />
    </points>
  );
}

export function Hero3D() {
  return (
    <div className="w-full h-[500px] md:h-[600px] relative">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
        
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#8b5cf6" />

        <group>
          <StudyCard 
            position={[-1.5, 0.5, 0]} 
            color="#8b5cf6" 
            rotation={[0, 0.2, 0.1]} 
            delay={0}
          />
          <StudyCard 
            position={[1, -0.5, 1]} 
            color="#3b82f6" 
            rotation={[0.1, -0.2, -0.1]} 
            delay={2}
          />
          <StudyCard 
            position={[0.5, 1.2, -1]} 
            color="#d946ef" 
            rotation={[-0.2, 0.1, 0.2]} 
            delay={4}
          />
        </group>

        <FloatingParticles count={40} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
