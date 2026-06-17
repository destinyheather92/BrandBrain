# BrandBrain Project Bootstrap Guide

## Purpose

This document defines the Day 1 setup instructions for BrandBrain.

Every coding agent must follow this setup before implementing product features.

---

# Tech Stack

## Frontend

- Next.js App Router
- React
- TypeScript
- Tailwind CSS

## Backend

- Next.js Server Actions
- Next.js Route Handlers

## Database

- Neon Postgres
- Prisma ORM

## Authentication

- Clerk

## Storage

- UploadThing

## AI Providers

- OpenAI
- Ideogram
- Flux
- Imagen

## Testing

- Vitest
- React Testing Library
- Playwright

## Deployment

- Vercel

---

# Required Project Rules

- TypeScript strict mode enabled
- TDD required before major implementation
- Feature-based architecture
- Service layer required
- Repository layer required
- Zod validation required
- Prisma only for database access
- AI responses must be structured and validated
- Canvas JSON is the source of truth

---

# Recommended Folder Structure

```txt
src/
  app/
    (auth)/
    dashboard/
    brands/
    projects/
    editor/
    api/
  components/
    ui/
    layout/
  features/
    brands/
      actions/
      components/
      repositories/
      schemas/
      services/
      tests/
      types/
    brand-memory/
    content-intelligence/
    projects/
    canvas/
    editor/
    themes/
    ai/
    assets/
    exports/
    templates/
    versions/
  lib/
    auth.ts
    prisma.ts
    clerk.ts
    uploadthing.ts
    openai.ts
    env.ts
    result.ts
  hooks/
  providers/
  styles/
  types/
  tests/