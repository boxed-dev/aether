# Vercel Deployment Guide

This guide provides step-by-step instructions for deploying the Aether Link monorepo to Vercel.

## Overview

The Aether Link monorepo consists of three separate Next.js applications:
- **API** (`@aether-link/api`) - Backend API server
- **Dashboard** (`@aether-link/dashboard`) - Admin interface for managing profiles and links
- **Renderer** (`@aether-link/renderer`) - Public-facing profile pages

Each app must be deployed as a **separate Vercel project** due to Vercel's one-project-per-deployment model.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Git Repository**: Code pushed to GitHub, GitLab, or Bitbucket
3. **PostgreSQL Database**: Options:
   - Vercel Postgres (recommended for simplicity)
   - Supabase (free tier available)
   - Railway (free tier available)
   - Neon (serverless Postgres)
   - Any PostgreSQL 16+ provider

4. **Environment Variables Ready**:
   - Generate `AUTH_SECRET`: `openssl rand -base64 32`
   - Have your `DATABASE_URL` ready

## Step 1: Set Up Database

### Option A: Vercel Postgres (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to "Storage" tab
3. Create a new Postgres database
4. Copy the connection string (format: `postgresql://user:password@host:port/database`)
5. Keep this for later use in environment variables

### Option B: External Provider

1. Create a PostgreSQL 16+ database with your chosen provider
2. Get the connection string (ensure it allows connections from Vercel IPs)
3. Note: Some providers require SSL - ensure your connection string includes `?sslmode=require` if needed

## Step 2: Deploy API

### Create Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your Git repository
4. **Configure Project**:
   - **Project Name**: `aether-link-api` (or your choice)
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/api`
   - **Build Command**: Leave empty (uses `vercel.json`)
   - **Install Command**: Leave empty (uses `vercel.json`)
   - **Output Directory**: `.next`

### Set Environment Variables

Add the following in Project Settings → Environment Variables:

```bash
DATABASE_URL=postgresql://user:password@host:port/database
NODE_ENV=production
```

**Important**: The `AUTH_SECRET` is NOT needed for the API (authentication is handled by the Dashboard).

### Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Note your deployment URL (e.g., `https://aether-link-api.vercel.app`)
4. Keep this URL for the next steps

### Run Database Migrations

After first deployment, run migrations from your local machine:

```bash
# Set the production DATABASE_URL temporarily
export DATABASE_URL="postgresql://user:password@host:port/database"

# Or on Windows:
# set DATABASE_URL=postgresql://user:password@host:port/database

# Push schema to production database
pnpm db:push
```

**Verify**: Check your database - you should see `users`, `profiles`, and `links` tables created.

## Step 3: Deploy Dashboard

### Create Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import the **same Git repository** (yes, again!)
4. **Configure Project**:
   - **Project Name**: `aether-link-dashboard` (or your choice)
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/dashboard`
   - **Build Command**: Leave empty (uses `vercel.json`)
   - **Install Command**: Leave empty (uses `vercel.json`)
   - **Output Directory**: `.next`

### Set Environment Variables

```bash
NEXT_PUBLIC_API_URL=https://aether-link-api.vercel.app
NEXT_PUBLIC_RENDERER_URL=https://aether-link-renderer.vercel.app
AUTH_SECRET=<your-generated-secret-from-openssl>
NODE_ENV=production
```

**Important**:
- Replace the URLs with your actual deployed URLs
- Use the SAME `AUTH_SECRET` you generated earlier
- Don't deploy yet! We need to deploy the renderer first to get its URL

### Temporary Deployment

If you haven't deployed the renderer yet, use a placeholder:

```bash
NEXT_PUBLIC_RENDERER_URL=https://placeholder.vercel.app
```

You can update this later after deploying the renderer.

## Step 4: Deploy Renderer

### Create Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import the **same Git repository** (third time!)
4. **Configure Project**:
   - **Project Name**: `aether-link-renderer` (or your choice)
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/renderer`
   - **Build Command**: Leave empty (uses `vercel.json`)
   - **Install Command**: Leave empty (uses `vercel.json`)
   - **Output Directory**: `.next`

### Set Environment Variables

```bash
NEXT_PUBLIC_API_URL=https://aether-link-api.vercel.app
NEXT_PUBLIC_RENDERER_URL=https://aether-link-renderer.vercel.app
NODE_ENV=production
```

**Note**: Replace with your actual deployed URLs.

### Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Note your deployment URL

### Update Dashboard Environment Variable

Now go back to your Dashboard project:

1. Settings → Environment Variables
2. Update `NEXT_PUBLIC_RENDERER_URL` with your actual renderer URL
3. Redeploy the dashboard (Deployments → Latest → Redeploy)

## Step 5: Configure CORS (If Needed)

The API middleware automatically handles CORS for:
- Localhost URLs (development)
- `*.vercel.app` domains (Vercel preview deployments)

If you use **custom domains**, you need to set the `ALLOWED_ORIGINS` environment variable in the API project:

```bash
ALLOWED_ORIGINS=https://yourdomain.com,https://dashboard.yourdomain.com
```

## Step 6: Set Up Custom Domains (Optional)

In each Vercel project, you can add custom domains:

### API
- Go to API project → Settings → Domains
- Add: `api.yourdomain.com`

### Dashboard
- Go to Dashboard project → Settings → Domains
- Add: `dashboard.yourdomain.com` or `admin.yourdomain.com`

### Renderer
- Go to Renderer project → Settings → Domains
- Add: `yourdomain.com` or `links.yourdomain.com`

**After adding custom domains:**

1. Update environment variables in Dashboard and Renderer projects
2. Update `ALLOWED_ORIGINS` in API project (if using custom domains)
3. Redeploy all projects

## Environment Variables Reference

### API Project

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NODE_ENV` | Yes | Environment mode | `production` |
| `ALLOWED_ORIGINS` | No | Custom CORS origins (comma-separated) | `https://app.com,https://admin.app.com` |

### Dashboard Project

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Yes | API base URL | `https://aether-link-api.vercel.app` |
| `NEXT_PUBLIC_RENDERER_URL` | Yes | Renderer base URL | `https://aether-link-renderer.vercel.app` |
| `AUTH_SECRET` | Yes | JWT secret (same as API) | `<openssl rand -base64 32>` |
| `NODE_ENV` | Yes | Environment mode | `production` |

### Renderer Project

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Yes | API base URL | `https://aether-link-api.vercel.app` |
| `NEXT_PUBLIC_RENDERER_URL` | Yes | Self URL (for redirects) | `https://aether-link-renderer.vercel.app` |
| `NODE_ENV` | Yes | Environment mode | `production` |

## Troubleshooting

### Build Fails: "Cannot find module '@aether-link/...'"

**Cause**: Workspace dependencies not properly installed.

**Solution**:
- Vercel uses `pnpm install --frozen-lockfile` which should handle this automatically
- Check that `pnpm-lock.yaml` is committed to git
- Ensure all `package.json` files have correct workspace references (`workspace:*`)

### Database Connection Error

**Symptoms**: API returns 500 errors or "database connection failed"

**Solutions**:
1. Verify `DATABASE_URL` is correct in Vercel environment variables
2. Check database allows connections from Vercel IPs (some providers require allowlisting)
3. For Vercel Postgres, ensure you're using the connection string from their dashboard
4. Try adding `?sslmode=require` to connection string if required by provider
5. Check database is running and accessible

### CORS Errors

**Symptoms**: Browser console shows "CORS policy" errors

**Solutions**:
1. Check `NEXT_PUBLIC_API_URL` in Dashboard/Renderer matches actual API URL
2. If using custom domains, add `ALLOWED_ORIGINS` env var to API
3. Ensure URLs don't have trailing slashes
4. Clear browser cache and try again

### "Module not found: Can't resolve 'postgres'"

**Cause**: Webpack trying to bundle server-side dependencies for client.

**Solution**: This is already handled in `next.config.js` with `serverComponentsExternalPackages`. If you see this error:
1. Ensure `next.config.js` has `serverComponentsExternalPackages: ['postgres', 'bcryptjs']`
2. Redeploy

### Large Bundle Size Warning

**Symptoms**: Vercel shows bundle size warnings for renderer

**Solution**: This is expected - the renderer includes Three.js for 3D graphics. The bundle is already optimized with:
- Code splitting for Three.js chunks
- Standalone output mode
- Dynamic imports where possible

Current bundle sizes are within acceptable limits (~100KB shared).

### Authentication Not Working

**Symptoms**: Can't log in, session not persisting

**Solutions**:
1. Ensure `AUTH_SECRET` is set in Dashboard project
2. Verify `NEXT_PUBLIC_API_URL` points to correct API
3. Check browser allows cookies (required for sessions)
4. Try incognito/private mode to rule out browser extensions

### Deployment Succeeds But Site Shows 404

**Cause**: Vercel routing to wrong directory or app.

**Solution**:
1. Verify "Root Directory" is set correctly (`apps/api`, `apps/dashboard`, or `apps/renderer`)
2. Check deployment logs for errors
3. Redeploy with "Clear Cache and Retry"

## Monitoring and Logs

### View Deployment Logs

1. Go to project in Vercel Dashboard
2. Click "Deployments"
3. Click on specific deployment
4. View "Build Logs" and "Function Logs"

### Runtime Logs

1. Go to project in Vercel Dashboard
2. Click "Logs" tab (or "Runtime Logs" in deployment details)
3. Filter by log level, time range, etc.

### Error Tracking

Consider adding error tracking:
- Sentry (free tier available)
- LogRocket
- Datadog
- Vercel Analytics (built-in)

## Rollback Procedure

If a deployment fails or causes issues:

1. Go to Vercel Dashboard → Project → Deployments
2. Find previous working deployment
3. Click "..." menu → "Promote to Production"
4. Confirm rollback

## Continuous Deployment

Vercel automatically deploys when you push to your repository:

- **Production**: Pushes to `main` branch deploy to production
- **Preview**: Pushes to other branches create preview deployments
- **Pull Requests**: Each PR gets a unique preview URL

To disable auto-deploy:
1. Project Settings → Git
2. Uncheck "Production Branch" or "Preview Deployments"

## Security Checklist

- [ ] `AUTH_SECRET` is strong and unique (32+ characters)
- [ ] `DATABASE_URL` includes credentials and is kept secret
- [ ] Environment variables are set in Vercel (not committed to git)
- [ ] CORS is properly configured (not using `*` wildcard in production)
- [ ] Database allows only necessary IP ranges
- [ ] SSL/TLS enabled for database connections
- [ ] All apps use HTTPS (automatic with Vercel)
- [ ] Rate limiting is active (built into API middleware)

## Performance Optimization

### Enable Vercel Analytics

1. Go to project → Analytics
2. Enable "Web Analytics"
3. Optionally enable "Speed Insights"

### Database Connection Pooling

For production, consider using connection pooling:
- Vercel Postgres includes this automatically
- For external databases, use PgBouncer or Supabase connection pooling

Example connection string with pooling:
```
postgresql://user:pass@host:6543/db?pgbouncer=true
```

### Caching

The API and apps already include:
- Next.js automatic static optimization
- Turborepo build caching
- Server-side caching where appropriate

## Costs

**Vercel Free Tier:**
- 100GB bandwidth/month
- Unlimited deployments
- Unlimited preview deployments
- 100GB-hours of serverless function execution

**Vercel Pro** ($20/month):
- 1TB bandwidth
- Advanced analytics
- Team collaboration features
- 1000GB-hours of serverless execution

**Database costs vary by provider** - check their pricing pages.

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Aether Link Issues**: File issues on your repository
- **Community**: Vercel Discord, Stack Overflow

## Next Steps

After successful deployment:

1. Test user registration and login
2. Create a test profile
3. Add test links
4. Visit public profile page
5. Set up monitoring/error tracking
6. Configure custom domains (optional)
7. Set up backups for database
8. Document your deployment URLs for team reference
