# Aether Link

A modern, high-performance link-in-bio platform built with a hyper-resilient architecture. Features GPU-tiered 3D rendering, physics-based interactions, and a fully typed monorepo structure.

## Tech Stack

- **Monorepo**: Turborepo 2.x with pnpm workspaces
- **Framework**: Next.js 15 (App Router), React 19
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS 3.4
- **Database**: PostgreSQL 16 with Drizzle ORM
- **Authentication**: NextAuth.js v5 (Auth.js)
- **State Management**: TanStack Query
- **3D/Graphics**: Three.js with GPU-tiered rendering
- **Testing**: Vitest (unit), Playwright (E2E)

## Project Structure

```
aether-link/
├── apps/
│   ├── api/          # Backend API (Next.js, port 3001)
│   ├── dashboard/    # Admin dashboard (Next.js, port 3000)
│   └── renderer/     # Public profile pages (Next.js, port 3002)
├── packages/
│   ├── core-logic/   # Shared business logic (Result pattern)
│   ├── db/           # Database layer (Drizzle, repositories)
│   ├── ui/           # Shared UI components
│   └── three-utils/  # 3D rendering utilities
```

## Quick Start

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env

# Start PostgreSQL (local development)
pnpm docker:up

# Push database schema
pnpm db:push

# Start all dev servers
pnpm dev
```

The apps will be available at:
- **Dashboard**: http://localhost:3000
- **API**: http://localhost:3001
- **Renderer**: http://localhost:3002

## Scripts

```bash
pnpm dev          # Start all dev servers
pnpm build        # Build all packages
pnpm test         # Run unit tests
pnpm test:e2e     # Run E2E tests
pnpm db:push      # Push schema to database
pnpm docker:up    # Start PostgreSQL container
pnpm docker:down  # Stop PostgreSQL container
```

## Architecture

- **Result Pattern**: All operations return `Result<T>` instead of throwing exceptions
- **Hexagonal Architecture**: Clean separation between API routes, services, and repositories
- **Dependency Injection**: Easy swapping between real and mock implementations
- **GPU-Tiered Rendering**: Automatic detection and fallback for different GPU capabilities

## License

MIT
