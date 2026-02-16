'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface KnotModelProps {
  scale?: number
  speed?: number
  color?: string
  emissiveColor?: string
  p?: number
  q?: number
}

export default function KnotModel({
  scale = 1,
  speed = 0.3,
  color = '#5B0E14',
  emissiveColor = '#F1E194',
  p = 2,
  q = 3,
}: KnotModelProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const mouseRef = useRef({ x: 0, y: 0 })

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        metalness: 0.7,
        roughness: 0.3,
        emissive: new THREE.Color(emissiveColor),
        emissiveIntensity: 0.05,
      }),
    [color, emissiveColor]
  )

  useFrame((state) => {
    if (!meshRef.current) return

    const t = state.clock.getElapsedTime()

    // Slow continuous rotation
    meshRef.current.rotation.y = t * speed * 0.5
    meshRef.current.rotation.x = Math.sin(t * speed * 0.3) * 0.1

    // Gentle floating motion
    meshRef.current.position.y = Math.sin(t * 0.8) * 0.05

    // Mouse reactivity
    const pointer = state.pointer
    mouseRef.current.x += (pointer.x * 0.3 - mouseRef.current.x) * 0.05
    mouseRef.current.y += (pointer.y * 0.3 - mouseRef.current.y) * 0.05
    meshRef.current.rotation.z = mouseRef.current.x * 0.2
    meshRef.current.rotation.x += mouseRef.current.y * 0.1
  })

  return (
    <mesh ref={meshRef} scale={scale} material={material}>
      <torusKnotGeometry args={[1, 0.35, 128, 32, p, q]} />
    </mesh>
  )
}
