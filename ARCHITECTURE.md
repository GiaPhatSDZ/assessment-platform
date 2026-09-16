# Architecture Boundaries & Principles

This document records the architectural boundaries of `assessment-platform`.

## 1. Domain Layer (`src/domain/`)
- Pure business logic, types, and mathematical formulas.
- Zero dependencies on React, Next.js, databases, or external AI providers.
- Sub-domains: `assessment`, `referral`, `report`.
- Deterministic scoring is authoritative.

## 2. Application Layer (`src/application/`)
- Use cases, ports, and interfaces (`session-store.ts`, `assessment-repository.ts`, `report-generator.ts`, `analytics.ts`).
- Coordinates domain entities and infrastructure adapters.

## 3. Infrastructure Layer (`src/infrastructure/`)
- Concrete adapters for external systems:
  - `database/`: Supabase client and PostgreSQL repositories.
  - `ai/`: Provider adapters (OpenAI, Gemini, Mock) and prompt builders.
  - `auth/`: Anonymous visitor cookies and session verification.
  - `analytics/`: First-party event logger and optional PostHog adapter.
  - `browser/`: Local session store fallback.

## 4. UI Layer (`app/`, `components/`)
- Presentation components and Next.js App Router pages.
- Components only render state and invoke application actions; never compute canonical scores.
