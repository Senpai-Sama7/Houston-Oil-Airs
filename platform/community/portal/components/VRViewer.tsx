// VR pollution plume viewer
import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

function PollutionPlume({ intensity = 0.5 }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.material.opacity = 0.3 + Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[2, 32, 32]} />
      <meshStandardMaterial 
        color={intensity > 0.7 ? '#ff4444' : intensity > 0.4 ? '#ffaa44' : '#44ff44'}
        transparent
        opacity={0.4}
      />
    </mesh>
  );
}

function IndustrialBuilding({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[1, 2, 1]} />
        <meshStandardMaterial color="#666666" />
      </mesh>
      <mesh position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 1]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <Text
        position={[0, -0.5, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        Industrial Site
      </Text>
    </group>
  );
}

export default function VRViewer() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">🥽 VR Pollution Experience</h2>
      <p className="text-gray-600 mb-4">
        Walk inside the pollution plume. Use mouse to rotate, scroll to zoom.
      </p>
      
      <div className="h-96 bg-black rounded-lg overflow-hidden">
        <Canvas camera={{ position: [5, 5, 5] }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          
          <PollutionPlume intensity={0.6} />
          <IndustrialBuilding position={[-3, 0, -3]} />
          <IndustrialBuilding position={[3, 0, -3]} />
          
          {/* Ground plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
            <planeGeometry args={[20, 20]} />
            <meshStandardMaterial color="#2d5a27" />
          </mesh>
          
          <Text
            position={[0, 4, 0]}
            fontSize={0.5}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            Houston EJ-AI Platform
          </Text>
          
          <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        </Canvas>
      </div>
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 p-3 rounded">
          <div className="text-red-800 font-semibold">🔴 High Pollution</div>
          <div className="text-sm text-red-600">PM2.5 > 35 µg/m³</div>
        </div>
        <div className="bg-yellow-50 p-3 rounded">
          <div className="text-yellow-800 font-semibold">🟡 Moderate</div>
          <div className="text-sm text-yellow-600">PM2.5 12-35 µg/m³</div>
        </div>
        <div className="bg-green-50 p-3 rounded">
          <div className="text-green-800 font-semibold">🟢 Good</div>
          <div className="text-sm text-green-600">PM2.5 < 12 µg/m³</div>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          🥽 Launch Full VR Experience
        </button>
      </div>
    </div>
  );
}