'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, Float, MeshDistortMaterial, Sparkles, PerspectiveCamera, MeshTransmissionMaterial, Sphere } from '@react-three/drei'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import * as THREE from 'three'

// Flowing Ribbon Component
function FlowingRibbon({ position, color, delay = 0 }: { position: [number, number, number], color: string, delay?: number }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    const time = state.clock.elapsedTime + delay
    meshRef.current.rotation.z = Math.sin(time * 0.5) * 0.3
    meshRef.current.position.y = position[1] + Math.sin(time * 0.8) * 0.15
  })

  return (
    <mesh ref={meshRef} position={position} rotation={[0, 0, 0.3]}>
      <planeGeometry args={[0.15, 2.5, 20, 40]} />
      <MeshDistortMaterial
        color={color}
        speed={1.5}
        distort={0.4}
        radius={1}
        side={THREE.DoubleSide}
        transparent
        opacity={0.7}
        roughness={0.3}
        metalness={0.2}
      />
    </mesh>
  )
}

// Couture Gown Model
function CoutureGown() {
  const groupRef = useRef<THREE.Group>(null)

  // Create custom gradient material
  const gradientMaterial = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')!

    const gradient = ctx.createLinearGradient(0, 0, 0, 256)
    gradient.addColorStop(0, '#C4795A')
    gradient.addColorStop(0.5, '#A8614A')
    gradient.addColorStop(1, '#8B9E84')

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 256, 256)

    const texture = new THREE.CanvasTexture(canvas)
    return texture
  }, [])

  useFrame((state) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.1
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.06
  })

  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.25}>
      <group ref={groupRef} position={[0, 0, 0]} scale={1.3}>

        {/* Main Dress - Layered Skirt */}
        {/* Outer Layer - Flowing */}
        <mesh position={[0, 0.3, 0]} castShadow>
          <cylinderGeometry args={[0.4, 1.5, 2.5, 40, 20]} />
          <MeshDistortMaterial
            color="#C4795A"
            speed={1.2}
            distort={0.35}
            radius={1.2}
            roughness={0.3}
            metalness={0.1}
            envMapIntensity={1}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Middle Layer - Iridescent */}
        <mesh position={[0, 0.35, 0]} castShadow>
          <cylinderGeometry args={[0.35, 1.35, 2.4, 32, 15]} />
          <meshStandardMaterial
            color="#E8C4B8"
            roughness={0.1}
            metalness={0.8}
            envMapIntensity={2}
            transparent
            opacity={0.6}
          />
        </mesh>

        {/* Inner Layer - Silk-like */}
        <mesh position={[0, 0.4, 0]} castShadow>
          <cylinderGeometry args={[0.3, 1.2, 2.3, 32]} />
          <meshStandardMaterial
            map={gradientMaterial}
            roughness={0.2}
            metalness={0.3}
            envMapIntensity={1.5}
          />
        </mesh>

        {/* Bodice - Structured */}
        <mesh position={[0, 1.5, 0]} castShadow>
          <cylinderGeometry args={[0.6, 0.4, 0.8, 32]} />
          <meshStandardMaterial
            color="#A8614A"
            roughness={0.4}
            metalness={0.2}
          />
        </mesh>

        {/* Sweetheart Neckline */}
        <mesh position={[0, 1.85, 0.05]} rotation={[0.2, 0, 0]}>
          <torusGeometry args={[0.3, 0.08, 16, 32, Math.PI]} />
          <meshStandardMaterial
            color="#C4795A"
            roughness={0.3}
            metalness={0.3}
          />
        </mesh>

        {/* Puffed Sleeves - Left */}
        <group position={[-0.7, 1.4, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.25, 32, 32]} />
            <MeshDistortMaterial
              color="#C4795A"
              speed={1}
              distort={0.2}
              radius={0.8}
              roughness={0.4}
              metalness={0.1}
            />
          </mesh>
          <mesh position={[0, -0.3, 0]} rotation={[0, 0, 0.4]} castShadow>
            <cylinderGeometry args={[0.15, 0.12, 0.5, 16]} />
            <meshStandardMaterial color="#A8614A" roughness={0.5} />
          </mesh>
        </group>

        {/* Puffed Sleeves - Right */}
        <group position={[0.7, 1.4, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.25, 32, 32]} />
            <MeshDistortMaterial
              color="#C4795A"
              speed={1}
              distort={0.2}
              radius={0.8}
              roughness={0.4}
              metalness={0.1}
            />
          </mesh>
          <mesh position={[0, -0.3, 0]} rotation={[0, 0, -0.4]} castShadow>
            <cylinderGeometry args={[0.15, 0.12, 0.5, 16]} />
            <meshStandardMaterial color="#A8614A" roughness={0.5} />
          </mesh>
        </group>

        {/* Decorative Waist Sash - Golden */}
        <mesh position={[0, 0.9, 0]}>
          <torusGeometry args={[0.45, 0.08, 20, 40]} />
          <meshStandardMaterial
            color="#D4A574"
            roughness={0.1}
            metalness={0.95}
            envMapIntensity={2}
          />
        </mesh>

        {/* Waist Bow */}
        <group position={[-0.5, 0.9, 0.3]}>
          <mesh rotation={[0, 0, 0.3]}>
            <boxGeometry args={[0.25, 0.15, 0.05]} />
            <meshStandardMaterial color="#8B9E84" metalness={0.7} roughness={0.2} />
          </mesh>
          <mesh position={[0.15, 0, 0]} rotation={[0, 0, -0.3]}>
            <boxGeometry args={[0.25, 0.15, 0.05]} />
            <meshStandardMaterial color="#8B9E84" metalness={0.7} roughness={0.2} />
          </mesh>
        </group>

        {/* Flowing Train - Back */}
        <mesh position={[0, 0, -0.6]} rotation={[0.3, 0, 0]} castShadow>
          <planeGeometry args={[1.2, 1.8, 20, 30]} />
          <MeshDistortMaterial
            color="#C4795A"
            speed={1}
            distort={0.3}
            radius={1}
            side={THREE.DoubleSide}
            transparent
            opacity={0.85}
            roughness={0.3}
            metalness={0.2}
          />
        </mesh>

        {/* Lace Overlay - Skirt Bottom */}
        <mesh position={[0, -0.8, 0]}>
          <torusGeometry args={[1.4, 0.06, 16, 40]} />
          <meshStandardMaterial
            color="#E8C4B8"
            roughness={0.2}
            metalness={0.4}
            transparent
            opacity={0.7}
          />
        </mesh>

        {/* Decorative Gems on Bodice */}
        {[0, 0.12, -0.12].map((x, i) => (
          <mesh key={i} position={[x, 1.5, 0.42]}>
            <sphereGeometry args={[0.035, 16, 16]} />
            <meshStandardMaterial
              color="#8B9E84"
              roughness={0.05}
              metalness={1}
              envMapIntensity={3}
            />
          </mesh>
        ))}

        {/* Statement Necklace */}
        <mesh position={[0, 1.75, 0.25]} rotation={[0.5, 0, 0]}>
          <torusGeometry args={[0.22, 0.025, 16, 32]} />
          <meshStandardMaterial
            color="#D4A574"
            roughness={0.05}
            metalness={0.98}
            envMapIntensity={2.5}
          />
        </mesh>

        {/* Necklace Pendant */}
        <mesh position={[0, 1.6, 0.35]}>
          <octahedronGeometry args={[0.06, 0]} />
          <meshStandardMaterial
            color="#8B9E84"
            roughness={0.02}
            metalness={1}
            envMapIntensity={3}
          />
        </mesh>

        {/* Flowing Ribbons */}
        <FlowingRibbon position={[-0.9, 0.5, 0.3]} color="#E8C4B8" delay={0} />
        <FlowingRibbon position={[0.9, 0.5, 0.3]} color="#E8C4B8" delay={0.5} />
        <FlowingRibbon position={[0, 0.3, 0.8]} color="#C4795A" delay={1} />

        {/* Magical Sparkles - Multiple layers */}
        <Sparkles
          count={50}
          scale={4}
          size={3}
          speed={0.15}
          color="#E8C4B8"
          opacity={0.8}
        />
        <Sparkles
          count={30}
          scale={3}
          size={2}
          speed={0.2}
          color="#D4A574"
          opacity={0.6}
        />
        <Sparkles
          count={20}
          scale={5}
          size={4}
          speed={0.1}
          color="#8B9E84"
          opacity={0.4}
        />

        {/* Glowing Aura */}
        <Sphere args={[2.2, 32, 32]} position={[0, 0.5, 0]}>
          <meshBasicMaterial
            color="#E8C4B8"
            transparent
            opacity={0.03}
            side={THREE.BackSide}
          />
        </Sphere>
      </group>
    </Float>
  )
}

// Advanced Lighting Rig
function LightingRig() {
  const lightRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!lightRef.current) return
    lightRef.current.rotation.y = state.clock.elapsedTime * 0.1
  })

  return (
    <group ref={lightRef}>
      {/* Key Light - Main */}
      <spotLight
        position={[5, 6, 5]}
        angle={0.5}
        penumbra={1}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />

      {/* Fill Light - Soft */}
      <spotLight
        position={[-4, 4, 3]}
        angle={0.6}
        penumbra={1}
        intensity={0.8}
        color="#E8C4B8"
      />

      {/* Rim Light - Drama */}
      <spotLight
        position={[0, 2, -6]}
        angle={0.4}
        penumbra={1}
        intensity={1}
        color="#8B9E84"
      />

      {/* Accent Lights - Multiple colors */}
      <pointLight position={[3, 1, 2]} intensity={0.4} color="#C4795A" />
      <pointLight position={[-3, 1, 2]} intensity={0.4} color="#8B9E84" />
      <pointLight position={[0, 4, 0]} intensity={0.3} color="#E8C4B8" />
      <pointLight position={[0, -1, 3]} intensity={0.2} color="#D4A574" />
    </group>
  )
}

// Main Scene
function Scene() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.5, 5.5]} fov={40} />

      {/* Interactive Controls */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 2.8}
        maxPolarAngle={Math.PI / 1.6}
        autoRotate
        autoRotateSpeed={1.2}
        dampingFactor={0.05}
        enableDamping
      />

      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <LightingRig />

      {/* Premium Environment */}
      <Environment preset="sunset" background={false} blur={0.8} />

      {/* Color Fog for Atmosphere */}
      <fog attach="fog" args={['#FDF6EE', 8, 15]} />

      {/* The Couture Gown */}
      <CoutureGown />

      {/* Reflective Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.8, 0]} receiveShadow>
        <planeGeometry args={[15, 15]} />
        <meshStandardMaterial
          color="#F5EDE3"
          roughness={0.1}
          metalness={0.3}
          envMapIntensity={0.5}
        />
      </mesh>

      {/* Circular Stage */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.75, 0]}>
        <circleGeometry args={[2.5, 64]} />
        <meshStandardMaterial
          color="#E8DDD1"
          roughness={0.2}
          metalness={0.2}
        />
      </mesh>
    </>
  )
}

// Main Component
export default function Hero3DDress() {
  const reducedMotion = useReducedMotion()

  if (reducedMotion) {
    return (
      <div className="w-full h-full rounded-3xl bg-gradient-to-br from-terracotta/10 via-beige/20 to-sage/10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-terracotta/30 to-sage/30" />
          <p className="text-walnut text-sm font-medium">Premium Couture Collection</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden bg-gradient-to-br from-cream via-beige/30 to-sand/20">
      {/* 3D Canvas */}
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        <Scene />
      </Canvas>

      {/* Interaction Hints */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
        <div className="px-4 py-2 bg-charcoal/80 backdrop-blur-md rounded-full text-cream text-xs font-mono">
          Drag to explore
        </div>
        <div className="px-4 py-2 bg-terracotta/80 backdrop-blur-md rounded-full text-cream text-xs font-mono animate-pulse">
          Auto-rotating
        </div>
      </div>

      {/* Vignette Effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-cream/30 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-cream/20 via-transparent to-cream/20 pointer-events-none" />

      {/* Subtle Corner Accents */}
      <div className="absolute top-6 right-6 w-16 h-16 border-t-2 border-r-2 border-terracotta/20 rounded-tr-2xl" />
      <div className="absolute bottom-6 left-6 w-16 h-16 border-b-2 border-l-2 border-sage/20 rounded-bl-2xl" />
    </div>
  )
}
