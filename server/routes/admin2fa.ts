import express from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { generateTotpSecret, generateTotpQrData, verifyTotpCodeWithReplay, generateBackupCodes, hashBackupCodes, verifyBackupCode } from '../lib/totp';
import { requireAdminAuth } from '../middleware/admin2fa';
import { totpRateLimit, backupCodeRateLimit, recordFailedTotpAttempt, recordFailedBackupCodeAttempt } from '../middleware/adminRateLimit';

const router = express.Router();

// Schema for TOTP setup with strict validation
const totpSetupSchema = z.object({
  totpCode: z.string()
    .length(6, 'TOTP code must be exactly 6 digits')
    .regex(/^\d{6}$/, 'TOTP code must contain only digits'),
});

// Schema for TOTP verification with strict validation
const totpVerifySchema = z.object({
  totpCode: z.string()
    .length(6, 'TOTP code must be exactly 6 digits')
    .regex(/^\d{6}$/, 'TOTP code must contain only digits'),
});

// Schema for backup code usage
const backupCodeSchema = z.object({
  backupCode: z.string().min(8, 'Invalid backup code format'),
});

/**
 * GET /setup - Get TOTP setup information
 * Returns QR code data and manual setup key for authenticator apps
 */
router.get('/setup', requireAdminAuth, async (req, res) => {
  try {
    const admin = (req as any).admin;
    
    // If 2FA is already enabled and not refreshing, prevent secret disclosure
    if (admin.totpEnabled && req.query.refresh !== 'true') {
      return res.status(403).json({ 
        error: '2FA is already enabled. Use refresh=true to rotate your secret.',
        code: 'TOTP_ALREADY_ENABLED' 
      });
    }
    
    // If refreshing an existing 2FA setup, require current TOTP verification with rate limiting
    if (req.query.refresh === 'true' && admin.totpEnabled) {
      // Apply rate limiting for secret rotation attempts
      const rateLimitKey = `totp:${admin.email}:${req.ip || req.connection.remoteAddress}`;
      
      // Check rate limiting before processing refresh
      const { isRateLimited, TOTP_RATE_LIMIT, rateLimitStore, recordFailedTotpAttempt } = await import('../middleware/adminRateLimit');
      
      // Set rate limit key for potential failure recording  
      (req as any).totpRateLimitKey = rateLimitKey;
      
      const rateLimitResult = isRateLimited(rateLimitKey, rateLimitStore, TOTP_RATE_LIMIT);
      
      if (rateLimitResult.limited) {
        const retryAfter = Math.ceil((rateLimitResult.nextAttemptAllowed - Date.now()) / 1000);
        return res.status(429).json({
          error: 'Too many 2FA refresh attempts',
          code: 'TOTP_RATE_LIMITED',
          retryAfter,
          message: `Please try again in ${Math.ceil(retryAfter / 60)} minutes`
        });
      }
      
      const currentTotpCode = req.headers['x-totp-code'] as string;
      
      if (!currentTotpCode) {
        return res.status(401).json({ 
          error: 'Current 2FA code required to refresh TOTP secret',
          code: 'CURRENT_TOTP_REQUIRED' 
        });
      }
      
      // Validate current TOTP code format
      if (!/^\d{6}$/.test(currentTotpCode)) {
        return res.status(400).json({ 
          error: 'Invalid TOTP code format',
          code: 'TOTP_FORMAT_INVALID' 
        });
      }
      
      // Verify current TOTP code
      if (!admin.totpSecret) {
        return res.status(500).json({ 
          error: 'Current TOTP configuration error',
          code: 'TOTP_CONFIG_ERROR' 
        });
      }
      
      const currentTotpResult = verifyTotpCodeWithReplay(admin.totpSecret, currentTotpCode, admin.lastTotpTimestep);
      if (!currentTotpResult.valid) {
        // Record failed attempt for rate limiting
        recordFailedTotpAttempt(req);
        return res.status(401).json({ 
          error: 'Invalid current 2FA code. Cannot refresh TOTP secret.',
          code: 'CURRENT_TOTP_INVALID' 
        });
      }
      
      // Update timestep to prevent replay
      if (currentTotpResult.timestep) {
        await storage.updateAdminLastTotpTimestep(admin.id, currentTotpResult.timestep);
      }
    }
    
    // Generate new TOTP secret if not exists or if refreshing
    let totpSecret = admin.totpSecret;
    if (!totpSecret || req.query.refresh === 'true') {
      totpSecret = generateTotpSecret();
      await storage.updateAdminTotpSecret(admin.id, totpSecret);
    }

    // Generate QR code data for authenticator apps
    const qrData = generateTotpQrData(
      totpSecret,
      `Healios Admin (${admin.email})`,
      'Healios'
    );

    res.json({
      success: true,
      setup: {
        secret: totpSecret,
        qrCodeUrl: qrData,
        manualEntryKey: totpSecret,
        issuer: 'Healios',
        accountName: `Healios Admin (${admin.email})`,
        enabled: admin.totpEnabled
      }
    });

  } catch (error) {
    console.error('[ADMIN_2FA] Setup error:', error);
    res.status(500).json({ 
      error: 'Failed to generate 2FA setup',
      code: 'SETUP_ERROR' 
    });
  }
});

/**
 * POST /setup - Complete TOTP setup
 * Verifies the first TOTP code and enables 2FA
 */
router.post('/setup', requireAdminAuth, totpRateLimit, async (req, res) => {
  try {
    const admin = (req as any).admin;
    const { totpCode } = totpSetupSchema.parse(req.body);

    if (!admin.totpSecret) {
      return res.status(400).json({ 
        error: 'No TOTP secret found. Please initiate setup first.',
        code: 'NO_SECRET' 
      });
    }

    // Verify the TOTP code (no replay protection needed for setup)
    const totpResult = verifyTotpCodeWithReplay(admin.totpSecret, totpCode, null);
    if (!totpResult.valid) {
      recordFailedTotpAttempt(req);
      return res.status(400).json({ 
        error: 'Invalid TOTP code. Please check your authenticator app.',
        code: 'INVALID_CODE' 
      });
    }

    // Generate backup codes and hash them for storage
    const backupCodes = generateBackupCodes(10);
    const hashedBackupCodes = await hashBackupCodes(backupCodes);

    // Enable 2FA and save hashed backup codes
    await storage.updateAdminTotpEnabled(admin.id, true);
    await storage.updateAdminBackupCodes(admin.id, hashedBackupCodes);

    res.json({
      success: true,
      message: '2FA setup completed successfully',
      backupCodes,
      warning: 'Save these backup codes in a secure location. They will not be shown again.'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid request data',
        code: 'VALIDATION_ERROR',
        details: error.errors 
      });
    }

    console.error('[ADMIN_2FA] Setup completion error:', error);
    res.status(500).json({ 
      error: 'Failed to complete 2FA setup',
      code: 'SETUP_COMPLETION_ERROR' 
    });
  }
});

/**
 * POST /verify - Verify TOTP code (for testing)
 * Used to test 2FA without requiring full admin route access
 */
router.post('/verify', requireAdminAuth, totpRateLimit, async (req, res) => {
  try {
    const admin = (req as any).admin;
    const { totpCode } = totpVerifySchema.parse(req.body);

    if (!admin.totpEnabled || !admin.totpSecret) {
      return res.status(400).json({ 
        error: '2FA is not enabled for this admin',
        code: 'TOTP_NOT_ENABLED' 
      });
    }

    // Verify the TOTP code with replay protection
    const totpResult = verifyTotpCodeWithReplay(admin.totpSecret, totpCode, admin.lastTotpTimestep);
    
    if (!totpResult.valid) {
      recordFailedTotpAttempt(req);
    } else if (totpResult.timestep) {
      // Update timestep to prevent replay
      await storage.updateAdminLastTotpTimestep(admin.id, totpResult.timestep);
    }
    
    res.json({
      success: true,
      valid: totpResult.valid,
      message: totpResult.valid ? 'Valid TOTP code' : 'Invalid TOTP code'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid request data',
        code: 'VALIDATION_ERROR',
        details: error.errors 
      });
    }

    console.error('[ADMIN_2FA] Verification error:', error);
    res.status(500).json({ 
      error: 'Failed to verify TOTP code',
      code: 'VERIFICATION_ERROR' 
    });
  }
});

/**
 * POST /backup-code - Use backup code for recovery
 * Allows admin access using a backup code when TOTP is unavailable
 */
router.post('/backup-code', requireAdminAuth, backupCodeRateLimit, async (req, res) => {
  try {
    const admin = (req as any).admin;
    const { backupCode } = backupCodeSchema.parse(req.body);

    if (!admin.totpEnabled || !admin.backupCodes || admin.backupCodes.length === 0) {
      return res.status(400).json({ 
        error: '2FA is not enabled or no backup codes available',
        code: 'NO_BACKUP_CODES' 
      });
    }

    // Verify backup code against hashed codes
    const verificationResult = await verifyBackupCode(backupCode, admin.backupCodes);
    
    if (!verificationResult.valid) {
      recordFailedBackupCodeAttempt(req);
      return res.status(400).json({ 
        error: 'Invalid backup code',
        code: 'INVALID_BACKUP_CODE' 
      });
    }

    // Update admin with remaining hashed backup codes
    const remainingHashes = verificationResult.remainingHashes || [];
    await storage.updateAdminBackupCodes(admin.id, remainingHashes);

    res.json({
      success: true,
      message: 'Backup code accepted',
      remainingCodes: remainingHashes.length,
      warning: remainingHashes.length <= 2 
        ? 'Warning: You have 2 or fewer backup codes remaining. Consider regenerating backup codes.'
        : undefined
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid request data',
        code: 'VALIDATION_ERROR',
        details: error.errors 
      });
    }

    console.error('[ADMIN_2FA] Backup code error:', error);
    res.status(500).json({ 
      error: 'Failed to process backup code',
      code: 'BACKUP_CODE_ERROR' 
    });
  }
});

/**
 * POST /regenerate-backup-codes - Generate new backup codes
 * Replaces all existing backup codes with new ones
 * Requires current TOTP verification for security
 */
router.post('/regenerate-backup-codes', requireAdminAuth, totpRateLimit, async (req, res) => {
  try {
    const admin = (req as any).admin;
    const { totpCode } = totpVerifySchema.parse(req.body);

    if (!admin.totpEnabled) {
      return res.status(400).json({ 
        error: '2FA must be enabled to regenerate backup codes',
        code: 'TOTP_NOT_ENABLED' 
      });
    }
    
    // Require current TOTP verification for this sensitive operation
    if (!admin.totpSecret) {
      return res.status(500).json({ 
        error: 'TOTP configuration error',
        code: 'TOTP_CONFIG_ERROR' 
      });
    }
    
    // Verify current TOTP code
    const totpResult = verifyTotpCodeWithReplay(admin.totpSecret, totpCode, admin.lastTotpTimestep);
    if (!totpResult.valid) {
      recordFailedTotpAttempt(req);
      return res.status(401).json({ 
        error: 'Invalid TOTP code. Cannot regenerate backup codes.',
        code: 'TOTP_INVALID' 
      });
    }
    
    // Update timestep to prevent replay
    if (totpResult.timestep) {
      await storage.updateAdminLastTotpTimestep(admin.id, totpResult.timestep);
    }

    // Generate new backup codes and hash them for storage
    const newBackupCodes = generateBackupCodes(10);
    const hashedBackupCodes = await hashBackupCodes(newBackupCodes);
    await storage.updateAdminBackupCodes(admin.id, hashedBackupCodes);

    res.json({
      success: true,
      backupCodes: newBackupCodes,
      message: 'New backup codes generated successfully',
      warning: 'Save these backup codes in a secure location. Previous backup codes are now invalid.'
    });

  } catch (error) {
    console.error('[ADMIN_2FA] Backup code regeneration error:', error);
    res.status(500).json({ 
      error: 'Failed to regenerate backup codes',
      code: 'REGENERATION_ERROR' 
    });
  }
});

/**
 * DELETE /disable - Disable 2FA for admin
 * Requires current TOTP code for security
 */
router.delete('/disable', requireAdminAuth, totpRateLimit, async (req, res) => {
  try {
    const admin = (req as any).admin;
    const { totpCode } = totpVerifySchema.parse(req.body);

    if (!admin.totpEnabled || !admin.totpSecret) {
      return res.status(400).json({ 
        error: '2FA is not currently enabled',
        code: 'TOTP_NOT_ENABLED' 
      });
    }

    // Verify current TOTP code before disabling with replay protection
    const totpResult = verifyTotpCodeWithReplay(admin.totpSecret, totpCode, admin.lastTotpTimestep);
    if (!totpResult.valid) {
      recordFailedTotpAttempt(req);
      return res.status(400).json({ 
        error: 'Invalid TOTP code. Cannot disable 2FA.',
        code: 'INVALID_CODE' 
      });
    }
    
    // Update timestep to prevent replay
    if (totpResult.timestep) {
      await storage.updateAdminLastTotpTimestep(admin.id, totpResult.timestep);
    }

    // Disable 2FA and clear secrets
    await storage.updateAdminTotpEnabled(admin.id, false);
    await storage.updateAdminTotpSecret(admin.id, null);
    await storage.updateAdminBackupCodes(admin.id, []);
    await storage.updateAdminLastTotpTimestep(admin.id, null);

    res.json({
      success: true,
      message: '2FA has been disabled successfully',
      warning: 'Your admin account is now less secure. Consider re-enabling 2FA.'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid request data',
        code: 'VALIDATION_ERROR',
        details: error.errors 
      });
    }

    console.error('[ADMIN_2FA] Disable error:', error);
    res.status(500).json({ 
      error: 'Failed to disable 2FA',
      code: 'DISABLE_ERROR' 
    });
  }
});

/**
 * GET /status - Get 2FA status for admin
 */
router.get('/status', requireAdminAuth, async (req, res) => {
  try {
    const admin = (req as any).admin;

    res.json({
      success: true,
      status: {
        enabled: admin.totpEnabled,
        hasSecret: !!admin.totpSecret,
        backupCodesCount: admin.backupCodes?.length || 0,
        email: admin.email,
        lastLoginAt: admin.lastLoginAt
      }
    });

  } catch (error) {
    console.error('[ADMIN_2FA] Status error:', error);
    res.status(500).json({ 
      error: 'Failed to get 2FA status',
      code: 'STATUS_ERROR' 
    });
  }
});

export default router;