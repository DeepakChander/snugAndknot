'use client'

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import ShippingBox from './ShippingBox'
import GoldParticleField from './GoldParticleField'

interface ShippingSceneProps {
  scrollProgress: number
}

export default function ShippingScene({ scrollProgress }: ShippingSceneProps) {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
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
          <ambientLight intensity={0.4} color="#FDF8EC" />
          <directionalLight position={[5, 5, 5]} intensity={0.8} color="#F1E194" />
          <pointLight position={[-3, -2, 3]} intensity={0.3} color="#5B0E14" />
          <pointLight position={[3, 2, -2]} intensity={0.2} color="#D4A843" />

          {/* 3D Shipping Boxes */}
          <ShippingBox position={[-1.5, 0, 0]} scale={0.8} rotationSpeed={0.4} scrollProgress={scrollProgress} />
          <ShippingBox position={[1.5, 0.5, -0.5]} scale={0.6} rotationSpeed={0.6} scrollProgress={scrollProgress} />
          <ShippingBox position={[0, -0.8, 0.5]} scale={0.5} rotationSpeed={0.3} scrollProgress={scrollProgress} />

          {/* Particle effects */}
          <GoldParticleField count={25} scrollProgress={scrollProgress} />
        </Suspense>
      </Canvas>
    </div>
  )
}
