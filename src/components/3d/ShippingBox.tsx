'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ShippingBoxProps {
  position?: [number, number, number]
  scale?: number
  rotationSpeed?: number
  scrollProgress?: number
}

export default function ShippingBox({
  position = [0, 0, 0],
  scale = 1,
  rotationSpeed = 0.5,
  scrollProgress = 0,
}: ShippingBoxProps) {
  const groupRef = useRef<THREE.Group>(null)
  const boxRef = useRef<THREE.Mesh>(null)

  // Materials
  const boxMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#F5EFE0'),
        metalness: 0.1,
        roughness: 0.4,
      }),
    []
  )

  const tapeMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#D4A843'),
        metalness: 0.3,
        roughness: 0.5,
        emissive: new THREE.Color('#D4A843'),
        emissiveIntensity: 0.1,
      }),
    []
  )

  useFrame((state) => {
    if (!groupRef.current || !boxRef.current) return

    const t = state.clock.getElapsedTime()

    // Continuous rotation
    groupRef.current.rotation.y = t * rotationSpeed * 0.3
    groupRef.current.rotation.x = Math.sin(t * 0.5) * 0.15

    // Floating animation
    groupRef.current.position.y = position[1] + Math.sin(t * 0.8) * 0.15

    // Scroll-driven scale pulse
    const scalePulse = 1 + Math.sin(scrollProgress * Math.PI * 2) * 0.05
    groupRef.current.scale.setScalar(scale * scalePulse)
  })

  return (
    <group ref={groupRef} position={position}>
      {/* Main Box */}
      <mesh ref={boxRef} material={boxMaterial}>
        <boxGeometry args={[1.2, 1, 1]} />
      </mesh>

      {/* Tape strips */}
      <mesh position={[0, 0, 0.51]} material={tapeMaterial}>
        <boxGeometry args={[1.3, 0.08, 0.02]} />
      </mesh>
      <mesh position={[0, 0, -0.51]} material={tapeMaterial}>
        <boxGeometry args={[1.3, 0.08, 0.02]} />
      </mesh>
      <mesh position={[0, 0.51, 0]} material={tapeMaterial} rotation={[Math.PI / 2, 0, 0]}>
        <boxGeometry args={[1.3, 0.08, 0.02]} />
      </mesh>

      {/* Label */}
      <mesh position={[0.61, 0.1, 0.2]}>
        <planeGeometry args={[0.01, 0.4, 0.3]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>

      {/* Brand logo area */}
      <mesh position={[0, 0.2, 0.51]}>
        <planeGeometry args={[0.3, 0.15]} />
        <meshStandardMaterial
          color="#5B0E14"
          emissive="#5B0E14"
          emissiveIntensity={0.2}
        />
      </mesh>
    </group>
  )
}
