# Assessment Studio — Canonical Design System

**Status:** Approved design system authority  
**Version:** 1.0  
**Stack:** Next.js (App Router) + React + Tailwind CSS + Lucide Icons + Recharts  
**Intelligence Source:** UI UX Pro Max v2.15.0 evaluated against Product & Architecture Specification v1.1  

---

## 1. Design Goals & Core Aesthetic

Assessment Studio is a mobile-first, Vietnamese-focused SaaS platform for structured self-assessment and data-driven career readiness.
- **Tone:** Trustworthy, calm, credible, modern, data-first.
- **Mobile-first:** Optimized for 360px–430px smartphone viewports while scaling gracefully to tablet and desktop.
- **Truthful & Authentic:** Zero fake social proof, zero fake urgency/timers, zero medical claims.
- **Accessibility:** WCAG 2.2 AA compliance, visible keyboard focus rings, color-independent state indicators, full keyboard operability.

---

## 2. Color Palette & Design Tokens

We employ a high-contrast, calm "Trust Blue & Slate" palette with purposeful emerald and amber accents for scoring dimensions.

| Token | CSS Variable / Tailwind | Hex Value | Usage | Contrast vs Background |
|-------|-------------------------|-----------|-------|------------------------|
| **Background (Light)** | `bg-slate-50` | `#F8FAFC` | Main application canvas | Base |
| **Surface / Card** | `bg-white` | `#FFFFFF` | Question cards, result tiles, modals | Surface |
| **Foreground / Text** | `text-slate-900` | `#0F172A` | Primary headings and labels | 14.5:1 (AAA) |
| **Muted Text** | `text-slate-600` | `#475569` | Subheadings, descriptions, meta | 6.5:1 (AA) |
| **Border** | `border-slate-200` | `#E2E8F0` | Dividers, card boundaries, input strokes | 1.3:1 (structural) |
| **Primary (Brand)** | `bg-blue-600` | `#2563EB` | Primary buttons, active indicators, step progress | 4.6:1 against white |
| **Primary Hover** | `bg-blue-700` | `#1D4ED8` | Hover/active states | 6.2:1 against white |
| **CTA Accent** | `bg-blue-600` | `#2563EB` | Start assessment CTA, view full report | Standardized brand CTA |
| **Dimension 1 (Analytical)** | `emerald-600` | `#059669` | Analytical thinking visualization | 5.2:1 |
| **Dimension 2 (Problem Solving)** | `blue-600` | `#2563EB` | Problem solving visualization | 4.6:1 |
| **Dimension 3 (AI Literacy)** | `indigo-600` | `#4F46E5` | AI literacy visualization | 5.8:1 |
| **Dimension 4 (Adaptability)** | `amber-600` | `#D97706` | Adaptability visualization | 4.7:1 |
| **Error / Destructive** | `text-rose-600` / `bg-rose-50` | `#E11D48` | Form validation errors, warnings | 4.8:1 |

---

## 3. Typography & Vietnamese Diacritics

We use clean system sans-serif with fallbacks to `Plus Jakarta Sans` or modern system fonts (`system-ui`, `-apple-system`, `Segoe UI`, `Roboto`) optimized for Vietnamese accents and diacritics without clipping or font shifting.

- **Display / H1:** `text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl`
- **Section Heading / H2:** `text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl`
- **Card Heading / H3:** `text-lg font-semibold text-slate-900`
- **Body Regular:** `text-base text-slate-700 leading-relaxed`
- **Small / Helper:** `text-sm text-slate-500`
- **Tiny / Badge:** `text-xs font-medium uppercase tracking-wider`

---

## 4. Spacing, Radii & Elevation

- **Radii:**
  - Buttons & Inputs: `rounded-lg` (8px) or `rounded-xl` (12px)
  - Cards & Containers: `rounded-xl` (12px) or `rounded-2xl` (16px)
  - Badges: `rounded-full`
- **Elevation / Shadows:**
  - Minimal elevation: `shadow-sm` on resting cards, `shadow-md` on hover.
  - Avoid heavy, muddy multi-layer drop shadows.
  - 1px crisp border `border border-slate-200` guarantees boundary legibility in all lighting conditions.

---

## 5. Interaction States & Control Behaviors

### 5.1 Question Card & Answer Options
- **One Question Per View:** Focused layout reducing cognitive fatigue on mobile.
- **Answer Option Sizing:** Minimum 48px touch target height for mobile tapping.
- **Resting State:** `border border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50/80`
- **Selected State:** `border-2 border-blue-600 bg-blue-50/50 text-blue-900 font-medium`
- **Focus Visible:** `focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2`
- **Numbered Scale (1..5):** Clear visual pill indicator with label text.

### 5.2 Form Inputs
- Clear floating or top-aligned labels with `htmlFor` attributes.
- Native HTML5 validation complemented by accessible `aria-invalid` and `aria-describedby` error containers.
- Required indicator marked with red asterisk and screen-reader accessible text.

### 5.3 Buttons & Navigation
- **Primary CTA:** Solid blue fill, white bold text, `transition-all duration-150 active:scale-[0.98]`.
- **Secondary / Back Button:** Neutral outline `border border-slate-300 text-slate-700 hover:bg-slate-100`.
- **Disabled State:** `opacity-50 cursor-not-allowed pointer-events-none`.

---

## 6. Data Visualization & Radar Chart Rules

1. **Dual Representation (WCAG Non-Text Contrast):**
   - The SVG radar chart (`Recharts` / pure SVG) is ALWAYS paired with a semantic data table or detailed score cards listing exact numerical scores (0–100%) and qualitative band descriptors.
   - Users with screen readers or cognitive impairments must never be blocked by graphical charts.
2. **Chart Styling:**
   - Grid lines: Subdued `stroke="#CBD5E1"` (slate-300) with dashed lines.
   - Radar polygon fill: Semi-transparent `fill="#2563EB" fillOpacity={0.25}` with stroke `stroke="#2563EB" strokeWidth={2.5}`.
   - Axis labels: Clear Vietnamese dimension titles in `fill="#334155"` font size 12px–13px.
3. **Responsive Chart Container:**
   - On mobile screens (<430px), chart height is capped at 280px–320px with sufficient padding to prevent label truncation.

---

## 7. Responsive Layout Rules

- **Mobile (360px – 430px):** Single column, 16px horizontal padding (`px-4`), full-width touch buttons, sticky bottom navigation if necessary.
- **Tablet (768px – 1023px):** 24px horizontal padding (`px-6`), 2-column dimension grids, centered assessment card max-w-xl.
- **Desktop (1024px+):** 32px horizontal padding (`px-8`), max-w-5xl or max-w-6xl container, balanced 4-column feature grids, side-by-side radar and score breakdown.

---

## 8. Accessibility & Reduced Motion

- **Focus Rings:** Explicit visible outline on all keyboard-focusable interactive elements: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2`.
- **Reduced Motion:** Respect user preferences via `@media (prefers-reduced-motion: reduce)`:
  - Transition durations forced to `0ms`.
  - Animations replaced with immediate state render.
- **Semantic Hierarchy:** Single `<h1>` on every page, logical `<h2>` and `<h3>` hierarchy.
- **Touch Targets:** All clickable controls have a minimum target of 44x44px.

---

## 9. Anti-Patterns Explicitly Banned

1. **NO Fake Social Proof:** Do not render fake "5,000+ users tested today" or fabricated testimonials.
2. **NO Fake Urgency:** Do not render countdown timers or fake "Only 3 free reports left" banners.
3. **NO Generic AI Purple Gradients:** Do not use clichéd violet/fuchsia AI vaporware aesthetics.
4. **NO Pure Glassmorphism Without Contrast:** Do not use semi-transparent text on low-contrast frosted backgrounds.
5. **NO Unlabeled Visual Charts:** Do not show radar charts without text alternatives.
6. **NO Medical/Psychological Claims:** Do not label scores as "IQ", "EQ", or "bệnh lý/tâm lý".
