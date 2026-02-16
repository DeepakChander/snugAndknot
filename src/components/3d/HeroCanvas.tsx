'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import HeroCloth from './HeroCloth'
import FabricThreads from './FabricThreads'
import GoldParticleField from './GoldParticleField'

interface HeroCanvasProps {
  scrollProgress: number
  isReady: boolean
}

export default function HeroCanvas({ scrollProgress, isReady }: HeroCanvasProps) {
  const [canRender, setCanRender] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
      if (gl) setCanRender(true)
    } catch {
      setCanRender(false)
    }
    setIsMobile(window.innerWidth < 768)
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleCreated = useCallback(() => {}, [])

  if (!canRender) return null

  return (
    <div
      className="absolute inset-0 z-[1]"
      style={{
        opacity: isReady ? 1 : 0,
        transition: 'opacity 2s ease-out',
        pointerEvents: 'none',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 9], fov: 45 }}
        dpr={[1, isMobile ? 1 : 1.5]}
        gl={{
          antialias: !isMobile,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        style={{ background: 'transparent' }}
        onCreated={handleCreated}
      >
        <Suspense fallback={null}>
          {/* Lighting tuned for draped fabric */}
          <ambientLight intensity={0.3} color="#FDF8EC" />
          <directionalLight position={[4, 6, 5]} intensity={0.85} color="#F1E194" />
          <pointLight position={[-3, -2, 4]} intensity={0.25} color="#5B0E14" />
          {/* Rim light from below to catch bottom fold */}
          <pointLight position={[0, -3, 2]} intensity={0.15} color="#F1E194" />

          {/* Draped fabric cloth */}
          <HeroCloth scrollProgress={scrollProgress} isMobile={isMobile} />

          {/* Loose threads emerging from cloth edges */}
          {!isMobile && (
            <FabricThreads scrollProgress={scrollProgress} count={3} />
          )}

          {/* Subtle gold dust */}
          <GoldParticleField
            count={isMobile ? 15 : 35}
            scrollProgress={scrollProgress}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
