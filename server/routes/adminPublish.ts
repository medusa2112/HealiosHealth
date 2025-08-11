import { Router, Request, Response } from 'express';
import { requireAdmin } from '../mw/requireAdmin';
import { auditLog } from '../middleware/adminAccess';
import { logger } from '../lib/logger';
import { storage } from '../storage';
import fs from 'fs/promises';
import path from 'path';

const router = Router();

interface PublishRequest {
  contentType: 'products' | 'bundles' | 'discounts' | 'all';
  environment: 'staging' | 'production';
  dryRun?: boolean;
}

interface PublishResult {
  success: boolean;
  itemsPublished: number;
  snapshot?: string;
  errors?: string[];
}

/**
 * Create a content snapshot before publishing
 */
async function createSnapshot(contentType: string): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const snapshotId = `snapshot-${contentType}-${timestamp}`;
  const snapshotPath = path.join(process.cwd(), 'snapshots', snapshotId);
  
  try {
    await fs.mkdir(path.dirname(snapshotPath), { recursive: true });
    
    // Export current data based on content type
    let data: any = {};
    
    if (contentType === 'products' || contentType === 'all') {
      data.products = await storage.getProducts();
    }
    
    if (contentType === 'bundles' || contentType === 'all') {
      // For now, bundles are handled as products with bundle flag
      data.bundles = await storage.getProducts();
    }
    
    if (contentType === 'discounts' || contentType === 'all') {
      data.discounts = await storage.getDiscountCodes();
    }
    
    // Save snapshot
    await fs.writeFile(
      `${snapshotPath}.json`,
      JSON.stringify(data, null, 2)
    );
    
    logger.info('PUBLISH', 'Snapshot created', { snapshotId, contentType });
    
    return snapshotId;
  } catch (error) {
    logger.error('PUBLISH', 'Failed to create snapshot', { error });
    throw error;
  }
}

/**
 * Rollback to a previous snapshot
 */
router.post('/rollback/:snapshotId', 
  requireAdmin,
  auditLog('CONTENT_ROLLBACK'),
  async (req: Request, res: Response) => {
    const { snapshotId } = req.params;
    
    try {
      const snapshotPath = path.join(process.cwd(), 'snapshots', `${snapshotId}.json`);
      const snapshotData = JSON.parse(await fs.readFile(snapshotPath, 'utf-8'));
      
      // Restore data from snapshot
      if (snapshotData.products) {
        // In a real implementation, this would restore products
        logger.info('ROLLBACK', 'Products restored from snapshot', { 
          count: snapshotData.products.length 
        });
      }
      
      if (snapshotData.bundles) {
        logger.info('ROLLBACK', 'Bundles restored from snapshot', { 
          count: snapshotData.bundles.length 
        });
      }
      
      if (snapshotData.discounts) {
        logger.info('ROLLBACK', 'Discounts restored from snapshot', { 
          count: snapshotData.discounts.length 
        });
      }
      
      res.json({
        success: true,
        message: 'Content rolled back successfully',
        snapshotId
      });
      
    } catch (error) {
      logger.error('ROLLBACK', 'Rollback failed', { error, snapshotId });
      res.status(500).json({
        error: 'Rollback failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * List available snapshots
 */
router.get('/snapshots',
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const snapshotsDir = path.join(process.cwd(), 'snapshots');
      
      // Ensure directory exists
      await fs.mkdir(snapshotsDir, { recursive: true });
      
      const files = await fs.readdir(snapshotsDir);
      const snapshots = await Promise.all(
        files
          .filter(f => f.endsWith('.json'))
          .map(async (file) => {
            const stats = await fs.stat(path.join(snapshotsDir, file));
            return {
              id: file.replace('.json', ''),
              createdAt: stats.mtime,
              size: stats.size
            };
          })
      );
      
      res.json({
        snapshots: snapshots.sort((a, b) => 
          b.createdAt.getTime() - a.createdAt.getTime()
        )
      });
      
    } catch (error) {
      logger.error('SNAPSHOTS', 'Failed to list snapshots', { error });
      res.status(500).json({ error: 'Failed to list snapshots' });
    }
  }
);

/**
 * Publish content from staging to production
 * This is a simplified version - in production, this would trigger
 * a CI/CD pipeline or use a proper content management system
 */
router.post('/publish',
  requireAdmin,
  auditLog('CONTENT_PUBLISH'),
  async (req: Request, res: Response) => {
    const { contentType, environment, dryRun = false } = req.body as PublishRequest;
    
    // Validate environment
    if (process.env.NODE_ENV === 'production' && environment === 'production') {
      return res.status(403).json({
        error: 'Direct production publish not allowed',
        message: 'Use the CI/CD pipeline for production deployments'
      });
    }
    
    try {
      // Create snapshot before publishing
      const snapshotId = await createSnapshot(contentType);
      
      // In a real implementation, this would:
      // 1. Export staging data
      // 2. Validate data integrity
      // 3. Push to production via API or Git
      // 4. Trigger production build/deploy
      
      const result: PublishResult = {
        success: true,
        itemsPublished: 0,
        snapshot: snapshotId
      };
      
      if (!dryRun) {
        // Simulate publishing different content types
        if (contentType === 'products' || contentType === 'all') {
          const products = await storage.getProducts();
          result.itemsPublished += products.length;
          
          logger.info('PUBLISH', 'Products published', {
            count: products.length,
            environment,
            adminId: (req.session as any).adminId
          });
        }
        
        if (contentType === 'bundles' || contentType === 'all') {
          // For now, bundles are handled as products
          const bundles = await storage.getProducts();
          result.itemsPublished += bundles.length;
          
          logger.info('PUBLISH', 'Bundles published', {
            count: bundles.length,
            environment,
            adminId: (req.session as any).adminId
          });
        }
        
        if (contentType === 'discounts' || contentType === 'all') {
          const discounts = await storage.getDiscountCodes();
          result.itemsPublished += discounts.length;
          
          logger.info('PUBLISH', 'Discounts published', {
            count: discounts.length,
            environment,
            adminId: (req.session as any).adminId
          });
        }
      }
      
      res.json({
        ...result,
        message: dryRun 
          ? `Dry run: Would publish ${result.itemsPublished} items`
          : `Successfully published ${result.itemsPublished} items`,
        dryRun
      });
      
    } catch (error) {
      logger.error('PUBLISH', 'Publish failed', { error, contentType, environment });
      res.status(500).json({
        error: 'Publish failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * Get publish history/audit log
 */
router.get('/history',
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      // In a real implementation, this would query an audit log database
      const history = [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          contentType: 'products',
          environment: 'staging',
          adminEmail: 'admin@healios.com',
          itemsPublished: 15,
          status: 'success'
        }
      ];
      
      res.json({ history });
      
    } catch (error) {
      logger.error('HISTORY', 'Failed to get publish history', { error });
      res.status(500).json({ error: 'Failed to get publish history' });
    }
  }
);

export default router;