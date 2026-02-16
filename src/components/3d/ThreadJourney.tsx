'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/* ─────────────────────────────────────────
   ThreadJourney
   A 3D order tracking visualization with
   4 spheres (milestones) and a connecting
   tube that fills with gold to the current step.
   ───────────────────────────────────────── */

interface ThreadJourneyProps {
  /** Current milestone index: 0 = Placed, 1 = Confirmed, 2 = Shipped, 3 = Delivered */
  currentStep: number
}

// Colors
const GOLD = new THREE.Color('#F1E194')
const BURGUNDY = new THREE.Color('#5B0E14')
const GOLD_EMISSIVE = new THREE.Color('#D4A843')

// Node positions along X axis, centered
const NODE_POSITIONS: [number, number, number][] = [
  [-3, 0, 0],
  [-1, 0, 0],
  [1, 0, 0],
  [3, 0, 0],
]

export default function ThreadJourney({ currentStep }: ThreadJourneyProps) {
  return (
    <group>
      {/* Background connecting line (full, muted) */}
      <BackgroundLine />

      {/* Progress line (fills to current step) */}
      <ProgressLine currentStep={currentStep} />

      {/* Milestone nodes */}
      {NODE_POSITIONS.map((pos, i) => (
        <MilestoneNode
          key={i}
          position={pos}
          index={i}
          isCompleted={i <= currentStep}
          isCurrent={i === currentStep}
        />
      ))}
    </group>
  )
}

/* ═══════════════════════════════════════════
   Background Line
   A thin cylinder spanning all 4 nodes
   ═══════════════════════════════════════════ */
function BackgroundLine() {
  const length = 6 // from -3 to +3

  return (
    <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.03, 0.03, length, 8]} />
      <meshStandardMaterial
        color="#BFA88E"
        opacity={0.35}
        transparent
      />
    </mesh>
  )
}

/* ═══════════════════════════════════════════
   Progress Line
   Animates its length from first node to
   the current step node, rendered in gold
   ═══════════════════════════════════════════ */
function ProgressLine({ currentStep }: { currentStep: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const targetLength = useRef(0)
  const currentLength = useRef(0)

  // Calculate target length based on currentStep
  // Nodes: -3, -1, 1, 3 => distances: 0, 2, 4, 6
  useMemo(() => {
    const startX = NODE_POSITIONS[0][0]
    const endX = NODE_POSITIONS[Math.min(currentStep, 3)][0]
    targetLength.current = endX - startX
  }, [currentStep])

  useFrame((_, delta) => {
    if (!meshRef.current) return

    // Smoothly interpolate toward target
    currentLength.current = THREE.MathUtils.lerp(
      currentLength.current,
      targetLength.current,
      delta * 2.5
    )

    const len = Math.max(currentLength.current, 0.01)
    const startX = NODE_POSITIONS[0][0]

    // Update geometry scale and position
    meshRef.current.scale.set(1, len / 6, 1)
    meshRef.current.position.set(startX + len / 2, 0, 0)
  })

  return (
    <mesh
      ref={meshRef}
      rotation={[0, 0, Math.PI / 2]}
      position={[NODE_POSITIONS[0][0], 0, 0]}
    >
      <cylinderGeometry args={[0.05, 0.05, 6, 8]} />
      <meshStandardMaterial
        color={GOLD}
        emissive={GOLD_EMISSIVE}
        emissiveIntensity={0.3}
      />
    </mesh>
  )
}

/* ═══════════════════════════════════════════
   Milestone Node
   Completed = solid gold sphere with float
   Upcoming = wireframe burgundy sphere
   ═══════════════════════════════════════════ */
function MilestoneNode({
  position,
  index,
  isCompleted,
  isCurrent,
}: {
  position: [number, number, number]
  index: number
  isCompleted: boolean
  isCurrent: boolean
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const phaseOffset = index * 1.2 // stagger the float

  useFrame((state) => {
    if (!meshRef.current) return

    if (isCompleted) {
      // Gentle floating animation for completed nodes
      const t = state.clock.elapsedTime
      meshRef.current.position.y =
        position[1] + Math.sin(t * 1.2 + phaseOffset) * 0.08
      meshRef.current.rotation.y = t * 0.3 + phaseOffset
    }

    // Pulse scale for current node
    if (isCurrent) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05
      meshRef.current.scale.setScalar(pulse)
    }
  })

  const radius = isCurrent ? 0.28 : 0.22

  return (
    <mesh ref={meshRef} position={position}>
      {isCompleted ? (
        <>
          <sphereGeometry args={[radius, 32, 32]} />
          <meshStandardMaterial
            color={GOLD}
            emissive={GOLD_EMISSIVE}
            emissiveIntensity={0.4}
            metalness={0.6}
            roughness={0.3}
          />
        </>
      ) : (
        <>
          <sphereGeometry args={[radius, 16, 16]} />
          <meshStandardMaterial
            color={BURGUNDY}
            wireframe
            opacity={0.6}
            transparent
          />
        </>
      )}
    </mesh>
  )
}
