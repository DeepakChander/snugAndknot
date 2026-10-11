'use client'

import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

export interface RingItem {
  src: string
  title: string
  subtitle: string
  href: string
}

/** Optimised, same-origin URL for a texture (Next image optimizer). */
export function textureUrl(src: string, width = 750) {
  if (!src.startsWith('/')) return src
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=75`
}

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uHover;
  uniform float uRadius;
  varying vec2 vUv;
  varying float vHang;
  void main() {
    vUv = uv;
    vec3 p = position;
    // Hug the ring: the panel curves back at its edges like fabric on a drum.
    float theta = p.x / uRadius;
    p.z += (cos(theta) - 1.0) * uRadius;
    // Hangs from its top edge and sways like a knit panel on a rail.
    float hang = 1.0 - uv.y;
    vHang = hang;
    p.z += sin(uv.x * 3.2 + uTime * 1.3) * 0.045 * hang * hang * (0.5 + uHover * 1.4);
    p.x += sin(uTime * 0.7 + uv.y * 2.2) * 0.02 * hang;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`

const fragment = /* glsl */ `
  uniform sampler2D uTexture;
  uniform vec2 uCover;
  uniform vec2 uSize;
  uniform float uActive;
  uniform float uHover;
  varying vec2 vUv;
  varying float vHang;

  float roundedBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  void main() {
    vec2 uv = (vUv - 0.5) * uCover * (1.0 - uHover * 0.04) + 0.5;
    vec4 tex = texture2D(uTexture, uv);
    float lum = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
    vec3 sepia = vec3(lum) * vec3(1.02, 0.95, 0.86);
    vec3 col = mix(sepia, tex.rgb, 0.25 + 0.75 * uActive);
    col *= 0.42 + 0.58 * uActive;
    // Soft drape shading toward the free edge.
    col *= 1.0 - vHang * 0.08;
    float d = roundedBox((vUv - 0.5) * uSize, uSize * 0.5, 0.09);
    float alpha = 1.0 - smoothstep(-0.004, 0.004, d);
    gl_FragColor = vec4(col, alpha);
    #include <colorspace_fragment>
  }
`

const CARD_W = 1.55
const CARD_H = 2.05

function Card({
  texture,
  index,
  count,
  radius,
  angle,
  hovered,
  onHover,
  onOpen,
}: {
  texture: THREE.Texture
  index: number
  count: number
  radius: number
  angle: React.RefObject<number>
  hovered: React.RefObject<number>
  onHover: (i: number | null) => void
  onOpen: (i: number) => void
}) {
  const mesh = useRef<THREE.Mesh>(null)
  const theta = (index / count) * Math.PI * 2
  const material = useMemo(() => {
    const img = texture.image as { width: number; height: number } | undefined
    const ia = img ? img.width / img.height : 0.75
    const pa = CARD_W / CARD_H
    const cover = ia > pa ? new THREE.Vector2(pa / ia, 1) : new THREE.Vector2(1, ia / pa)
    return new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      toneMapped: false,
      uniforms: {
        uTexture: { value: texture },
        uCover: { value: cover },
        uSize: { value: new THREE.Vector2(CARD_W, CARD_H) },
        uTime: { value: 0 },
        uHover: { value: 0 },
        uActive: { value: 0 },
        uRadius: { value: radius },
      },
    })
  }, [texture, radius])

  useEffect(() => () => material.dispose(), [material])

  useFrame((state, dt) => {
    const u = material.uniforms
    u.uTime.value = state.clock.elapsedTime + index
    // How close this card is to the front of the ring (1 = facing the camera).
    const rel = Math.atan2(Math.sin(theta - (angle.current ?? 0)), Math.cos(theta - (angle.current ?? 0)))
    const active = Math.max(0, 1 - Math.abs(rel) / (Math.PI / 3))
    u.uActive.value = THREE.MathUtils.damp(u.uActive.value, Math.pow(active, 1.4), 6, dt)
    u.uHover.value = THREE.MathUtils.damp(u.uHover.value, hovered.current === index ? 1 : 0, 5, dt)
    if (mesh.current) mesh.current.position.y = Math.sin(state.clock.elapsedTime * 0.6 + index) * 0.03
  })

  return (
    <group rotation={[0, theta, 0]}>
      <mesh
        ref={mesh}
        position={[0, 0, radius]}
        material={material}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation()
          onHover(index)
        }}
        onPointerOut={() => onHover(null)}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          if (e.delta > 6) return
          e.stopPropagation()
          onOpen(index)
        }}
      >
        <planeGeometry args={[CARD_W, CARD_H, 32, 32]} />
      </mesh>
    </group>
  )
}

function Ring({
  items,
  scroll,
  hold,
  onActive,
  onOpen,
  setCursor,
}: {
  items: RingItem[]
  scroll: React.RefObject<number>
  hold?: React.RefObject<boolean>
  onActive: (i: number) => void
  onOpen: (i: number) => void
  setCursor: (v: 'drag' | 'view' | 'default') => void
}) {
  // Set up in useTexture's onLoad, which runs before drei uploads them, so each texture is uploaded once.
  const textures = useTexture(
    items.map((i) => textureUrl(i.src)),
    (loaded) => {
      for (const t of Array.isArray(loaded) ? loaded : [loaded]) {
        t.colorSpace = THREE.SRGBColorSpace
        t.anisotropy = 8
      }
    }
  )
  const count = items.length
  const step = (Math.PI * 2) / count
  const radius = Math.max(3.2, (count * CARD_W * 1.18) / (Math.PI * 2))
  const group = useRef<THREE.Group>(null)
  const angle = useRef(0)
  const target = useRef(0)
  const hovered = useRef<number>(-1)
  const drag = useRef({ active: false, x: 0, last: 0, velocity: 0, idleAt: 0 })
  const lastActive = useRef(-1)
  const { size, gl } = useThree()


  // Drag anywhere on the canvas to spin; release settles on the nearest piece.
  useEffect(() => {
    const el = gl.domElement
    const down = (e: PointerEvent) => {
      drag.current = { ...drag.current, active: true, x: e.clientX, last: e.clientX, velocity: 0 }
    }
    const move = (e: PointerEvent) => {
      if (!drag.current.active) return
      const dx = e.clientX - drag.current.last
      drag.current.last = e.clientX
      drag.current.velocity = dx
      target.current -= dx * 0.0042
    }
    const up = () => {
      if (!drag.current.active) return
      drag.current.active = false
      target.current -= drag.current.velocity * 0.02
      target.current = Math.round(target.current / step) * step
      drag.current.idleAt = performance.now()
    }
    el.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerup', up)
    return () => {
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  }, [gl, step])

  useFrame((state, dt) => {
    const now = performance.now()
    // Gentle auto-advance one piece at a time when nobody is interacting.
    // Held while the piece's name or button has keyboard focus, so the link does not change under it.
    if (!drag.current.active && hovered.current < 0 && !hold?.current && now - drag.current.idleAt > 3800) {
      target.current = Math.round(target.current / step) * step + step
      drag.current.idleAt = now
    }
    const s = scroll.current ?? 0
    angle.current = THREE.MathUtils.damp(angle.current, target.current + s * step * 2.2, drag.current.active ? 12 : 3.2, dt)
    const g = group.current
    if (g) {
      g.rotation.y = -angle.current
      const mobile = size.width < 768
      g.position.y = THREE.MathUtils.damp(g.position.y, (mobile ? -0.05 : -0.42) + s * 1.6, 4, dt)
      g.rotation.x = THREE.MathUtils.damp(g.rotation.x, 0.05 + s * 0.25 + state.pointer.y * 0.04, 4, dt)
      g.rotation.z = THREE.MathUtils.damp(g.rotation.z, state.pointer.x * -0.02, 4, dt)
    }
    const idx = ((Math.round(angle.current / step) % count) + count) % count
    if (idx !== lastActive.current) {
      lastActive.current = idx
      onActive(idx)
    }
  })

  return (
    <group ref={group}>
      {textures.map((t, i) => (
        <Card
          key={items[i].src + i}
          texture={t}
          index={i}
          count={count}
          radius={radius}
          angle={angle}
          hovered={hovered}
          onHover={(h) => {
            hovered.current = h ?? -1
            if (h === null) {
              drag.current.idleAt = performance.now()
              setCursor('drag')
            } else setCursor(h === lastActive.current ? 'view' : 'drag')
          }}
          onOpen={(i) => {
            if (i === lastActive.current) onOpen(i)
            else target.current = target.current + Math.atan2(Math.sin((i / count) * Math.PI * 2 - angle.current), Math.cos((i / count) * Math.PI * 2 - angle.current))
          }}
        />
      ))}
    </group>
  )
}

function CameraRig({ count }: { count: number }) {
  const { camera, size } = useThree()
  useEffect(() => {
    const radius = Math.max(3.2, (count * CARD_W * 1.18) / (Math.PI * 2))
    const mobile = size.width < 768
    camera.position.set(0, 0.35, radius + (mobile ? 8.6 : 8))
    camera.lookAt(0, 0.1, 0)
  }, [camera, size, count])
  return null
}

export default function ProductRing({
  items,
  scroll,
  hold,
  active,
  onActive,
  onOpen,
  setCursor,
}: {
  items: RingItem[]
  scroll: React.RefObject<number>
  /** While true the ring does not auto-advance. */
  hold?: React.RefObject<boolean>
  active: boolean
  onActive: (i: number) => void
  onOpen: (i: number) => void
  setCursor: (v: 'drag' | 'view' | 'default') => void
}) {
  return (
    <Canvas
      flat
      dpr={[1, 1.75]}
      frameloop={active ? 'always' : 'never'}
      camera={{ fov: 32, near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ touchAction: 'pan-y' }}
    >
      <CameraRig count={items.length} />
      <Suspense fallback={null}>
        <Ring items={items} scroll={scroll} hold={hold} onActive={onActive} onOpen={onOpen} setCursor={setCursor} />
      </Suspense>
    </Canvas>
  )
}
