# Production Admin Setup

## Overview
This document outlines the production admin configuration for the Healios platform.

## Admin Credentials

### Primary Admin Account
- **Email**: `dn@thefourths.com`
- **Password**: Stored in `ADM_PW` secret
- **Role**: admin
- **Status**: Active, Email Verified
- **Note**: Ensure this email is listed in `ALLOWED_ADMIN_EMAILS`

### Backup Admin Account
- **Email**: `admin@healios.com`
- **Password**: Stored in `ADM_PW` secret (same as primary)
- **Role**: admin
- **Status**: Active, Email Verified
- **Note**: Ensure this email is listed in `ALLOWED_ADMIN_EMAILS`

## Setup Instructions

### 1. Ensure ADM_PW Secret is Set
The `ADM_PW` secret must be configured in your Replit secrets before running the setup.

### 2. Run Production Admin Setup
```bash
npx tsx scripts/setup-production-admin.ts
```

This script will:
- Create or update the primary admin account (dn@thefourths.com)
- Create or update the backup admin account (admin@healios.com)
- Set both accounts with the password from ADM_PW secret
- Mark both accounts as email verified and active

### 3. Verify Admin Access
After setup, you can verify admin access by:
1. Logging in at `/login` with either admin email
2. Accessing admin dashboard at `/admin`
3. Both accounts have full admin privileges

## Security Notes

1. **Password Storage**: The ADM_PW secret is never exposed in logs or console output
2. **Both Admins**: Both admin accounts use the same password for consistency
3. **Role Assignment**: Admin role is granted to emails listed in the `ALLOWED_ADMIN_EMAILS` environment variable
4. **Session Management**: Uses PostgreSQL-backed sessions in production for persistence

## Testing Admin Login

To test admin login programmatically:
```bash
node test-production-admin-login.mjs  # Tests dn@thefourths.com
node test-backup-admin-login.mjs      # Tests admin@healios.com
```

## Admin Capabilities

Both admin accounts have access to:
- Order management (`/admin/orders`)
- Product management (`/admin/products`)
- Customer management (`/admin/customers`)
- Discount codes management (`/admin/discounts`)
- Analytics dashboard (`/admin/analytics`)
- Activity logs (`/admin/activity-logs`)
- Quiz results (`/admin/quiz`)

## Troubleshooting

If admin login fails:
1. Ensure ADM_PW secret is properly set
2. Run the setup script again: `npx tsx scripts/setup-production-admin.ts`
3. Check that `ALLOWED_ADMIN_EMAILS` includes the admin emails
4. Verify database connection is working

## Last Updated
- Date: 2025-08-10
- Both admin accounts configured and tested successfully
- Ready for production deployment