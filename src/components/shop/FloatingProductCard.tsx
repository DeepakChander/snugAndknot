'use client'

import { useRef, useEffect, useState } from 'react'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import ProductCard from '@/components/product/ProductCard'
import type { Product } from '@/types'

interface FloatingProductCardProps {
  product: Product
  index: number
  priority?: boolean
}

export default function FloatingProductCard({ product, index, priority = false }: FloatingProductCardProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion || !containerRef.current) return

    const container = containerRef.current

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height
      setMousePos({ x, y })
    }

    const handleMouseEnter = () => setIsHovering(true)
    const handleMouseLeave = () => {
      setIsHovering(false)
      setMousePos({ x: 0, y: 0 })
    }

    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseenter', handleMouseEnter)
    container.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseenter', handleMouseEnter)
      container.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [reducedMotion])

  // Calculate 3D transform values
  const tiltX = isHovering ? mousePos.y * 8 : 0
  const tiltY = isHovering ? -mousePos.x * 8 : 0
  const depth = isHovering ? 20 : 0

  // Parallax offset for depth layers
  const imageOffset = isHovering ? { x: mousePos.x * 5, y: mousePos.y * 5 } : { x: 0, y: 0 }
  const labelOffset = isHovering ? { x: mousePos.x * 10, y: mousePos.y * 10 } : { x: 0, y: 0 }

  const containerStyle = reducedMotion ? {} : {
    transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(${depth}px)`,
    transition: 'transform 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
  }

  const shadowStyle = reducedMotion ? {} : {
    boxShadow: isHovering
      ? `0 ${20 + depth}px ${40 + depth * 2}px rgba(91, 14, 20, 0.25), 0 ${10 + depth / 2}px ${20 + depth}px rgba(241, 225, 148, 0.1)`
      : '0 4px 12px rgba(91, 14, 20, 0.08)',
    transition: 'box-shadow 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
  }

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{
        transformStyle: 'preserve-3d',
        ...containerStyle,
      }}
    >
      {/* Shadow container */}
      <div style={shadowStyle} className="rounded-sm">
        {/* Depth layer wrapper for parallax effect */}
        <div
          className="relative"
          style={{
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Image layer (middle depth) */}
          <div
            style={
              reducedMotion
                ? {}
                : {
                    transform: `translateX(${imageOffset.x}px) translateY(${imageOffset.y}px) translateZ(10px)`,
                    transition: 'transform 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
                  }
            }
          >
            <ProductCard product={product} index={index} priority={priority} />
          </div>

          {/* Label layer (front depth) - overlay on existing ProductCard labels */}
          {!reducedMotion && (
            <div
              className="absolute bottom-0 left-0 right-0 pointer-events-none"
              style={{
                transform: `translateX(${labelOffset.x}px) translateY(${labelOffset.y}px) translateZ(20px)`,
                transition: 'transform 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
                opacity: isHovering ? 0.5 : 0,
              }}
            >
              {/* Subtle depth indicator (optional visual enhancement) */}
              <div
                className="h-1 bg-gradient-to-r from-transparent via-gold/30 to-transparent"
                style={{
                  filter: 'blur(2px)',
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
