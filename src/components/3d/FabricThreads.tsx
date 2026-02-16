'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/* ─── Fabric Threads ─────────────────────────────────────────
   Loose threads emerging from cloth edges. Uses Line geometry
   instead of TubeGeometry — trivially cheap to update per frame.
   Fixes the per-frame geometry.dispose() bug from FloatingThreads.
   ──────────────────────────────────────────────────────────── */

interface ThreadData {
  basePoints: THREE.Vector3[]
  speed: number
  phase: number
  amplitude: number
}

const POINT_COUNT = 20

function createThread(index: number, total: number): ThreadData {
  const t = index / (total - 1)
  // Threads emerge from different edges of the cloth (right side, x ≈ 2.8)
  const startX = 2.8 + (Math.random() - 0.5) * 1.5
  const startY = -1.5 + t * 3.0
  const startZ = -0.5 + Math.random() * 0.5

  const points: THREE.Vector3[] = []
  for (let i = 0; i < POINT_COUNT; i++) {
    const progress = i / (POINT_COUNT - 1)
    points.push(
      new THREE.Vector3(
        startX + progress * (1.5 + Math.random()),
        startY + Math.sin(progress * Math.PI) * 0.3,
        startZ + progress * 0.5
      )
    )
  }

  return {
    basePoints: points,
    speed: 0.3 + Math.random() * 0.4,
    phase: Math.random() * Math.PI * 2,
    amplitude: 0.05 + Math.random() * 0.1,
  }
}

interface FabricThreadsProps {
  scrollProgress: number
  count?: number
}

export default function FabricThreads({ scrollProgress, count = 3 }: FabricThreadsProps) {
  const threads = useMemo(() =>
    Array.from({ length: count }, (_, i) => createThread(i, count)),
    [count]
  )

  return (
    <group>
      {threads.map((data, i) => (
        <SingleThread key={i} data={data} scrollProgress={scrollProgress} index={i} />
      ))}
    </group>
  )
}

function SingleThread({ data, scrollProgress, index }: {
  data: ThreadData
  scrollProgress: number
  index: number
}) {
  const lineRef = useRef<THREE.Line>(null)

  // Pre-allocate geometry + material once — never dispose, just update positions
  const { lineObj, positions } = useMemo(() => {
    const geom = new THREE.BufferGeometry()
    const posArray = new Float32Array(POINT_COUNT * 3)

    data.basePoints.forEach((p, i) => {
      posArray[i * 3] = p.x
      posArray[i * 3 + 1] = p.y
      posArray[i * 3 + 2] = p.z
    })

    geom.setAttribute('position', new THREE.BufferAttribute(posArray, 3))

    const mat = new THREE.LineBasicMaterial({
      color: '#D4A843',
      transparent: true,
      opacity: 0.2 + index * 0.05,
    })

    const line = new THREE.Line(geom, mat)
    return { lineObj: line, positions: posArray }
  }, [data.basePoints, index])

  useFrame((state) => {
    if (!lineRef.current) return

    const t = state.clock.getElapsedTime()
    const attr = lineRef.current.geometry.attributes.position as THREE.BufferAttribute

    for (let i = 0; i < POINT_COUNT; i++) {
      const progress = i / (POINT_COUNT - 1)
      const base = data.basePoints[i]

      // Sway decreases toward the cloth attachment point
      const sway = progress * data.amplitude
      const x = base.x + Math.sin(t * data.speed + data.phase + i * 0.3) * sway
      const y = base.y + Math.cos(t * data.speed * 0.7 + data.phase + i * 0.2) * sway * 0.5
      const z = base.z + Math.sin(t * data.speed * 0.5 + i * 0.4) * sway * 0.3

      // Scroll: threads tighten toward cloth
      const scrollPull = scrollProgress * progress * 0.5

      positions[i * 3] = x - scrollPull
      positions[i * 3 + 1] = y + scrollProgress * 0.3
      positions[i * 3 + 2] = z
    }

    attr.needsUpdate = true
  })

  return <primitive ref={lineRef} object={lineObj} />
}
