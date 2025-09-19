# Inventory Report - Fix-and-Verify Trial Assignment
Date: 2025-08-17
Branch: main (unable to create new branch due to git lock)

## Stack Overview
- **Frontend**: React 18 + TypeScript + Vite 7.1.2
- **Backend**: Express.js + TypeScript (Node.js with ESM)
- **Database**: PostgreSQL with Drizzle ORM 0.39.1
- **Styling**: Tailwind CSS 3 + Radix UI
- **State Management**: TanStack Query v5 + React Context
- **Authentication**: PIN-based email auth (Resend API) + Admin OAuth
- **Payment**: PayStack integration (live production keys)
- **Package Manager**: npm
- **Node Version**: Not specified (requires verification)

## Application Entrypoints
- **Development Command**: `npm run dev` → `NODE_ENV=development tsx server/index.ts`
- **Build Command**: `npm run build` → Vite + ESBuild
- **Production Command**: `npm start` → `NODE_ENV=production node dist/index.js`
- **Database Migrations**: `npm run db:push` → Drizzle Kit push

## Port Configuration
- **Primary Port**: 5000 (combined frontend + backend via Vite middleware)
- **Vite Dev Server**: Integrated with Express

## Environment Variables
### Required
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Express session secret
- `SESSION_SECRET_CUSTOMER` - Customer session secret
- `SESSION_SECRET_ADMIN` - Admin session secret

### API Keys & Services
- `PAYSTACK_SECRET` - Payment processing
- `RESEND_API_KEY` - Email delivery
- `OPENAI_API_KEY` - AI chatbot
- `GOOGLE_MAPS_API_KEY` - Address validation
- `GOOGLE_MAPS_BACKEND_KEY` - Backend address validation

### Configuration
- `NODE_ENV` - development/production
- `PROD_ORIGINS` - Production CORS origins
- `DEV_ORIGINS` - Development CORS origins
- `ADMIN_IP_ALLOWLIST` - IP restrictions for admin
- `ADMIN_2FA_ENABLED` - Two-factor auth toggle
- `ADM_PW` - Admin password (legacy)

## Database Schema
- **Main Tables**: users, products, orders, carts, subscriptions, admins
- **Product Features**: variants, bundles, pre-orders, stock tracking
- **Email System**: email_events, newsletter_subscribers
- **Authentication**: PIN verification, OAuth providers

## Current Workflow Status
- **Start application**: Running successfully
- **Server**: Active on port 5000
- **Frontend**: Accessible via browser
- **API Endpoints**: Mixed responses (some working, some need auth)

## Dependencies Summary
- **Total npm packages**: 200+ dependencies
- **Critical dependencies**: Express, React, Drizzle, PayStack, Resend
- **Build tools**: Vite, ESBuild, TypeScript, Tailwind
- **Testing**: Vitest configured but minimal test coverage

## File Structure
```
/
├── client/           # React frontend
│   ├── src/
│   │   ├── pages/   # Route components
│   │   ├── components/
│   │   └── hooks/
├── server/          # Express backend
│   ├── routes/      # API endpoints
│   ├── lib/         # Utilities
│   ├── middleware/
│   └── auth/
├── shared/          # Shared types/schemas
├── attached_assets/ # Static assets
├── docs/           # Documentation (being created)
└── migrations/     # Database migrations
```

## Security Features
- CSRF protection (custom implementation)
- Session-based authentication
- Rate limiting on auth endpoints
- CSP headers configured
- Admin access restrictions in production