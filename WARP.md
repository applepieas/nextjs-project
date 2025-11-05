# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Overview

**DevEvent** is a Next.js 16 event discovery platform that showcases hackathons, meetups, and conferences. The app features a visually striking WebGL-powered light ray animation background, PostHog analytics integration, and a responsive event card interface.

## Core Architecture

### Client vs. Server
- **Client Components**: `LightRays.tsx`, `ExploreBtn.tsx`, `EventCard.tsx`, `Navbar.tsx` (all marked with `"use client"`)
- **Server Components**: `app/layout.tsx`, `app/page.tsx`
- Use server components as the default; mark with `"use client"` only when hooks or browser APIs are needed

### WebGL Animation System
`LightRays.tsx` is a complex client component that:
- Manages WebGL rendering using the `ogl` library (Renderer, Program, Triangle, Mesh)
- Uses GLSL shaders for animated light ray effects
- Supports parameterized ray origins (9 positions), colors, speed, spread, and mouse-following interactions
- Implements intersection observer to pause rendering when off-screen
- Includes cleanup logic for WebGL contexts and animation frames

The component uses a two-effect pattern:
1. Setup effect: Initializes WebGL when component becomes visible
2. Props effect: Updates shader uniforms when props change

### Event Data Flow
- Events data lives in `lib/constants.ts` (hardcoded array)
- Page component maps events to `EventCard` components
- Data structure: `{ image, title, slug, location, date, time }`

### Styling & UI
- Tailwind CSS v4 with CSS variables for theming
- shadcn/ui configured (components.json exists but no UI components currently used)
- Custom fonts: Schibsted Grotesk (body), Martian Mono (mono)
- Utility function: `cn()` in `lib/utils.ts` for merging Tailwind classes with clsx and tailwind-merge

### Analytics & Tracking
- PostHog integration configured in `instrumentation-client.ts`
- Environment rewrites in `next.config.ts` proxy PostHog requests through `/ingest` route
- Configured for EU data center

## Development Commands

```bash
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Create production build
npm start            # Run production build
npm run lint         # Run ESLint
```

### Running Single Lints
```bash
npx eslint <file.tsx>      # Lint specific file
npx eslint --fix <file.tsx> # Fix linting issues
```

## Key Files & Purpose

- `app/page.tsx` - Landing page with featured events list
- `app/layout.tsx` - Root layout with LightRays background and Navbar
- `components/LightRays.tsx` - WebGL light ray animation engine
- `components/EventCard.tsx` - Individual event card display
- `components/Navbar.tsx` - Navigation component
- `components/ExploreBtn.tsx` - CTA button component
- `lib/constants.ts` - Hardcoded event data
- `next.config.ts` - PostHog proxy rewrites
- `eslint.config.mjs` - ESLint config using flat config format (ESLint 9+)

## Important Notes

- **ESLint Configuration**: Uses new flat config format (`eslint.config.mjs`), not `.eslintrc.json`
- **TypeScript**: Strict mode enabled, path alias `@/*` maps to root directory
- **PostHog**: Rewrites configured to route analytics through local `/ingest` endpoint for privacy
- **WebGL Performance**: LightRays component uses `IntersectionObserver` to avoid rendering when not visible
- **Animations**: Mouse-following ray animation uses smooth interpolation (0.92 smoothing factor)
