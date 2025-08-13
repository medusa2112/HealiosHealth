import { MailService } from '@sendgrid/mail';
import * as fs from 'fs/promises';
import * as path from 'path';

if (!process.env.SENDGRID_API_KEY) {
  console.warn("SENDGRID_API_KEY not set - email functionality will be limited");
}

const mailService = new MailService();
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

interface DocumentEmailParams {
  to: string[];
  subject: string;
  documentPath: string;
  description: string;
}

export async function sendTechnicalDocument(params: DocumentEmailParams): Promise<boolean> {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.log('📧 Email system disabled - printing document info instead');
      console.log(`Recipients: ${params.to.join(', ')}`);
      console.log(`Subject: ${params.subject}`);
      console.log(`Document: ${params.documentPath}`);
      console.log('Would send technical documentation via email if enabled');
      return false;
    }

    // Read the document content
    const documentContent = await fs.readFile(params.documentPath, 'utf-8');
    
    // Create email content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Technical Documentation</h2>
        <p style="color: #666; margin-bottom: 20px;">${params.description}</p>
        
        <div style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #495057;">Document Preview</h3>
          <pre style="white-space: pre-wrap; font-size: 12px; color: #6c757d; max-height: 400px; overflow-y: auto;">${documentContent.substring(0, 2000)}${documentContent.length > 2000 ? '...\n\n[Document truncated - full content attached]' : ''}</pre>
        </div>
        
        <p style="color: #666;">
          This email contains the complete technical documentation as requested. 
          The full document is attached and also available in your Replit project.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">
          Generated automatically from Healios Health project<br>
          Document path: ${params.documentPath}
        </p>
      </div>
    `;

    const textContent = `
Technical Documentation

${params.description}

${documentContent}

---
Generated automatically from Healios Health project
Document path: ${params.documentPath}
    `;

    // Send email to each recipient
    const emailPromises = params.to.map(async (email) => {
      return await mailService.send({
        to: email,
        from: 'noreply@healios-health.com', // Use your verified sender
        subject: params.subject,
        text: textContent,
        html: htmlContent,
        attachments: [
          {
            content: Buffer.from(documentContent).toString('base64'),
            filename: path.basename(params.documentPath),
            type: 'text/markdown',
            disposition: 'attachment'
          }
        ]
      });
    });

    await Promise.all(emailPromises);
    
    console.log(`📧 Technical document sent successfully to: ${params.to.join(', ')}`);
    return true;

  } catch (error) {
    console.error('Failed to send technical document:', error);
    return false;
  }
}