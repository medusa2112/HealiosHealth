# Fix Plan - Fix-and-Verify Trial Assignment
Date: 2025-08-17
Estimated Total Time: 2-3 hours

## Fix Checklist

### 1. ✅ Fix Health Endpoint Routing
**Root Cause**: Health endpoints not registered in server/routes.ts (missing import)
**Evidence**: `/api/health` returns HTML instead of JSON, healthRouter exists but not connected
**Changes**:
- Import and register healthRouter in server/routes.ts
- Ensure routes are registered before Vite middleware
**Test Method**: `curl http://localhost:5000/api/status` should return JSON
**Risk**: Low
**Time Estimate**: 15 minutes

### 2. ✅ Setup Test Environment with CSRF Bypass
**Root Cause**: CSRF protection blocks automated testing
**Evidence**: Line 403 error in auth requests
**Changes**:
- Add development-only CSRF bypass header option
- Document test header usage
**Test Method**: POST requests with bypass header succeed
**Risk**: Low (dev only)
**Time Estimate**: 30 minutes

### 3. ✅ Configure Admin Test User
**Root Cause**: No admin user seeded in development
**Evidence**: Admin routes return auth required, no setup script
**Changes**:
- Create admin seed script
- Add to development startup
- Document admin credentials
**Test Method**: Admin login and dashboard access
**Risk**: Low
**Time Estimate**: 30 minutes

### 4. ✅ Add Smoke Test Suite
**Root Cause**: No automated testing to validate fixes
**Evidence**: Vitest configured but no active tests
**Changes**:
- Create basic API smoke tests
- Add npm run smoke command
- Test both customer and admin flows
**Test Method**: `npm run smoke` passes
**Risk**: Low
**Time Estimate**: 45 minutes

### 5. ✅ Fix Registration Flow End-to-End
**Root Cause**: Multiple auth systems, unclear flow
**Evidence**: PIN auth configured but needs full test
**Changes**:
- Verify PIN email delivery in dev mode
- Test complete registration → login → action flow
- Document the flow
**Test Method**: Complete user journey succeeds
**Risk**: Medium
**Time Estimate**: 30 minutes

## Deferred Items (Document in RISKS.md)
- Git repository lock (environment issue)
- Production environment secrets
- Full test coverage
- Performance optimization

## Implementation Order
1. Health endpoints (foundation)
2. CSRF handling (enables testing)
3. Admin setup (enables admin testing)
4. Smoke tests (validates fixes)
5. Registration flow (validates customer path)

## Success Criteria
- [ ] All API health checks return JSON
- [ ] Can test APIs without CSRF errors
- [ ] Admin can login and manage products
- [ ] Customer can register, login, and checkout
- [ ] Smoke tests pass consistently
- [ ] Documentation complete