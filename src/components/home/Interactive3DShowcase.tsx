'use client'

import { useRef, useState, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, PerspectiveCamera, Float, MeshDistortMaterial, Sparkles } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import * as THREE from 'three'

// Women's Dress Model
function WomensDress() {
  const meshRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2
    meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
  })

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={meshRef} position={[0, 0, 0]}>
        {/* Dress Body */}
        <mesh position={[0, 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.3, 1.2, 2, 32]} />
          <MeshDistortMaterial
            color="#C4795A"
            speed={2}
            distort={0.2}
            radius={1}
            roughness={0.4}
            metalness={0.1}
          />
        </mesh>

        {/* Dress Top */}
        <mesh position={[0, 1.3, 0]} castShadow>
          <cylinderGeometry args={[0.5, 0.3, 0.6, 32]} />
          <meshStandardMaterial
            color="#A8614A"
            roughness={0.5}
            metalness={0.1}
          />
        </mesh>

        {/* Sleeves */}
        <mesh position={[-0.6, 1.2, 0]} rotation={[0, 0, 0.5]} castShadow>
          <cylinderGeometry args={[0.15, 0.1, 0.6, 16]} />
          <meshStandardMaterial color="#C4795A" roughness={0.5} />
        </mesh>
        <mesh position={[0.6, 1.2, 0]} rotation={[0, 0, -0.5]} castShadow>
          <cylinderGeometry args={[0.15, 0.1, 0.6, 16]} />
          <meshStandardMaterial color="#C4795A" roughness={0.5} />
        </mesh>

        {/* Decorative belt */}
        <mesh position={[0, 0.5, 0]}>
          <torusGeometry args={[0.35, 0.05, 16, 32]} />
          <meshStandardMaterial color="#8B9E84" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Sparkles around dress */}
        <Sparkles count={30} scale={3} size={2} speed={0.3} color="#E8C4B8" />
      </group>
    </Float>
  )
}

// Men's Jacket Model
function MensJacket() {
  const meshRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2
    meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
  })

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={meshRef} position={[0, 0, 0]}>
        {/* Jacket Body */}
        <mesh position={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[1.4, 1.8, 0.6]} />
          <MeshDistortMaterial
            color="#2C2420"
            speed={2}
            distort={0.15}
            radius={1}
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>

        {/* Collar */}
        <mesh position={[0, 1.1, 0.1]} rotation={[0.3, 0, 0]} castShadow>
          <boxGeometry args={[0.8, 0.3, 0.2]} />
          <meshStandardMaterial color="#1A1210" roughness={0.8} />
        </mesh>

        {/* Sleeves */}
        <mesh position={[-0.9, 0.3, 0]} rotation={[0, 0, 0.2]} castShadow>
          <cylinderGeometry args={[0.2, 0.18, 1.6, 16]} />
          <meshStandardMaterial color="#2C2420" roughness={0.7} />
        </mesh>
        <mesh position={[0.9, 0.3, 0]} rotation={[0, 0, -0.2]} castShadow>
          <cylinderGeometry args={[0.2, 0.18, 1.6, 16]} />
          <meshStandardMaterial color="#2C2420" roughness={0.7} />
        </mesh>

        {/* Buttons */}
        {[0.6, 0.3, 0, -0.3].map((y, i) => (
          <mesh key={i} position={[0, y, 0.31]}>
            <cylinderGeometry args={[0.05, 0.05, 0.02, 16]} />
            <meshStandardMaterial color="#C4795A" metalness={0.8} roughness={0.2} />
          </mesh>
        ))}

        {/* Pockets */}
        <mesh position={[-0.3, -0.2, 0.31]}>
          <boxGeometry args={[0.3, 0.25, 0.05]} />
          <meshStandardMaterial color="#1A1210" roughness={0.9} />
        </mesh>
        <mesh position={[0.3, -0.2, 0.31]}>
          <boxGeometry args={[0.3, 0.25, 0.05]} />
          <meshStandardMaterial color="#1A1210" roughness={0.9} />
        </mesh>

        {/* Sparkles around jacket */}
        <Sparkles count={30} scale={3} size={2} speed={0.3} color="#D4C5B5" />
      </group>
    </Float>
  )
}

// Scene Component
function Scene({ activeModel }: { activeModel: 'women' | 'men' }) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.5}
        autoRotate
        autoRotateSpeed={0.5}
      />

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <spotLight position={[5, 5, 5]} angle={0.3} penumbra={1} intensity={1} castShadow />
      <spotLight position={[-5, 5, -5]} angle={0.3} penumbra={1} intensity={0.5} />
      <pointLight position={[0, 3, 0]} intensity={0.5} color="#E8C4B8" />

      {/* Environment for reflections */}
      <Environment preset="sunset" />

      {/* Models */}
      <AnimatePresence mode="wait">
        {activeModel === 'women' ? <WomensDress key="women" /> : <MensJacket key="men" />}
      </AnimatePresence>

      {/* Ground shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <shadowMaterial opacity={0.2} />
      </mesh>
    </>
  )
}

// Loading fallback
function Loader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-12 h-12 border-4 border-terracotta border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-walnut text-sm">Loading 3D Experience...</p>
      </div>
    </div>
  )
}

// Main Component
export default function Interactive3DShowcase() {
  const [activeModel, setActiveModel] = useState<'women' | 'men'>('women')
  const reducedMotion = useReducedMotion()

  if (reducedMotion) {
    return (
      <section className="py-24 bg-cream">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-charcoal mb-6">
            Our Collections
          </h2>
          <p className="text-walnut text-lg max-w-2xl mx-auto">
            Explore our curated collections of premium fashion pieces.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="relative py-24 lg:py-32 bg-gradient-to-b from-cream via-beige to-cream overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-terracotta/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sage/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* 3D Canvas */}
          <div className="relative aspect-square lg:aspect-[4/5] rounded-2xl overflow-hidden bg-gradient-to-br from-sand/20 to-earth/10 backdrop-blur-sm border border-earth/10">
            <Canvas shadows gl={{ antialias: true, alpha: true }}>
              <Suspense fallback={null}>
                <Scene activeModel={activeModel} />
              </Suspense>
            </Canvas>

            {/* Loading overlay */}
            <Suspense fallback={<Loader />}>
              <></>
            </Suspense>

            {/* Interaction hint */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-charcoal/80 backdrop-blur-md rounded-full text-cream text-sm font-mono"
            >
              Drag to rotate • Auto-rotating
            </motion.div>
          </div>

          {/* Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-xs font-semibold text-terracotta uppercase tracking-[0.3em] mb-4">
                Interactive 3D Experience
              </p>
              <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-charcoal leading-[0.95] mb-6">
                Crafted with Precision
              </h2>
              <p className="text-lg text-walnut leading-relaxed mb-8">
                Experience our collections in a whole new dimension. Each piece is meticulously designed,
                from the cut to the fabric, to create timeless elegance that transcends seasons.
              </p>

              {/* Toggle buttons */}
              <div className="flex gap-4 mb-8">
                <button
                  onClick={() => setActiveModel('women')}
                  className={`group relative px-8 py-4 rounded-full font-medium transition-all duration-300 ${
                    activeModel === 'women'
                      ? 'bg-terracotta text-cream shadow-lg'
                      : 'bg-cream-dark text-walnut hover:bg-sand'
                  }`}
                >
                  <span className="relative z-10">Women's Collection</span>
                  {activeModel === 'women' && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-terracotta rounded-full"
                      transition={{ type: 'spring', duration: 0.6 }}
                    />
                  )}
                </button>
                <button
                  onClick={() => setActiveModel('men')}
                  className={`group relative px-8 py-4 rounded-full font-medium transition-all duration-300 ${
                    activeModel === 'men'
                      ? 'bg-charcoal text-cream shadow-lg'
                      : 'bg-cream-dark text-walnut hover:bg-sand'
                  }`}
                >
                  <span className="relative z-10">Men's Collection</span>
                  {activeModel === 'men' && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-charcoal rounded-full"
                      transition={{ type: 'spring', duration: 0.6 }}
                    />
                  )}
                </button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-6">
                {[
                  { label: 'Premium Fabrics', value: '100%' },
                  { label: 'Handcrafted', value: 'Yes' },
                  { label: 'Sustainable', value: 'Always' },
                  { label: 'Timeless', value: 'Forever' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 rounded-lg bg-cream-dark/50"
                  >
                    <p className="font-mono text-2xl text-terracotta mb-1">{item.value}</p>
                    <p className="text-sm text-earth">{item.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="mt-8"
              >
                <a
                  href="/shop"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-charcoal text-cream text-sm font-medium rounded-full hover:bg-espresso transition-colors"
                >
                  Explore Collection
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </a>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom decorative element */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-earth/20 to-transparent" />
    </section>
  )
}
