# Bug Log - Fix-and-Verify Trial Assignment
Date: 2025-08-17
Assessment Time: 13:00-13:10 UTC

## Red List (Critical Bugs)
### 1. API Health Endpoints Return HTML Instead of JSON
- **Surface**: Backend routing
- **Steps to Reproduce**: `curl http://localhost:5000/api/health` or `/api/status`
- **Expected**: JSON response with health status
- **Actual**: Returns full HTML page (Vite index.html)
- **Evidence**: Server logs show 200 response but content is HTML
- **Impact**: Health monitoring broken, API discovery affected

### 2. CSRF Protection Blocks API Testing
- **Surface**: Backend middleware
- **Steps to Reproduce**: `curl -X POST http://localhost:5000/api/auth/request-pin -d '{"email":"test@example.com"}'`
- **Expected**: Process authentication request
- **Actual**: Returns `{"error":"Invalid CSRF token","code":"CSRF_TOKEN_MISMATCH"}`
- **Evidence**: Line visible in workflow logs at 13:08:18
- **Impact**: Cannot test authentication flows via curl/Postman

### 3. Git Repository Lock
- **Surface**: Development environment
- **Steps to Reproduce**: Any git operation
- **Expected**: Normal git operations
- **Actual**: `.git/index.lock` prevents operations
- **Evidence**: Error message "Avoid changing .git repository"
- **Impact**: Cannot create feature branch per requirements

## Amber List (Risks/Warnings)
### 1. Mixed Authentication Systems
- **Risk**: Multiple auth implementations (PIN, OAuth, session-based)
- **Evidence**: Disabled files in `server/auth/` directory
- **Impact**: Complexity, potential security gaps

### 2. Development Secrets Using Fallbacks
- **Risk**: Using fallback secrets in development
- **Evidence**: Session secrets show "fallback" in startup logs
- **Impact**: Weak security in dev, potential production risk

### 3. No Active Test Coverage
- **Risk**: Vitest configured but no active tests running
- **Evidence**: Multiple test files exist but no test results
- **Impact**: Cannot validate fixes automatically

### 4. Admin Access in Development
- **Risk**: Admin routes accessible without proper authentication setup
- **Evidence**: `/api/admin/products` returns auth error but no admin user setup
- **Impact**: Cannot test admin functionality

## Green List (Working Features)
### 1. Server Startup ✅
- Express server starts successfully on port 5000
- Vite dev server integrated properly

### 2. Product API ✅
- `/api/products` returns valid JSON data
- Response time: ~2ms
- Data structure intact

### 3. Database Connection ✅
- PostgreSQL connected (evident from product data)
- Drizzle ORM functioning

### 4. Static Assets ✅
- Frontend loads successfully
- Videos and images serving properly
- Hero video loading confirmed

### 5. CSRF Token Generation ✅
- `/api/csrf/token` generates valid tokens
- Token format correct (64 char hex)

### 6. Session Management ✅
- Memory store configured
- Session cookies configured (hh_cust_sess, hh_admin_sess)

### 7. CORS Configuration ✅
- Properly configured for development origins
- Allows localhost:5000 and 127.0.0.1:5000

## Summary Statistics
- **Critical Issues (Red)**: 3
- **Risks (Amber)**: 4
- **Working (Green)**: 7
- **Overall Health**: 50% functional

## Priority Order for Fixes
1. Fix health endpoint routing (monitoring)
2. Setup proper test environment with CSRF handling
3. Configure admin authentication for testing
4. Resolve git lock issue
5. Add basic smoke tests