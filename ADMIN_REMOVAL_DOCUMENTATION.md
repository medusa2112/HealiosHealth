# Admin Removal from Production - Complete Documentation

## Overview
This document describes the complete implementation of removing admin functionality from production builds while maintaining a secure staging admin environment with controlled publishing workflows.

## Architecture

### 1. Build-Time Kill Switch

#### Configuration
- **Environment Variable**: `ADMIN_ENABLED`
  - `false` in production (enforced)
  - `true` in staging
  - Defaults to `true` in development

#### Implementation Files
- `server/config/adminConfig.ts` - Server-side admin configuration
- `client/src/config/adminConfig.ts` - Client-side admin configuration
- `server/middleware/adminAccess.ts` - Admin access control middleware

#### Production Safety
- Server fails to start if `ADMIN_ENABLED=true` in production
- All admin routes return 404 when admin is disabled
- Client conditionally loads admin components based on environment

### 2. Staging Admin Hardening

#### Access Controls
1. **Primary Authentication**
   - Session-based authentication via `/api/auth/admin/login`
   - Separate admin session cookie: `hh_admin_sess`
   - 4-hour session timeout

2. **IP Allowlisting** (when `ADMIN_IP_ALLOWLIST` is set)
   - Comma-separated list of allowed IPs
   - Checks X-Forwarded-For, X-Real-IP headers
   - Returns 403 for unauthorized IPs

3. **Rate Limiting**
   - 5 requests per 15 minutes in production
   - 100 requests per 15 minutes in development
   - Configurable via environment variables

#### Audit Logging
- All admin actions are logged with:
  - Admin ID and email
  - Action type
  - Request details (path, method, IP, user agent)
  - Request/response bodies (for successful requests)
  - Timestamp and duration

### 3. Content Publishing Workflow

#### Endpoints
- `POST /api/admin/publish` - Publish content from staging to production
- `GET /api/admin/snapshots` - List available content snapshots
- `POST /api/admin/rollback/:snapshotId` - Rollback to a previous snapshot
- `GET /api/admin/history` - View publish history

#### Publish Process
1. Create snapshot of current content
2. Validate data integrity
3. Export staging data
4. Push to production (via CI/CD in real deployment)
5. Log audit trail

#### Snapshot System
- Automatic snapshots before each publish
- JSON format stored in `./snapshots/` directory
- Includes products, bundles, and discount codes
- 30+ day retention (configurable)

### 4. Environment Configuration

#### Development (.env.development)
```bash
NODE_ENV=development
ADMIN_ENABLED=true
ADMIN_AUDIT_LOG=false
```

#### Staging (.env.staging)
```bash
NODE_ENV=staging
ADMIN_ENABLED=true
ADMIN_IP_ALLOWLIST=<comma-separated-ips>
ADMIN_AUDIT_LOG=true
ADMIN_SESSION_SECRET=<unique-secret>
```

#### Production (.env.production)
```bash
NODE_ENV=production
ADMIN_ENABLED=false
# Admin configuration not needed - completely removed
```

### 5. Security Features

#### CSRF Protection
- Separate CSRF tokens for customer and admin surfaces
- Token validation on all state-changing operations
- Tokens refreshed on each session

#### Session Security
- HTTPOnly cookies
- Secure flag in production
- SameSite=strict for admin cookies
- Different session secrets for customer/admin

#### Request Logging
- Comprehensive request/response logging
- Structured logging with correlation IDs
- Error tracking and alerting

## Testing

### Unit Tests
```bash
# Test admin route exclusion
npm test -- --grep "admin removal"
```

### E2E Tests
```bash
# Test staging admin workflow
npm run test:e2e:staging

# Verify production has no admin
npm run test:e2e:production
```

### Security Tests
```bash
# Test IP allowlisting
curl -X GET https://staging.site.com/api/admin \
  -H "X-Forwarded-For: 192.168.1.1"

# Should return 403 if IP not in allowlist
```

## Deployment

### Staging Deployment
```bash
# Set environment variables
export ADMIN_ENABLED=true
export ADMIN_IP_ALLOWLIST="<allowed-ips>"
export ADMIN_AUDIT_LOG=true

# Deploy
npm run deploy:staging
```

### Production Deployment
```bash
# Admin is automatically disabled
export ADMIN_ENABLED=false

# Deploy
npm run deploy:production

# Verify no admin routes
curl https://production.site.com/api/admin
# Should return 404
```

## Rollback Procedure

### Content Rollback
1. Access staging admin
2. Navigate to Publish History
3. Select snapshot to rollback to
4. Click "Rollback" and confirm
5. Verify content restored

### Code Rollback
1. Identify previous deployment artifact
2. Re-deploy previous version
3. Verify functionality restored

## Monitoring

### Metrics to Track
- Admin login attempts (success/failure)
- Publish operations (count, duration, success rate)
- Unauthorized access attempts
- Rate limit violations

### Alerts
- Failed admin logins > 5 in 5 minutes
- Publish operation failures
- Unauthorized IP access attempts
- Production admin access attempts (critical)

## Runbook

### How to Edit Products
1. Login to staging admin: `https://staging.site.com/admin/login`
2. Navigate to Products section
3. Make necessary edits
4. Preview changes
5. Click "Publish to Production"
6. Confirm publish operation
7. Verify on production site

### How to Add Admin Users
1. Admin users must be created via database access
2. Use bcrypt to hash passwords
3. Insert into users table with role='admin'
4. Test login on staging environment

### Emergency Procedures
1. **If admin exposed in production**:
   - Immediately set `ADMIN_ENABLED=false`
   - Redeploy application
   - Audit access logs
   - Rotate all admin credentials

2. **If staging compromised**:
   - Disable admin access
   - Review IP allowlist
   - Audit recent admin actions
   - Reset all admin passwords

## Acceptance Criteria Checklist

- [x] Production build artifact contains no admin code
- [x] `/api/admin/*` returns 404 in production
- [x] Staging admin requires authentication
- [x] IP allowlisting functional when configured
- [x] Rate limiting applied to admin routes
- [x] Audit logging captures all admin actions
- [x] Content snapshot system operational
- [x] Publish workflow from staging to production
- [x] Rollback functionality tested
- [x] Documentation complete and accurate

## Architecture Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   Development   │────▶│     Staging     │────▶│   Production    │
│                 │     │                 │     │                 │
│ ADMIN_ENABLED=  │     │ ADMIN_ENABLED=  │     │ ADMIN_ENABLED=  │
│     true        │     │     true        │     │     false       │
│                 │     │                 │     │                 │
│  Full Admin UI  │     │  Secured Admin  │     │   No Admin UI   │
│                 │     │  IP Allowlist   │     │   404 on /admin │
│                 │     │  Audit Logging  │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                              │                           ▲
                              │                           │
                              └───────────────────────────┘
                                    Publish Workflow
                                    (One-way sync)
```

## Support

For issues or questions regarding the admin system:
1. Check this documentation
2. Review audit logs in staging
3. Contact DevOps team for infrastructure issues
4. File a ticket for feature requests or bugs