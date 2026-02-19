'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface FabricSphereProps {
  position?: [number, number, number]
  color?: string
  materialType?: 'cotton' | 'wool' | 'linen' | 'blend'
  scrollProgress?: number
  index?: number
}

const MATERIAL_CONFIGS = {
  cotton: {
    color: '#F5EFE0',
    roughness: 0.7,
    metalness: 0.1,
    emissive: '#D4A843',
    emissiveIntensity: 0.05,
  },
  wool: {
    color: '#5B0E14',
    roughness: 0.9,
    metalness: 0.05,
    emissive: '#7A1B22',
    emissiveIntensity: 0.1,
  },
  linen: {
    color: '#E8DCC8',
    roughness: 0.8,
    metalness: 0.15,
    emissive: '#F1E194',
    emissiveIntensity: 0.08,
  },
  blend: {
    color: '#BFA88E',
    roughness: 0.6,
    metalness: 0.2,
    emissive: '#D4A843',
    emissiveIntensity: 0.12,
  },
}

export default function FabricSphere({
  position = [0, 0, 0],
  color,
  materialType = 'cotton',
  scrollProgress = 0,
  index = 0,
}: FabricSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const config = MATERIAL_CONFIGS[materialType]

  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(color || config.color),
      roughness: config.roughness,
      metalness: config.metalness,
      emissive: new THREE.Color(config.emissive),
      emissiveIntensity: config.emissiveIntensity,
    })
  }, [color, config])

  useFrame((state) => {
    if (!meshRef.current) return

    const t = state.clock.getElapsedTime()
    const offset = index * 0.5

    // Rotation based on material type
    if (materialType === 'cotton') {
      meshRef.current.rotation.y = t * 0.3 + offset
      meshRef.current.rotation.x = Math.sin(t * 0.5 + offset) * 0.2
    } else if (materialType === 'wool') {
      meshRef.current.rotation.x = t * 0.4 + offset
      meshRef.current.rotation.z = Math.cos(t * 0.3 + offset) * 0.15
    } else if (materialType === 'linen') {
      meshRef.current.rotation.y = -t * 0.25 + offset
      meshRef.current.rotation.z = Math.sin(t * 0.6 + offset) * 0.1
    } else {
      meshRef.current.rotation.x = t * 0.35 + offset
      meshRef.current.rotation.y = t * 0.35 + offset
    }

    // Floating motion
    meshRef.current.position.y = position[1] + Math.sin(t * 0.7 + offset) * 0.1

    // Scroll-driven scale
    const scrollScale = 1 + Math.sin((scrollProgress + index * 0.2) * Math.PI) * 0.15
    meshRef.current.scale.setScalar(scrollScale)

    // Mouse interaction
    const pointer = state.pointer
    meshRef.current.position.x = position[0] + pointer.x * 0.1
    meshRef.current.position.z = position[2] + pointer.y * 0.1
  })

  return (
    <mesh ref={meshRef} position={position} material={material}>
      <sphereGeometry args={[0.5, 64, 64]} />
    </mesh>
  )
}
