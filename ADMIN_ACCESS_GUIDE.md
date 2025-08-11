# 🔑 Admin Access Guide for dominic96

## Current Status
✅ **dominic96@replit.com is ALREADY configured as admin**
❌ **You're logged in as dominic@oricle.app (customer role)**

## Admin Emails List:
```
- dn@thefourths.com ✅ Admin
- admin@healios.com ✅ Admin  
- dominic96@replit.com ✅ Admin (YOUR ADMIN ACCOUNT)
- jv@thefourths.com ✅ Admin
```

## How to Get Admin Access

### Step 1: Logout from Current Session
Visit: `/api/logout`
This will clear your current customer session.

### Step 2: Login with Admin Account
1. Visit the login page  
2. Click "Login with Replit"
3. **IMPORTANT**: Make sure you login with `dominic96@replit.com` (NOT dominic@oricle.app)

### Step 3: Verify Admin Access
After login with dominic96@replit.com, the OAuth callback will:
- Detect your admin role
- Redirect you to `/admin` (admin dashboard)
- Give you full admin access

## Current OAuth Flow Working Correctly:
```
dominic@oricle.app → Customer Role → Redirect to / (homepage) ❌ (current)
dominic96@replit.com → Admin Role → Redirect to /admin ✅ (target)
```

## Quick Test:
1. Open new incognito window
2. Go to your site
3. Click login
4. Use dominic96@replit.com account
5. Should redirect to /admin automatically

## Database Status:
- dominic@oricle.app exists as customer in database
- dominic96@replit.com will be created as admin when you login with it

The system is working perfectly - you just need to login with the right account!