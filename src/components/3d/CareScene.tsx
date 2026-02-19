'use client'

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import FabricSphere from './FabricSphere'
import GoldParticleField from './GoldParticleField'

interface CareSceneProps {
  scrollProgress: number
  activeMaterial?: number
}

export default function CareScene({ scrollProgress, activeMaterial = 0 }: CareSceneProps) {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 4], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.5} color="#FDF8EC" />
          <directionalLight position={[5, 5, 5]} intensity={0.9} color="#F1E194" />
          <pointLight position={[-3, 2, 3]} intensity={0.4} color="#5B0E14" />
          <spotLight position={[0, 5, 0]} intensity={0.3} color="#D4A843" angle={0.5} />

          {/* 3D Fabric Spheres */}
          <FabricSphere
            position={[-1.2, 0.3, 0]}
            materialType="cotton"
            scrollProgress={scrollProgress}
            index={0}
          />
          <FabricSphere
            position={[1.2, -0.2, -0.5]}
            materialType="wool"
            scrollProgress={scrollProgress}
            index={1}
          />
          <FabricSphere
            position={[0, 0.8, 0.3]}
            materialType="linen"
            scrollProgress={scrollProgress}
            index={2}
          />
          <FabricSphere
            position={[0, -0.8, -0.3]}
            materialType="blend"
            scrollProgress={scrollProgress}
            index={3}
          />

          {/* Subtle particle effects */}
          <GoldParticleField count={20} scrollProgress={scrollProgress} />
        </Suspense>
      </Canvas>
    </div>
  )
}
