'use client'

import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'

export default function HeroPostProcessing() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        luminanceThreshold={1.2}
        luminanceSmoothing={0.9}
        intensity={0.3}
        mipmapBlur
      />
      <Vignette offset={0.3} darkness={0.4} />
    </EffectComposer>
  )
}
