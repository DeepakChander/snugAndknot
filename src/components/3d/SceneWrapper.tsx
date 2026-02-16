'use client'

import { Suspense, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

interface SceneWrapperProps {
  children: React.ReactNode
  className?: string
  fallback?: React.ReactNode
  camera?: { position?: [number, number, number]; fov?: number }
  style?: React.CSSProperties
}

export default function SceneWrapper({
  children,
  className = '',
  fallback,
  camera = { position: [0, 0, 5], fov: 45 },
  style,
}: SceneWrapperProps) {
  const prefersReducedMotion = useReducedMotion()
  const [canRender, setCanRender] = useState(false)

  useEffect(() => {
    // Check WebGL support and device capability
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
      if (gl) {
        setCanRender(true)
      }
    } catch {
      setCanRender(false)
    }
  }, [])

  if (prefersReducedMotion || !canRender) {
    return (
      <div className={className} style={style}>
        {fallback || (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-burgundy to-gold opacity-20" />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={className} style={style}>
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
          </div>
        }
      >
        <Canvas
          camera={{ position: camera.position, fov: camera.fov }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={0.4} color="#FDF8EC" />
          <directionalLight position={[5, 5, 5]} intensity={0.8} color="#F1E194" />
          <pointLight position={[-5, -2, 3]} intensity={0.6} color="#5B0E14" />
          {children}
        </Canvas>
      </Suspense>
    </div>
  )
}
