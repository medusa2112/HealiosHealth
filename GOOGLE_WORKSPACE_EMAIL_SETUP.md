# Google Workspace Email Integration for Healios

## Overview
This guide helps you switch from Resend to Google Workspace/Gmail for sending emails from your Healios application.

## Required Information from Replit Support

To integrate with Google Workspace, you'll need the following from **Replit Support**:

### 1. Public Keys for Authentication
- **SPF Record Keys**: For sender authentication
- **DKIM Public Keys**: For email signing and verification
- **IP Ranges**: Replit's outbound email server IPs

### 2. SMTP Configuration
- **SMTP Server**: Gmail SMTP endpoint
- **Port**: Typically 587 (TLS) or 465 (SSL)
- **Authentication Method**: OAuth2 or App-specific passwords

### 3. Domain Configuration
- **Sender Domain**: What domain emails will be sent from
- **Verification Process**: Steps to verify domain ownership

## How to Request from Replit Support

1. **Contact Method**: 
   - Go to Replit Console → Help → Contact Support
   - Or email: support@replit.com

2. **Request Template**:
   ```
   Subject: Google Workspace Email Integration - Public Keys Needed
   
   Hello Replit Support,
   
   I'm working on integrating Google Workspace/Gmail SMTP for sending 
   emails from my Replit application (healios-health.dominic96.replit.app).
   
   I need the following information to configure Google Workspace:
   
   - SPF record public keys for sender authentication
   - DKIM public keys for email signing
   - Outbound IP ranges for Replit email servers
   - Recommended SMTP configuration (server, port, auth method)
   - Domain verification process for custom sender domains
   
   Current email volume: ~50-100 emails/day (abandoned cart, order confirmations)
   
   Thank you for your assistance!
   ```

## Current Email System Status

### Rate Limiting Fixed
✅ **Issue**: Resend API rate limit exceeded (2 requests/second)
✅ **Solution**: Added 600ms delay between emails with rate limiting

### Email Types (15 total)
1. **Shopping**: Order confirmations, refunds, abandoned carts
2. **Reorder**: Reminders based on usage patterns  
3. **Referral**: Reward notifications
4. **Admin**: Security alerts, login notifications
5. **Account**: Verification, password reset
6. **Subscription**: Created, cancelled, payment failed

## Migration Steps (After Getting Replit Keys)

### 1. Google Workspace Configuration
```bash
# Add to .env
GOOGLE_WORKSPACE_EMAIL=your-email@yourdomain.com
GOOGLE_WORKSPACE_PASSWORD=your-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

### 2. Update Email Service
```typescript
// server/lib/email.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.GOOGLE_WORKSPACE_EMAIL,
    pass: process.env.GOOGLE_WORKSPACE_PASSWORD,
  },
});
```

### 3. DNS Configuration
Add these records to your domain DNS (using keys from Replit):

```dns
# SPF Record (using Replit's public keys)
TXT "v=spf1 include:_spf.google.com include:replit-keys.example.com ~all"

# DKIM Record (using Replit's DKIM keys)  
TXT "v=DKIM1; k=rsa; p=REPLIT_PROVIDED_PUBLIC_KEY"

# DMARC Record
TXT "v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com"
```

## Benefits of Google Workspace vs Resend

### Advantages
- **Higher Rate Limits**: 250 messages/day for Gmail, more for Workspace
- **Better Deliverability**: Established reputation with email providers
- **Cost Effective**: Often cheaper for high volume
- **Unified Platform**: Integrates with other Google services

### Considerations  
- **Setup Complexity**: Requires DNS configuration and domain verification
- **Authentication**: Need app-specific passwords or OAuth2 setup
- **Replit Integration**: Requires coordination with Replit infrastructure

## Current Rate Limiting Implementation

The email service now includes automatic rate limiting:

```typescript
// Automatically waits 600ms between emails
// Handles Resend's 2 requests/second limit
// Prevents 429 "Too Many Requests" errors
```

## Testing Checklist

Once Google Workspace is configured:

- [ ] Send test order confirmation
- [ ] Send test abandoned cart email
- [ ] Verify SPF/DKIM authentication
- [ ] Check email deliverability scores
- [ ] Test rate limiting with multiple emails
- [ ] Verify admin notifications work

## Fallback Strategy

Keep Resend as backup in case Google Workspace has issues:

```typescript
// Dual email provider setup
const primaryProvider = 'google-workspace';
const fallbackProvider = 'resend';
```

## Support Resources

- **Google Workspace SMTP Guide**: https://support.google.com/a/answer/176600
- **App Passwords**: https://support.google.com/accounts/answer/185833
- **Email Authentication**: https://support.google.com/a/answer/33786

---

**Next Steps:**
1. Contact Replit Support with the template above
2. Wait for public keys and configuration details
3. Configure Google Workspace with provided keys
4. Test email delivery and authentication
5. Update DNS records for domain verification