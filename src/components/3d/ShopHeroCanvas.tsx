'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import HeroCloth from './HeroCloth'
import FabricThreads from './FabricThreads'
import GoldParticleField from './GoldParticleField'

interface ShopHeroCanvasProps {
  scrollProgress: number
  isReady: boolean
}

export default function ShopHeroCanvas({ scrollProgress, isReady }: ShopHeroCanvasProps) {
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
          {/* Lighting tuned for shop hero */}
          <ambientLight intensity={0.35} color="#FDF8EC" />
          <directionalLight position={[4, 6, 5]} intensity={0.9} color="#F1E194" />
          <pointLight position={[-3, -2, 4]} intensity={0.3} color="#5B0E14" />
          <pointLight position={[0, -3, 2]} intensity={0.2} color="#F1E194" />

          {/* Draped fabric cloth - adapted for shop context */}
          <HeroCloth scrollProgress={scrollProgress} isMobile={isMobile} />

          {/* Fabric threads emerging from cloth */}
          {!isMobile && (
            <FabricThreads scrollProgress={scrollProgress} count={4} />
          )}

          {/* Gold particles - slightly more prominent for shop */}
          <GoldParticleField
            count={isMobile ? 20 : 50}
            scrollProgress={scrollProgress}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
