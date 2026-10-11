'use client'

import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { gsap } from '@/lib/motion/gsap'
import { textureUrl } from './ProductRing'

const vertex = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uHover;
  uniform float uProgress;
  varying vec2 vUv;
  varying float vShade;
  void main() {
    vUv = uv;
    vec3 p = position;
    float hang = 1.0 - uv.y;
    // Knit panel hanging from its top edge: a slow sway, stronger toward the hem.
    float sway = sin(uv.x * 2.6 + uTime * 0.9) * 0.012 * hang * hang;
    // A soft ripple travels out from the pointer.
    float d = distance(uv, uMouse);
    float ripple = sin(d * 22.0 - uTime * 3.2) * exp(-d * 6.0) * 0.018 * uHover;
    // The cloth billows a little as one image gives way to the next.
    float billow = sin(uProgress * 3.14159) * sin(uv.x * 3.14159) * 0.05 * hang;
    p.z += sway + ripple + billow;
    vShade = (sway + ripple + billow) * 9.0;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`

const fragment = /* glsl */ `
  uniform sampler2D uTex1;
  uniform sampler2D uTex2;
  uniform vec2 uCover1;
  uniform vec2 uCover2;
  uniform float uProgress;
  uniform float uPleats;
  varying vec2 vUv;
  varying float vShade;

  mat2 rot(float a) { float s = sin(a), c = cos(a); return mat2(c, -s, s, c); }
  vec2 cover(vec2 uv, vec2 k) { return (uv - 0.5) * k + 0.5; }

  void main() {
    // Ribbed "pleat" transition: the image splits into knit-like columns that slide apart.
    vec2 cells = fract(vUv * vec2(uPleats, 1.0));
    vec2 uv1 = vUv + rot(3.14159 / 4.0) * cells * uProgress * 0.09;
    vec2 uv2 = vUv + rot(3.14159 / 4.0) * cells * (1.0 - uProgress) * 0.09;
    vec4 a = texture2D(uTex1, cover(uv1, uCover1));
    vec4 b = texture2D(uTex2, cover(uv2, uCover2));
    vec4 col = mix(a, b, smoothstep(0.0, 1.0, uProgress));
    col.rgb *= 1.0 + vShade * 0.6;
    gl_FragColor = vec4(col.rgb, 1.0);
    #include <colorspace_fragment>
  }
`

function coverFor(tex: THREE.Texture, aspect: number) {
  const img = tex.image as { width: number; height: number } | undefined
  const ia = img ? img.width / img.height : 0.66
  return ia > aspect ? new THREE.Vector2(aspect / ia, 1) : new THREE.Vector2(1, ia / aspect)
}

function Cloth({ images, index, onReady }: { images: string[]; index: number; onReady: () => void }) {
  const textures = useTexture(images.map((s) => textureUrl(s, 1200)))
  const { viewport, size } = useThree()
  const mat = useRef<THREE.ShaderMaterial>(null)
  const shown = useRef(index)
  const hover = useRef({ target: 0, mouse: new THREE.Vector2(0.5, 0.5) })
  const aspect = size.width / size.height

  useEffect(() => {
    textures.forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace
      t.anisotropy = 8
      t.needsUpdate = true
    })
    onReady()
  }, [textures, onReady])

  const uniforms = useMemo(
    () => ({
      uTex1: { value: textures[index] },
      uTex2: { value: textures[index] },
      uCover1: { value: coverFor(textures[index], aspect) },
      uCover2: { value: coverFor(textures[index], aspect) },
      uProgress: { value: 0 },
      uPleats: { value: 34 },
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uHover: { value: 0 },
    }),
    // Built once; textures/aspect are updated imperatively below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  useEffect(() => {
    const u = uniforms
    u.uCover1.value = coverFor(u.uTex1.value as THREE.Texture, aspect)
    u.uCover2.value = coverFor(u.uTex2.value as THREE.Texture, aspect)
  }, [aspect, uniforms])

  // Transition to a new image with the pleat effect.
  useEffect(() => {
    if (index === shown.current) return
    const u = uniforms
    u.uTex2.value = textures[index]
    u.uCover2.value = coverFor(textures[index], aspect)
    const tween = gsap.fromTo(
      u.uProgress,
      { value: 0 },
      {
        value: 1,
        duration: 1.25,
        ease: 'power3.inOut',
        onComplete: () => {
          u.uTex1.value = textures[index]
          u.uCover1.value = u.uCover2.value
          u.uProgress.value = 0
        },
      }
    )
    shown.current = index
    return () => {
      tween.progress(1)
    }
  }, [index, textures, uniforms, aspect])

  useFrame((state, dt) => {
    uniforms.uTime.value = state.clock.elapsedTime
    uniforms.uHover.value = THREE.MathUtils.damp(uniforms.uHover.value, hover.current.target, 4, dt)
    uniforms.uMouse.value.lerp(hover.current.mouse, 0.12)
  })

  return (
    <mesh
      scale={[viewport.width * 1.03, viewport.height * 1.03, 1]}
      onPointerMove={(e) => {
        if (e.uv) hover.current.mouse.set(e.uv.x, e.uv.y)
        hover.current.target = 1
      }}
      onPointerOut={() => (hover.current.target = 0)}
    >
      <planeGeometry args={[1, 1, 48, 64]} />
      <shaderMaterial ref={mat} vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} toneMapped={false} />
    </mesh>
  )
}

export default function FabricPlane({ images, index, active, onReady }: { images: string[]; index: number; active: boolean; onReady: () => void }) {
  return (
    <Canvas flat dpr={[1, 2]} frameloop={active ? 'always' : 'never'} camera={{ position: [0, 0, 5], fov: 30 }} gl={{ antialias: true, alpha: true }}>
      <Suspense fallback={null}>
        <Cloth images={images} index={index} onReady={onReady} />
      </Suspense>
    </Canvas>
  )
}
