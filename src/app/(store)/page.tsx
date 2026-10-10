'use client'

import HeroSection from '@/components/home/HeroSection'
import TrustStrip from '@/components/home/TrustStrip'
import FeaturedCollections from '@/components/home/FeaturedCollections'
import BrandTeaser from '@/components/home/BrandTeaser'
import TestimonialsSection from '@/components/home/TestimonialsSection'
import JoinSection from '@/components/home/JoinSection'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustStrip />
      <FeaturedCollections />
      <BrandTeaser />
      <TestimonialsSection />
      <JoinSection />
    </>
  )
}
