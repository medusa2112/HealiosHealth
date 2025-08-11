# Admin Access Guide for Healios Health Platform

## Current Authentication System
Your Healios platform uses **Replit OAuth authentication** for admin access. This is a secure, modern approach that eliminates the need for traditional username/password combinations.

## Authorized Admin Emails
The following emails are configured as administrators:
- `dn@thefourths.com`
- `admin@healios.com`

## How to Access the Admin Dashboard

### Method 1: Replit OAuth Login (Primary)
1. Navigate to `/api/login` on your domain
2. This will redirect you to Replit's OAuth authentication
3. Sign in with your Replit account (must use one of the authorized emails)
4. After successful authentication, you'll be redirected to the admin dashboard

### Method 2: Direct Admin Page
1. Go to `/admin` on your domain
2. If not logged in, you'll be redirected to authenticate
3. Complete the Replit OAuth flow
4. Access granted if your email is authorized

## Why No Username/Password?
- **Enhanced Security**: OAuth eliminates password storage and management
- **Single Sign-On**: Uses your existing Replit account
- **No Password Risks**: No passwords to forget, steal, or compromise
- **Automatic Updates**: Security patches handled by Replit

## Troubleshooting

### "Login form shows but doesn't work"
The traditional login form at `/admin-login` is a legacy component. Use `/api/login` instead for Replit OAuth.

### "Access Denied after login"
Ensure your Replit account email matches one of the authorized admin emails exactly.

### "Can't find login button"
Navigate directly to `/api/login` to initiate the OAuth flow.

## Technical Details
- Authentication handled by: `server/replitAuth.ts`
- Session management: Secure HTTP-only cookies
- Authorization check: Email verification against allowed list
- Session duration: 7 days in production, 2 hours in development

## Security Features
- OAuth 2.0 with OpenID Connect
- Secure session cookies (httpOnly, sameSite: strict)
- HTTPS-only in production
- Rate limiting on authentication endpoints
- CSRF protection enabled

## For Developers
To add a new admin:
1. Add their email to the `ALLOWED_ADMIN_EMAILS` environment variable
2. They must have a Replit account with that email
3. No database changes needed - authorization is email-based

## Support
If you need help accessing the admin dashboard:
1. Verify your Replit account email
2. Check that it matches an authorized admin email
3. Try clearing cookies and logging in again
4. Use the direct OAuth URL: `/api/login`