import { Router } from 'express';
import { sendTechnicalDocument } from '../lib/documentEmailer';
import * as path from 'path';

const router = Router();

router.post('/email-guide', async (req, res) => {
  try {
    const { recipients, documentPath, subject, description } = req.body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Recipients array is required' 
      });
    }

    if (!documentPath) {
      return res.status(400).json({ 
        success: false, 
        error: 'Document path is required' 
      });
    }

    const success = await sendTechnicalDocument({
      to: recipients,
      subject: subject || 'Technical Documentation',
      documentPath: path.resolve(documentPath),
      description: description || 'Technical documentation from your project'
    });

    if (success) {
      res.json({
        success: true,
        message: `Documentation sent to ${recipients.length} recipient(s)`,
        recipients
      });
    } else {
      res.json({
        success: false,
        message: 'Email system is currently disabled. Document is available in the project files.',
        recipients,
        documentPath
      });
    }

  } catch (error) {
    console.error('Documentation email error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send documentation email'
    });
  }
});

export default router;