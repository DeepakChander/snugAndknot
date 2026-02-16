'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/* ─── Draped Cloth Shader ──────────────────────────────────
   Realistic fabric draped from the top, swaying with wind,
   rippling on mouse hover, folding on scroll.
   Ported textile patterns from the original HeroKnot shader.
   ──────────────────────────────────────────────────────────── */

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uScrollProgress;
  uniform vec2 uMouse;

  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vViewDirection;
  varying float vDrapeWeight;

  void main() {
    vUv = uv;

    // pinWeight: 0.0 at top (pinned), 1.0 at bottom (free)
    float pinWeight = uv.y;
    vDrapeWeight = pinWeight;

    vec3 pos = position;

    // 1. Gravity drape — quadratic falloff, bottom swings forward & down
    float drape = pinWeight * pinWeight * 1.0;
    pos.z += drape;
    pos.y -= pinWeight * pinWeight * 0.25;

    // 2. Wind sway — large-scale sine, elegant billowing
    float wind = sin(pos.x * 0.8 + uTime * 0.3) *
                 cos(pos.y * 0.5 + uTime * 0.2) *
                 pinWeight * 0.12;
    pos.z += wind;
    pos.x += sin(uTime * 0.25 + pos.y * 0.6) * pinWeight * 0.06;

    // Secondary wind ripple for realism
    pos.z += sin(pos.x * 2.5 + pos.y * 1.8 + uTime * 0.5) * pinWeight * 0.025;

    // 3. Mouse ripple — radial wave from cursor
    vec2 clothUV = uv * 2.0 - 1.0;
    float mouseDist = length(clothUV - uMouse);
    float ripple = sin(mouseDist * 10.0 - uTime * 4.0) *
                   exp(-mouseDist * 2.8) *
                   0.05 * pinWeight;
    pos.z += ripple;

    // 4. Scroll fold — bottom gathers upward as user scrolls
    float fold = uScrollProgress * pinWeight;
    pos.y += fold * 0.6;
    pos.z -= fold * 0.3;
    // Compress vertically on scroll
    pos.y *= 1.0 - uScrollProgress * 0.2 * pinWeight;

    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    vWorldPosition = worldPos.xyz;
    vViewDirection = normalize(cameraPosition - worldPos.xyz);

    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uScrollProgress;

  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vViewDirection;
  varying float vDrapeWeight;

  void main() {
    // Reconstruct normals from world position derivatives for accurate lighting
    vec3 normal = normalize(cross(dFdx(vWorldPosition), dFdy(vWorldPosition)));

    // Fresnel — silk sheen on edges
    float fresnel = pow(1.0 - max(dot(normal, vViewDirection), 0.0), 2.5);

    // Woven fabric pattern: warp and weft threads
    float warpThread = smoothstep(0.42, 0.5, fract(vUv.x * 60.0)) *
                       smoothstep(0.58, 0.5, fract(vUv.x * 60.0));
    float weftThread = smoothstep(0.42, 0.5, fract(vUv.y * 50.0)) *
                       smoothstep(0.58, 0.5, fract(vUv.y * 50.0));
    float weave = max(warpThread, weftThread) * 0.18;

    // Brand colors
    vec3 burgundyDeep = vec3(0.239, 0.039, 0.055);
    vec3 burgundy     = vec3(0.357, 0.055, 0.078);
    vec3 goldThread   = vec3(0.831, 0.659, 0.322);
    vec3 goldLight    = vec3(0.945, 0.882, 0.580);

    // Fabric base with depth variation from drape folds
    float foldDark = 1.0 - vDrapeWeight * vDrapeWeight * 0.3;
    vec3 baseColor = mix(burgundyDeep, burgundy, 0.5 + 0.5 * sin(vUv.y * 6.0 + vUv.x * 4.0));
    baseColor *= foldDark;

    // Gold thread in the weave
    vec3 weaveColor = mix(baseColor, goldThread, weave * 0.5);

    // Silk sheen on edges
    vec3 sheenColor = mix(weaveColor, goldLight, fresnel * 0.3);

    // Subsurface scattering — light through thin fabric areas
    vec3 lightDir = normalize(vec3(0.5, 0.8, 0.4));
    float subsurface = max(0.0, dot(lightDir, -vViewDirection)) * 0.08;
    sheenColor += goldLight * subsurface * (1.0 - vDrapeWeight * 0.5);

    // Mouse proximity warmth
    vec2 clothUV = vUv * 2.0 - 1.0;
    float mouseDist = length(clothUV - uMouse);
    float mouseWarmth = smoothstep(2.0, 0.3, mouseDist) * 0.1;
    sheenColor += goldLight * mouseWarmth * fresnel;

    // Gold rim emission
    sheenColor += goldThread * fresnel * 0.12;

    // Scroll fade
    float scrollFade = 1.0 - uScrollProgress * 0.3;

    gl_FragColor = vec4(sheenColor * scrollFade, 0.88);
  }
`

interface HeroClothProps {
  scrollProgress: number
  isMobile: boolean
}

export default function HeroCloth({ scrollProgress, isMobile }: HeroClothProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const mouseSmooth = useRef(new THREE.Vector2(0, 0))

  const segments = isMobile ? 64 : 128

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uScrollProgress: { value: 0 },
    }),
    []
  )

  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return

    const t = state.clock.getElapsedTime()
    const pointer = state.pointer

    // Update uniforms
    materialRef.current.uniforms.uTime.value = t
    materialRef.current.uniforms.uScrollProgress.value = scrollProgress

    // Smooth mouse tracking — responsive for ripples
    mouseSmooth.current.x += (pointer.x - mouseSmooth.current.x) * 0.08
    mouseSmooth.current.y += (pointer.y - mouseSmooth.current.y) * 0.08
    materialRef.current.uniforms.uMouse.value.copy(mouseSmooth.current)

    // Very gentle floating
    meshRef.current.position.y = Math.sin(t * 0.3) * 0.03

    // Drift toward center on scroll
    const targetX = isMobile ? 0 : 2.8 - scrollProgress * 2.8
    meshRef.current.position.x += (targetX - meshRef.current.position.x) * 0.025

    // Subtle scale breathing
    const breathe = 1.0 + Math.sin(t * 0.4) * 0.005
    const baseScale = isMobile ? 0.65 : 1.0
    meshRef.current.scale.setScalar(breathe * baseScale)
  })

  return (
    <mesh
      ref={meshRef}
      position={isMobile ? [0, 0, -1] : [2.8, 0, -1]}
      rotation={[0, isMobile ? 0 : -0.25, 0]}
    >
      <planeGeometry args={[3.5, 4.5, segments, segments]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.DoubleSide}
        transparent
      />
    </mesh>
  )
}
