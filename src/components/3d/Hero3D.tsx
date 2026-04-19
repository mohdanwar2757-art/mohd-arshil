import { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial, PerspectiveCamera, Environment, RoundedBox, useHelper } from '@react-three/drei';
import * as THREE from 'three';

function FloatingCard({ position, color, rotation, delay }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { mouse } = useThree();

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime() + delay;
    
    // Smooth floating
    meshRef.current.position.y = position[1] + Math.sin(t / 2) * 0.2;
    
    // Mouse parallax
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, rotation[0] + mouse.y * 0.2, 0.1);
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, rotation[1] + mouse.x * 0.2, 0.1);
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <RoundedBox
        ref={meshRef}
        args={[1.2, 1.8, 0.05]}
        radius={0.08}
        position={position}
        rotation={rotation}
      >
        <MeshDistortMaterial
          color={color}
          speed={3}
          distort={0.15}
          radius={1}
          emissive={color}
          emissiveIntensity={0.4}
          roughness={0.1}
          metalness={0.9}
        />
      </RoundedBox>
    </Float>
  );
}

export default function Hero3D() {
  return (
    <div className="w-full h-full relative group">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 5], fov: 45 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1.5} castShadow />
          <pointLight position={[-10, -10, -10]} intensity={1} color="#3b82f6" />
          <pointLight position={[10, 10, 10]} intensity={1} color="#8b5cf6" />
          
          <group>
            <FloatingCard 
              position={[-1.2, 0.4, 0]} 
              color="#8b5cf6" 
              rotation={[0, 0.3, 0.1]} 
              delay={0}
            />
            <FloatingCard 
              position={[1.2, -0.4, 1]} 
              color="#3b82f6" 
              rotation={[0.2, -0.3, -0.1]} 
              delay={2}
            />
          </group>
          
          <Environment preset="night" />
        </Suspense>
      </Canvas>
      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/10 blur-[120px] rounded-full pointer-events-none group-hover:bg-purple-500/20 transition-all duration-700" />
    </div>
  );
}
