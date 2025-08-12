# Healios Email System Documentation

## Overview
The Healios email system uses Resend API for all transactional emails. This document lists all email types, their triggers, and how to control them.

## ✅ FIXED ISSUE: Emails on Server Restart
**Problem**: Abandoned cart emails were being sent every time the app reloaded
**Solution**: Modified scheduler to NOT run immediately on startup
**Status**: Fixed - emails now only send at proper intervals

## Email Types and Triggers

### 🛒 Cart & Purchase Emails
1. **Abandoned Cart 1h** (`abandoned_cart_1h`)
   - **Subject**: "We're here when you're ready"
   - **Trigger**: 1 hour after cart abandonment
   - **Frequency**: Once per cart
   - **Prevention**: Checked via `hasEmailBeenSent()`

2. **Abandoned Cart 24h** (`abandoned_cart_24h`)
   - **Subject**: "A gentle reminder about your wellness selections"  
   - **Trigger**: 24 hours after cart abandonment
   - **Frequency**: Once per cart (max 3 days old)
   - **Prevention**: Checked via `hasEmailBeenSent()`

3. **Order Confirmation** (`order_confirm`)
   - **Subject**: "Your Healios Order Confirmation"
   - **Trigger**: After successful payment
   - **Frequency**: Once per order
   - **Code**: `EmailService.sendOrderConfirmation()`

4. **Refund Notification** (`refund`)
   - **Subject**: "Your Healios Refund Has Been Processed"
   - **Trigger**: After refund is processed
   - **Frequency**: Once per refund

### 🔄 Reorder Reminders
5. **Reorder Reminder** (`reorder_reminder`)
   - **Subject**: "A thoughtful reminder about your wellness routine"
   - **Trigger**: 5 days before product runs out (based on order history)
   - **Frequency**: Once per order
   - **Prevention**: Checked via `hasEmailBeenSent()`

6. **Final Reorder Reminder** (`reorder_final`)
   - **Subject**: "A final gentle reminder from Healios"
   - **Trigger**: 1 day after expected run-out
   - **Frequency**: Once per order
   - **Prevention**: Checked via `hasEmailBeenSent()`

### 👥 Referral System
7. **Referral Reward** (`referral_reward`)
   - **Subject**: "Great news! You've earned a reward"
   - **Trigger**: When someone uses your referral code
   - **Frequency**: Once per referral

8. **Referral Welcome** (`referral_welcome`)
   - **Subject**: "Welcome to Healios! Your discount has been applied"
   - **Trigger**: When you use someone's referral code
   - **Frequency**: Once per new user

### 🔐 Admin & Security
9. **Admin Alerts** (`admin_alert`)
   - **Subject**: "⚠️ Healios Admin Alert"
   - **Trigger**: Critical issues (Stripe disputes, payment failures)
   - **Recipients**: admin@thehealios.com, dn@thefourths.com
   - **Frequency**: Per incident

10. **Admin Login Notifications**
    - **Subject**: "Admin Account Sign-In Detected"
    - **Trigger**: When admin signs in via OAuth
    - **Recipients**: Admin who signed in
    - **Frequency**: Per login

### 🔒 Account Security
11. **Email Verification**
    - **Subject**: "Your Healios verification code"
    - **Trigger**: New user registration
    - **Frequency**: Per registration attempt

12. **Password Reset**
    - **Subject**: "Reset your Healios password"
    - **Trigger**: Password reset request
    - **Frequency**: Per reset request

### 📧 Subscription Management
13. **Subscription Created**
    - **Subject**: "Your Healios Subscription Is Active!"
    - **Trigger**: After successful subscription setup
    - **Frequency**: Once per subscription

14. **Subscription Cancelled**
    - **Subject**: "Subscription Cancelled"
    - **Trigger**: When subscription is cancelled
    - **Frequency**: Once per cancellation

15. **Subscription Payment Failed**
    - **Subject**: "Payment Failed"
    - **Trigger**: When subscription payment fails
    - **Frequency**: Per failed payment

## Email Scheduler Configuration

### Development Environment
- **Enabled**: Yes (with safeguards)
- **Runs**: Every hour after startup (NOT immediately)
- **Location**: `server/jobs/scheduler.ts`

### Production Environment  
- **Enabled**: Only if `AUTO_START_EMAIL_SCHEDULER=true`
- **Default**: Disabled to prevent accidental emails
- **Manual Start**: Available via `emailScheduler.start()`

## Email Prevention System

### Duplicate Prevention
All automated emails use `storage.hasEmailBeenSent()` to prevent duplicates:
```typescript
const alreadySent = await storage.hasEmailBeenSent(emailType, relatedId);
if (alreadySent) continue;
```

### Email Event Logging
All sent emails are logged via:
```typescript
await storage.createEmailEvent({
  userId,
  emailType,
  relatedId,
  emailAddress
});
```

## Manual Email Control

### Run Email Jobs Manually
```javascript
// In development console or admin panel
const { emailScheduler } = require('./server/jobs/scheduler');
await emailScheduler.runNow();
```

### Stop Email Scheduler
```javascript
emailScheduler.stop();
```

### Check Email Status
```javascript
// Check if email was already sent
const wasSent = await storage.hasEmailBeenSent('abandoned_cart_1h', cartId);
```

## Configuration Files
- **Email Service**: `server/lib/email.ts`
- **Scheduler**: `server/jobs/scheduler.ts` 
- **Abandoned Carts**: `server/jobs/emailAbandonedCarts.ts`
- **Reorder Reminders**: `server/jobs/emailReorderReminders.ts`
- **Admin Notifications**: `server/email.ts`

## Environment Variables
- `RESEND_API_KEY`: Required for email sending
- `AUTO_START_EMAIL_SCHEDULER`: Set to 'true' to auto-start in production
- `NODE_ENV`: Controls development vs production behavior

## Email Testing
Use the test endpoint for manual email testing:
```
POST /api/test-emails
```

## Troubleshooting

### Issue: Emails sending on app reload
**Status**: ✅ FIXED
**Solution**: Scheduler no longer runs immediately on startup

### Issue: Duplicate emails  
**Check**: Email event logging in database
**Fix**: Ensure `hasEmailBeenSent()` is called before sending

### Issue: No emails sending
**Check**: 
1. `RESEND_API_KEY` is set
2. Email scheduler is started
3. Database has email event logging enabled