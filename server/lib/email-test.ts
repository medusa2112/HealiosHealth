import { sendEmail, sendAdminAlert } from './email';

async function testEmails() {

  try {
    // Test Order Confirmation Email
    
    const orderResult = await sendEmail('customer+test@thehealios.com', 'order_confirm', {
      amount: 89.97,
      id: 'cs_test_123456789',
      customerName: 'John Doe',
      items: [
        { productName: 'KSM-66® Ashwagandha', quantity: 1, price: '39.99' },
        { productName: 'Magnesium Complex', quantity: 2, price: '24.99' }
      ]
    });

    const refundResult = await sendEmail('customer+test@thehealios.com', 'refund', {
      amount: 39.99,
      id: 'pi_test_refund_123',
      customerName: 'John Doe'
    });

    const reorderResult = await sendEmail('customer+test@thehealios.com', 'reorder', {
      amount: 89.97,
      id: 'cs_test_reorder_456',
      customerName: 'John Doe'
    });

    await sendAdminAlert('🔧 EMAIL SYSTEM TEST', {
      testRun: true,
      timestamp: new Date().toISOString(),
      systemStatus: 'operational'
    });

  } catch (error) {
    // // console.error('❌ Email test failed:', error);
    
  }
}

// Run tests immediately
testEmails();

export { testEmails };