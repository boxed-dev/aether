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

## Deployment to Vercel

This monorepo is configured for Vercel deployment. Each app (api, dashboard, renderer) can be deployed independently.

### Prerequisites

1. A Vercel account
2. A PostgreSQL database (use Vercel Postgres, Supabase, Railway, or any PostgreSQL provider)
3. Your codebase pushed to GitHub/GitLab/Bitbucket

### Deployment Steps

#### 1. Import Project to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." -> "Project"
3. Import your Git repository
4. Vercel will auto-detect the monorepo structure

#### 2. Deploy Each App Separately

You need to create **3 separate projects** in Vercel (one for each app):

**Project 1: API** (`@aether-link/api`)
- **Root Directory**: `apps/api`
- **Framework**: Next.js
- **Build Command**: Uses `apps/api/vercel.json` (auto-detected)
- **Install Command**: Uses `apps/api/vercel.json` (auto-detected)
- **Environment Variables**:
  ```
  DATABASE_URL=postgresql://user:password@host:port/database
  NODE_ENV=production
  ```

**Project 2: Dashboard** (`@aether-link/dashboard`)
- **Root Directory**: `apps/dashboard`
- **Framework**: Next.js
- **Build Command**: Uses `apps/dashboard/vercel.json` (auto-detected)
- **Install Command**: Uses `apps/dashboard/vercel.json` (auto-detected)
- **Environment Variables**:
  ```
  NEXT_PUBLIC_API_URL=https://your-api-domain.vercel.app
  NEXT_PUBLIC_RENDERER_URL=https://your-renderer-domain.vercel.app
  AUTH_SECRET=<generate-with-openssl-rand-base64-32>
  NODE_ENV=production
  ```

**Project 3: Renderer** (`@aether-link/renderer`)
- **Root Directory**: `apps/renderer`
- **Framework**: Next.js
- **Build Command**: Uses `apps/renderer/vercel.json` (auto-detected)
- **Install Command**: Uses `apps/renderer/vercel.json` (auto-detected)
- **Environment Variables**:
  ```
  NEXT_PUBLIC_API_URL=https://your-api-domain.vercel.app
  NEXT_PUBLIC_RENDERER_URL=https://your-renderer-domain.vercel.app
  NODE_ENV=production
  ```

#### 3. Configure Database

After deploying the API:

```bash
# Set DATABASE_URL in Vercel project settings
# Then run migrations (from your local machine):
DATABASE_URL=<your-production-db-url> pnpm db:push
```

#### 4. Update CORS Settings (if needed)

If your dashboard and renderer are on different domains than the API, update the API's CORS middleware to allow those origins.

### Environment Variables

Generate a secure `AUTH_SECRET`:
```bash
openssl rand -base64 32
```

Use the **same** `AUTH_SECRET` value for both API and Dashboard.

### Custom Domains (Optional)

In each Vercel project settings, you can add custom domains:
- API: `api.yourdomain.com`
- Dashboard: `dashboard.yourdomain.com` or `admin.yourdomain.com`
- Renderer: `yourdomain.com` or `links.yourdomain.com`

### Troubleshooting

**Build fails with "Cannot find module":**
- Ensure all workspace dependencies are properly linked in `package.json`
- Vercel runs `pnpm install --frozen-lockfile` which installs all dependencies

**Database connection fails:**
- Verify `DATABASE_URL` is set correctly in Vercel environment variables
- Ensure database allows connections from Vercel's IP ranges
- For Vercel Postgres, use the connection string from their dashboard

**Large bundle size warning:**
- The renderer app includes Three.js which is large but necessary
- Code splitting is configured to optimize the bundle
- The API uses standalone output to minimize serverless function size

## License

MIT
