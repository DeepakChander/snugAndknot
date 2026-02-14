'use client'

import HeroSection from '@/components/home/HeroSection'
import BrandMarquee from '@/components/home/BrandMarquee'
import BrandPhilosophy from '@/components/home/BrandPhilosophy'
import FeaturedCollections from '@/components/home/FeaturedCollections'
import BrandTeaser from '@/components/home/BrandTeaser'
import TestimonialsSection from '@/components/home/TestimonialsSection'
import BlogShowcase from '@/components/home/BlogShowcase'
import QualityPromise from '@/components/home/QualityPromise'
import JoinSection from '@/components/home/JoinSection'
import SocialStrip from '@/components/home/SocialStrip'
import ContactSection from '@/components/home/ContactSection'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <BrandMarquee />
      <BrandPhilosophy />
      <FeaturedCollections />
      <BrandTeaser />
      <TestimonialsSection />
      <BlogShowcase />
      <QualityPromise />
      <JoinSection />
      <SocialStrip />
      <ContactSection />
    </>
  )
}
