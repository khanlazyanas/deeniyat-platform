"use client";

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, ContactShadows, PresentationControls } from '@react-three/drei';
import * as THREE from 'three';

// Crystal Mesh Component
function Crystal({ progress }: { progress: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Progress ke hisaab se color decide karna (0% = Red/Orange, 50% = Yellow, 100% = Emerald/Green)
  const crystalColor = progress < 50 ? "#f59e0b" : progress < 100 ? "#3b82f6" : "#10b981";
  const emissiveIntensity = 0.5 + (progress / 100); // Progress badhne par glow badhega

  useFrame((state) => {
    if (meshRef.current) {
      // Halki si continuous rotation
      meshRef.current.rotation.y += 0.005;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      {/* Octahedron Geometry for a Crystal look */}
      <octahedronGeometry args={[1.5, 0]} />
      
      {/* Premium Glass/Glowing Material */}
      <meshPhysicalMaterial 
        color={crystalColor}
        emissive={crystalColor}
        emissiveIntensity={emissiveIntensity}
        roughness={0.1}
        metalness={0.8}
        transmission={0.9} // Glass effect
        thickness={0.5}
        clearcoat={1}
        clearcoatRoughness={0.1}
        wireframe={progress === 0} // Agar 0 progress hai toh sirf wireframe dikhega
      />
    </mesh>
  );
}

// Main Wrapper Component
export default function ProgressCrystal({ progress = 0 }: { progress?: number }) {
  return (
    <div className="w-full h-full min-h-[300px] relative cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Environment preset="city" /> {/* Realistic reflections */}
        
        <PresentationControls 
          global 
          rotation={[0.13, 0.1, 0]} 
          polar={[-0.4, 0.2]} 
          azimuth={[-1, 0.75]} 
          // 👇 MAIN FIX: Yahan se 'config' wali line hata di hai, default settings automatically apply hongi
          snap={true} 
        >
          <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
            <Crystal progress={progress} />
          </Float>
        </PresentationControls>

        {/* Niche floor par shadow */}
        <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={10} blur={2} far={4} color="#000000" />
      </Canvas>
    </div>
  );
}