# Hero Section Visual Enhancements

## 🎨 What Was Added

The homepage hero section has been transformed from a simple split layout to a rich, multi-layered, visually stunning experience with 3D elements and interactive animations.

### 1. **3D Animated Cloth Simulation** ✨
**File**: `src/components/animation/ClothSimulation.tsx`
- Real-time 3D fabric/cloth using Three.js and React Three Fiber
- Flowing wave animations with multiple sine waves for natural movement
- Terracotta-colored material with proper lighting
- Gentle rotation and movement
- Automatically disabled for users with reduced motion preferences
- Renders as a subtle background layer at 20% opacity

**Tech**: @react-three/fiber, three.js

### 2. **Floating Product Images** 🖼️
**File**: `src/components/home/FloatingProducts.tsx`
- 4 floating product images positioned around the hero
- Each image has:
  - Continuous floating animation (up/down)
  - Subtle rotation
  - Scroll-triggered parallax (different speeds)
  - Staggered entrance animation with bounce
  - Shadow and gradient overlay
- Desktop-only (hidden on mobile for performance)
- Images from different categories: tops, dresses, accessories, outerwear

### 3. **Interactive Particle Field** ✨
**File**: `src/components/animation/ParticleField.tsx`
- 50 interactive particles that respond to mouse movement
- Particles repel away from cursor (150px radius)
- Connected with lines when close to each other
- Terracotta-colored particles with varying opacity
- Canvas-based animation (requestAnimationFrame)
- Dynamically loaded (no SSR)
- Automatically disabled for reduced motion

### 4. **Gradient Background Blobs** 🎨
- Large, blurred gradient circles in brand colors:
  - Terracotta (top-right)
  - Sage green (bottom-left)
  - Blush (center)
- Creates depth and atmosphere
- 10% opacity for subtlety

### 5. **Subtle Texture Overlay** 🧶
- Knit pattern texture overlay
- 3% opacity
- Adds tactile quality to the design
- Reinforces brand identity (knit/fabric theme)

### 6. **Enhanced Main Hero Image** 📸
- Upgraded from simple rounded corners to:
  - Larger border radius (`rounded-2xl`)
  - Heavy shadow (`shadow-2xl`)
  - Multiple gradient overlays for depth
  - Decorative corner brackets (border accents)
  - Maintains parallax scroll effect

## 📦 New Dependencies

```json
{
  "@react-three/fiber": "^...",
  "@react-three/drei": "^...",
  "three": "^..."
}
```

## 🎯 Layer Stack (Bottom to Top)

```
1. Gradient blobs (background)
2. Interactive particles
3. 3D cloth simulation
4. Floating product images
5. Texture overlay
6. Main content (text + hero image)
```

## 🎬 Animation Timeline

```
0.0s → Page loads, preloader shows
2.8s → Preloader finishes
2.8s → Hero text reveals word-by-word
3.0s → Floating images start appearing (staggered)
3.2s → Subtitle fades in
3.4s → CTA buttons fade in
3.4s → Main hero image clip-path reveal
Ongoing → Particles respond to mouse
Ongoing → Cloth waves continuously
Ongoing → Floating images float and rotate
On scroll → Parallax effects for all images
```

## 🔧 Performance Optimizations

- **Dynamic imports**: 3D components only load on client
- **Reduced motion**: All animations disabled for accessibility
- **Canvas optimization**: Particles use efficient canvas API
- **Three.js**: Optimized geometry with reasonable polygon count
- **Desktop-only**: Floating images hidden on mobile
- **SSR disabled**: 3D components client-side only

## 🎨 Visual Impact

### Before:
- Simple split layout
- Single hero image
- Static background
- Minimal visual interest

### After:
- **Multi-layered depth** with 6+ visual layers
- **3D animated elements** (cloth simulation)
- **Interactive particles** that respond to cursor
- **Floating product previews** with parallax
- **Rich atmosphere** from gradients and textures
- **Premium feel** that matches high-end fashion brands

## 🚀 How to Use

The hero is now self-contained and works automatically:

```tsx
import HeroSection from '@/components/home/HeroSection'

export default function HomePage() {
  return <HeroSection />
}
```

## 🎛️ Customization Options

### Disable specific effects:
1. **Remove particles**: Comment out `<ParticleField />` in HeroSection.tsx
2. **Remove 3D cloth**: Comment out `<ClothSimulation />` in HeroSection.tsx
3. **Remove floating images**: Comment out `<FloatingProducts />` in HeroSection.tsx

### Adjust floating images:
Edit the `floatingImages` array in `FloatingProducts.tsx`:
- Change positions (top/left)
- Change sizes
- Change parallax speeds
- Add/remove images

### Customize cloth material:
Edit `ClothSimulation.tsx`:
```tsx
<meshStandardMaterial
  color="#C4795A"  // Change color
  roughness={0.7}   // Change surface roughness
  metalness={0.1}   // Change metallic property
/>
```

### Adjust particles:
Edit `ParticleField.tsx`:
- Change `particleCount` (line 39)
- Adjust mouse interaction radius (line 75)
- Change colors (line 106, 123)

## 📱 Responsive Behavior

- **Mobile (< 1024px)**:
  - Floating images hidden
  - 3D cloth visible but simpler
  - Particles visible
  - Main hero image full-width

- **Desktop (≥ 1024px)**:
  - All effects active
  - Floating images visible
  - Full mouse interactivity
  - Side-by-side layout

## ♿ Accessibility

- **Reduced motion**: All animations respect `prefers-reduced-motion`
- **Keyboard navigation**: Not affected (effects are decorative)
- **Screen readers**: Effects are visual-only, no content
- **Performance**: Automatically optimized for slower devices

## 🎭 Inspiration

This hero section is inspired by award-winning websites:
- Awwwards SOTD winners
- Premium fashion e-commerce (Ssense, Net-a-Porter)
- 3D interactive experiences
- Modern parallax designs

The result is a **premium, magazine-quality** hero that immediately communicates brand quality and craftsmanship.
