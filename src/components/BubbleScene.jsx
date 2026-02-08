import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';

function StaticBubble({ position, scale }) {
  return (
    <mesh position={position} scale={scale}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshPhysicalMaterial
        transmission={0.95}
        thickness={0.1}
        roughness={0}
        metalness={0.1}
        clearcoat={1}
        clearcoatRoughness={0}
        ior={1.03}
        iridescence={1}
        iridescenceIOR={2.4}
        iridescenceThicknessRange={[400, 1600]}
        transparent
        opacity={0.6}
        envMapIntensity={0}
        reflectivity={0.3}
        side={2}
      />
    </mesh>
  );
}

export default function BubbleScene() {
  const bubbles = [
    { position: [-5, 3, -1], scale: 2.2 },
    { position: [5, 2.5, -1], scale: 1.8 },
    { position: [-6, -2, -1.5], scale: 1.5 },
    { position: [6, -3, -1], scale: 2.5 },
    { position: [-3, 0, -2], scale: 1.2 },
    { position: [3, -1, -1.5], scale: 1.4 },
    { position: [-4, -4, -2], scale: 1 },
    { position: [4, 4, -1.5], scale: 0.9 },
    { position: [-7, 1, -2.5], scale: 1.8 },
    { position: [7, 0, -2], scale: 1.6 },
    { position: [0, 5, -2], scale: 1.3 },
    { position: [0, -5, -2.5], scale: 1.7 },
  ];

  return (
    <div className="fixed inset-0 z-0" style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
      >
        <color attach="background" args={['#000000']} />
        <Suspense fallback={null}>
          <ambientLight intensity={0.3} />
          <directionalLight position={[10, 10, 10]} intensity={0.8} color="#ffffff" />
          <pointLight position={[-10, 10, 8]} intensity={1} color="#a855f7" />
          <pointLight position={[10, -10, 8]} intensity={1} color="#3b82f6" />
          <pointLight position={[0, 0, 12]} intensity={0.8} color="#10b981" />
          <spotLight position={[0, 15, 5]} intensity={1} angle={0.5} penumbra={1} color="#ec4899" />
          
          {bubbles.map((bubble, i) => (
            <StaticBubble
              key={i}
              position={bubble.position}
              scale={bubble.scale}
            />
          ))}
        </Suspense>
      </Canvas> 
    </div>
  );
}