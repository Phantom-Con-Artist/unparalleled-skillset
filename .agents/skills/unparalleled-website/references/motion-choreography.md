# Motion Choreography & Spring Physics

Motion transforms a static website into a tactile, memorable experience. Motion must obey physics and purpose.

---

## 1. Physics Spring Curves

```css
:root {
  /* Fast micro-actions: buttons, badges, links */
  --ease-snappy: cubic-bezier(0.16, 1, 0.3, 1);
  --duration-fast: 160ms;

  /* Card elevation, menu expansions */
  --ease-smooth: cubic-bezier(0.22, 1, 0.36, 1);
  --duration-medium: 300ms;

  /* Hero entrances, full section reveals */
  --ease-dramatic: cubic-bezier(0.76, 0, 0.24, 1);
  --duration-slow: 600ms;
}
```

---

## 2. Scroll & Stagger Choreography

- **Limit Vertical Travel**: When revealing content on scroll, translate elements by no more than `24px`. Large travel (`100px`) feels dizzying and broken.
- **Stagger Items**: When displaying cards or list items, apply an animation delay of `50ms` between siblings.
- **Respect User Preferences**:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
  ```
