'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/* ─── Subtle gold dust motes ─────────────────────────────────
   Like tiny particles of gold thread dust floating in warm air,
   barely visible — atmospheric, not attention-grabbing.
   ──────────────────────────────────────────────────────────── */

interface ParticleData {
  position: THREE.Vector3
  speed: number
  phase: number
  scale: number
  driftRadius: number
}

interface GoldParticleFieldProps {
  count: number
  scrollProgress: number
}

export default function GoldParticleField({ count, scrollProgress }: GoldParticleFieldProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const mouseSmooth = useRef(new THREE.Vector2(0, 0))

  const particleData = useMemo<ParticleData[]>(() => {
    return Array.from({ length: count }, () => {
      // Distribute mostly around the right side where the knot is
      const biasX = 1.5 + (Math.random() - 0.3) * 6
      const biasY = (Math.random() - 0.5) * 5
      const biasZ = (Math.random() - 0.5) * 3 - 1

      return {
        position: new THREE.Vector3(biasX, biasY, biasZ),
        speed: 0.05 + Math.random() * 0.15,
        phase: Math.random() * Math.PI * 2,
        scale: 0.008 + Math.random() * 0.018,
        driftRadius: 0.1 + Math.random() * 0.3,
      }
    })
  }, [count])

  useFrame((state) => {
    if (!meshRef.current) return

    const t = state.clock.getElapsedTime()
    const pointer = state.pointer

    // Very smooth mouse tracking
    mouseSmooth.current.x += (pointer.x - mouseSmooth.current.x) * 0.01
    mouseSmooth.current.y += (pointer.y - mouseSmooth.current.y) * 0.01

    for (let i = 0; i < count; i++) {
      const p = particleData[i]

      // Gentle drift - like dust in still air
      const driftX = Math.sin(t * p.speed + p.phase) * p.driftRadius
      const driftY = Math.cos(t * p.speed * 0.6 + p.phase) * p.driftRadius * 0.8
      const driftZ = Math.sin(t * p.speed * 0.4 + p.phase * 1.3) * p.driftRadius * 0.3

      // Very subtle mouse influence
      const attractX = mouseSmooth.current.x * 0.2
      const attractY = mouseSmooth.current.y * 0.15

      // Scroll: gently rise and fade
      const scrollRise = scrollProgress * 1.5

      dummy.position.set(
        p.position.x + driftX + attractX,
        p.position.y + driftY + attractY + scrollRise,
        p.position.z + driftZ
      )

      // Gentle twinkle
      const twinkle = 0.7 + Math.sin(t * 1.5 + p.phase) * 0.3
      const scrollFade = Math.max(0, 1.0 - scrollProgress * 1.5)
      dummy.scale.setScalar(p.scale * twinkle * scrollFade)

      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }

    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshBasicMaterial
        color="#F1E194"
        transparent
        opacity={0.4}
      />
    </instancedMesh>
  )
}
