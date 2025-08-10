# Admin Login Troubleshooting Guide

## ✅ Admin Accounts Are Configured

Both admin accounts have been successfully created in the database:

1. **Primary Admin**: `dn@thefourths.com`
   - User ID: `987ef3c7-a588-436a-b4c6-d7f9a7591cb7`
   - Role: `admin`
   - Status: Active and email verified

2. **Backup Admin**: `admin@healios.com`
   - User ID: `admin-2f4c122a-23a1-4a49-817a-f1e291607b57`
   - Role: `admin`
   - Status: Active and email verified

Both accounts use the password stored in the `ADM_PW` secret.

## 🔍 Troubleshooting Steps for LIVE System

### Step 1: Verify the ADM_PW Secret in Production

The admin password must match what's stored in the `ADM_PW` secret. In your Replit deployment:

1. Go to the Secrets tab in your Replit workspace
2. Ensure `ADM_PW` is set with your admin password
3. The password should be the same one you're trying to use to login

### Step 2: Check Rate Limiting

If you've attempted to login multiple times, the rate limiter may be blocking you:

- **Rate limit**: 5 login attempts per 15 minutes per IP
- **Wait time**: If blocked, wait 15 minutes before trying again
- **Alternative**: Try from a different network/device

### Step 3: Clear Browser Cache and Cookies

Sometimes old session data can interfere:

1. Open your browser's developer tools (F12)
2. Go to Application/Storage tab
3. Clear all cookies for your domain
4. Clear local storage and session storage
5. Try logging in again

### Step 4: Verify the Login URL

Make sure you're using the correct login endpoint:

- **Login page**: `https://your-domain.replit.app/login`
- **Admin email**: use an address from `ALLOWED_ADMIN_EMAILS` (e.g., `dn@thefourths.com` or `admin@healios.com`)
- **Password**: The value you set in `ADM_PW` secret

### Step 5: Check Database Connection

The production database must be accessible. You can verify this by:

1. Checking if the home page loads (it queries products)
2. Checking if other features work (newsletter signup, etc.)

### Step 6: Redeploy if Needed

If the admin setup was done after deployment:

1. Make a small change to trigger redeployment
2. Or manually redeploy from the Replit deployment panel
3. This ensures the latest code and database changes are live

## 🔐 Security Notes

- Admin emails are configured via the `ALLOWED_ADMIN_EMAILS` environment variable (comma-separated)
- Ensure `dn@thefourths.com` and `admin@healios.com` are included if they should have admin access
- The system uses bcrypt for password hashing
- Sessions are stored in PostgreSQL in production

## 💡 Quick Test

To verify your credentials are correct locally:

1. Make sure `ADM_PW` secret is set in Replit
2. The password you're entering should match exactly what's in `ADM_PW`
3. Use an email listed in `ALLOWED_ADMIN_EMAILS` (e.g., `dn@thefourths.com` or `admin@healios.com`)

## 📝 What to Check in Production Logs

Look for these log messages when attempting to login:

- `[LOGIN] Looking up user: dn@thefourths.com`
- `[LOGIN] User found: yes/no`
- `[LOGIN] Password verification: passed/failed`

If you see "User not found", the database may not have the admin account.
If you see "Password verification: failed", the password doesn't match.

## 🚀 Next Steps

1. **First**: Verify the `ADM_PW` secret matches your login password
2. **Second**: Wait 15 minutes if rate limited
3. **Third**: Clear browser cache and cookies
4. **Fourth**: Try the backup admin account (`admin@healios.com`)
5. **Fifth**: Redeploy if the admin was set up after the last deployment

The admin accounts are properly configured in the database. The most likely issue is either:
- Password mismatch (check `ADM_PW` secret)
- Rate limiting (wait 15 minutes)
- Browser cache (clear cookies)
- Deployment timing (redeploy if needed)