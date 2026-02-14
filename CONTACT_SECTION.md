# Premium Contact Section - Awwwards-Style

## 🎨 What Was Added

A stunning, award-winning inspired contact section positioned right before the footer, featuring the same premium animations and styling as the reference design.

## ✨ Features

### 1. **SVG Glow Effects** 🌟
- Radial gradient glows in brand colors (terracotta & sage)
- Blurred background elements for depth
- Similar to the reference design's ambient lighting

### 2. **Grain Texture Overlay** 📐
- Subtle noise texture (3% opacity)
- Mix-blend-mode overlay for premium feel
- Adds tactile quality to the design

### 3. **Animated Decorative Lines** ━━━
- Two horizontal lines with gradient effects
- Animated from center outward on scroll
- Terracotta (top) and sage (bottom) gradients
- Multiple overlapping lines for depth

### 4. **Interactive Email Button** ✉️
**Animations:**
- Arrow rotates -45deg on hover
- Email text slides up revealing duplicate text below
- Background transitions charcoal → terracotta
- Scale entrance animation (back.out easing)

**Structure:**
```
[Arrow Icon] HELLO@SNUGANDKNOT.COM
     ↓ (on hover)
[↗ Arrow]   [Text slides up]
```

### 5. **Premium Typography** 📝
- Heading: "LET'S CONNECT" in DM Serif Display
- Body text in Inter with perfect line spacing
- Email in JetBrains Mono (monospace) with tracking
- Copyright in small monospace

### 6. **Scroll-Triggered Animations** 📜
- Heading fades in from below
- Lines draw from center
- Email button scales in with bounce
- All triggered at 80-85% viewport

## 🎯 Visual Hierarchy

```
┌─────────────────────────────────┐
│     [Glow Effects Background]    │
│     [Grain Texture Overlay]      │
│                                  │
│        LET'S CONNECT             │
│                                  │
│     ━━━━━━━━━━━━━━━━━━━━        │  ← Animated line (terracotta)
│                                  │
│   Every collection tells a...    │
│   we'd love to hear from you.    │
│                                  │
│  [↗] HELLO@SNUGANDKNOT.COM      │  ← Hover to see magic!
│                                  │
│     ━━━━━━━━━━━━━━━━━━━━        │  ← Animated line (sage)
│                                  │
│  COPYRIGHT © 2026 | ALL RIGHTS   │
└─────────────────────────────────┘
```

## 🎨 Color Scheme

**Backgrounds:**
- Gradient: cream → cream-dark
- Glow 1: Terracotta (rgba(196, 121, 90, 0.6))
- Glow 2: Sage (rgba(139, 158, 132, 0.4))

**Lines:**
- Top line: Terracotta gradient
- Bottom line: Sage gradient

**Button:**
- Default: Charcoal background, Cream text
- Hover: Terracotta background, Cream text

**Text:**
- Heading: Charcoal
- Body: Walnut
- Copyright: Earth
- Email: Cream/Monospace

## 📐 Responsive Behavior

**Desktop (≥ 640px):**
- Full layout with all effects
- Larger text sizes
- Side-by-side copyright

**Mobile (< 640px):**
- Stacked layout
- Smaller text
- Vertical copyright
- All animations still active

## 🎬 Animation Timeline

```
User scrolls to section
    ↓
0.0s → Heading fades in from below (1s, expo.out)
0.1s → Top line draws from center (1.5s, expo.out)
0.2s → Bottom line draws from center (1.5s, expo.out)
0.3s → Email button scales in (1s, back.out)

On email hover:
    → Arrow rotates -45deg (0.5s)
    → Text slides up (0.5s)
    → Background changes to terracotta (0.5s)
```

## 🔧 Technical Implementation

**File:** `src/components/home/ContactSection.tsx`

**Dependencies:**
- GSAP for scroll animations
- ScrollTrigger for viewport detection
- Custom reduced motion hook

**Key Features:**
- Fully accessible (respects prefers-reduced-motion)
- SEO-friendly semantic HTML
- TypeScript strict mode compliant
- Responsive SVG graphics
- Optimized animations (GPU-accelerated)

## 🎭 Comparison to Reference Design

| Feature | Reference | Snug&Knot |
|---------|-----------|-----------|
| Glow effects | ✓ White glows | ✓ Brand color glows |
| Grain texture | ✓ Noise overlay | ✓ SVG noise pattern |
| Line animation | ✓ Dual lines | ✓ Gradient lines |
| Email hover | ✓ Arrow + slide | ✓ Arrow + slide |
| Typography | ✓ Inter Display | ✓ DM Serif + Inter |
| Scroll animations | ✓ GSAP | ✓ GSAP + ScrollTrigger |
| Reduced motion | ✗ Not shown | ✓ Full support |

## 🚀 How It Works

### Email Button Hover Effect

The email button uses a clever technique:
1. Two identical text elements stacked vertically
2. Container has `overflow: hidden`
3. On hover:
   - First text: `translateY(-100%)` (slides up, disappears)
   - Second text: `translateY(-100%)` from `top: 100%` (slides into view)
   - Creates seamless infinite slide effect

### Line Drawing Animation

Uses GSAP to animate SVG `<line>` attributes:
```javascript
gsap.from(lines, {
  attr: { x2: 0 },  // Start with 0 width
  duration: 1.5,     // Animate to full width
  ease: 'expo.out'   // Smooth easing
})
```

### Glow Effect

SVG radial gradients with multiple stops:
- Inner: High opacity color
- Middle: Low opacity color
- Outer: Transparent
- Blur filter: 54px for soft glow

## 💡 Customization

### Change Email:
```tsx
href="mailto:your@email.com"
// And update the text
HELLO@SNUGANDKNOT.COM → YOUR@EMAIL.COM
```

### Change Colors:
```tsx
// Glow colors
stopColor="rgb(196, 121, 90)" → your color

// Button hover
hover:bg-terracotta → hover:bg-yourcolor
```

### Change Text:
```tsx
"LET'S CONNECT" → "GET IN TOUCH"
"Every collection..." → Your message
```

### Disable Animations:
The section automatically disables animations for users with `prefers-reduced-motion` enabled.

## 📱 Mobile Optimizations

- Smaller padding on mobile (py-16 vs py-32)
- Smaller text sizes (text-base vs text-lg)
- Stacked copyright layout
- Touch-optimized button size (min-height 48px)

## ♿ Accessibility

- Semantic HTML (`<section>`, `<h2>`, `<a>`)
- Proper heading hierarchy
- Sufficient color contrast ratios
- Focus states on interactive elements
- Reduced motion support
- Screen reader friendly

## 🎨 Design Inspiration

This section draws inspiration from:
- Awwwards Site of the Day winners
- Premium fashion e-commerce (SSENSE, Net-a-Porter)
- Framer's design system
- Modern agency websites

The result is a contact section that feels **luxurious, interactive, and memorable** – perfectly matching the Snug&Knot brand identity.
