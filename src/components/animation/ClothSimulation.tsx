'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import * as THREE from 'three'

function ClothMesh() {
  const meshRef = useRef<THREE.Mesh>(null)
  const timeRef = useRef(0)

  // Create cloth geometry
  const geometry = useMemo(() => {
    const width = 5
    const height = 7
    const segmentsX = 30
    const segmentsY = 40

    const geo = new THREE.PlaneGeometry(width, height, segmentsX, segmentsY)

    // Store initial positions for wave animation
    const positions = geo.attributes.position.array as Float32Array
    const initialPositions = new Float32Array(positions)
    geo.userData.initialPositions = initialPositions

    return geo
  }, [])

  // Animate cloth with wave motion
  useFrame((state) => {
    if (!meshRef.current) return

    timeRef.current += 0.01

    const positions = geometry.attributes.position.array as Float32Array
    const initialPositions = geometry.userData.initialPositions as Float32Array

    // Create flowing wave effect
    for (let i = 0; i < positions.length; i += 3) {
      const x = initialPositions[i]
      const y = initialPositions[i + 1]

      // Multiple sine waves for natural cloth movement
      const wave1 = Math.sin(x * 1.5 + timeRef.current) * 0.15
      const wave2 = Math.sin(y * 2 + timeRef.current * 0.8) * 0.1
      const wave3 = Math.sin((x + y) * 0.8 + timeRef.current * 1.2) * 0.08

      positions[i + 2] = wave1 + wave2 + wave3
    }

    geometry.attributes.position.needsUpdate = true
    geometry.computeVertexNormals()

    // Gentle rotation
    meshRef.current.rotation.y = Math.sin(timeRef.current * 0.3) * 0.1
    meshRef.current.rotation.x = Math.cos(timeRef.current * 0.2) * 0.05
  })

  return (
    <mesh ref={meshRef} geometry={geometry} position={[0, 0, 0]}>
      <meshStandardMaterial
        color="#C4795A"
        side={THREE.DoubleSide}
        roughness={0.7}
        metalness={0.1}
        emissive="#C4795A"
        emissiveIntensity={0.1}
      />
    </mesh>
  )
}

export default function ClothSimulation() {
  const reducedMotion = useReducedMotion()

  if (reducedMotion) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-terracotta/5 via-transparent to-sage/5" />
    )
  }

  return (
    <div className="absolute inset-0 opacity-20">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <directionalLight position={[-5, -5, -5]} intensity={0.3} />
        <ClothMesh />
      </Canvas>
    </div>
  )
}
