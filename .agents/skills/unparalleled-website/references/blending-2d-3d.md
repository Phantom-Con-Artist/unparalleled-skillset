# Blending 2D & 3D Subtly in Web Craft

> *"3D should never feel like an unanchored game engine canvas pasted behind flat text. The highest craft emerges when 2D graphic precision and 3D physical depth interlock seamlessly."*

---

## 1. The Core Invariants of Subtle 2D/3D Blending

1. **Depth Without Gimmickry**:
   - 3D elements must obey the same lighting angle and color temperature as 2D cards and typography.
   - Never float arbitrary spinning 3D geometric shapes that have no connection to the Vocabulary.
2. **Layer Interlocking**:
   - 2D typography should occasionally slip behind or interlock with 3D elements (e.g., large display text partially occluded by a dimensional product slice, or subtle depth parallax).
3. **Specular Refraction & Edge Lighting**:
   - Use CSS 3D transforms (`perspective`, `rotateX`, `rotateY`, `translateZ`) coupled with dynamic mouse-tilt gradients (`radial-gradient(circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.15), transparent 60%)`).

---

## 2. Practical Techniques for 2D/3D Harmony

### A. The Interactive 3D Tilt Card (Pure CSS + Light JS)
Creates genuine tactile weight when the user hovers over a card or preview:

```css
.card-3d-wrapper {
  perspective: 1000px;
}

.card-3d-surface {
  transform-style: preserve-3d;
  transition: transform 240ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 240ms ease;
  will-change: transform;
}

/* Layering depth inside the card */
.card-3d-bg {
  transform: translateZ(0px);
}
.card-3d-content {
  transform: translateZ(24px); /* Floats forward in 3D space */
}
.card-3d-badge {
  transform: translateZ(48px); /* Pops higher */
}
```

```javascript
// Lightweight mouse-tracking tilt
document.querySelectorAll('.card-3d-surface').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'rotateX(0deg) rotateY(0deg)';
  });
});
```

---

### B. Ambient Directional Shading & Rim Lighting
- Combine a dark 2D canvas with subtle 3D rim shadows (`box-shadow: 0 20px 40px -10px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.15)`).
- Layer SVG noise or organic texture over 3D gradients with `mix-blend-mode: overlay` to ground rendered geometry into tactile material.

---

### C. Lightweight Canvas / WebGL Particle & Wave Accents
- If using canvas or Three.js, keep the polycount lean and constrain rendering to atmospheric background depth or interactive cursor ribbons.
- Always provide immediate fallback if WebGL is unavailable or if `prefers-reduced-motion` is enabled.
