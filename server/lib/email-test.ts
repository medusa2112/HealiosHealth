import { sendEmail, sendAdminAlert } from './email';

async function testEmails() {
  console.log('🧪 Testing Healios Email System...\n');

  try {
    // Test Order Confirmation Email
    console.log('📧 Testing Order Confirmation Email...');
    const orderResult = await sendEmail('customer+test@thehealios.com', 'order_confirm', {
      amount: 89.97,
      id: 'cs_test_123456789',
      customerName: 'John Doe',
      items: [
        { productName: 'KSM-66® Ashwagandha', quantity: 1, price: '39.99' },
        { productName: 'Magnesium Complex', quantity: 2, price: '24.99' }
      ]
    });
    console.log('✅ Order confirmation sent:', orderResult.id);

    // Test Refund Email
    console.log('\n💰 Testing Refund Email...');
    const refundResult = await sendEmail('customer+test@thehealios.com', 'refund', {
      amount: 39.99,
      id: 'pi_test_refund_123',
      customerName: 'John Doe'
    });
    console.log('✅ Refund email sent:', refundResult.id);

    // Test Reorder Email
    console.log('\n🔄 Testing Reorder Email...');
    const reorderResult = await sendEmail('customer+test@thehealios.com', 'reorder', {
      amount: 89.97,
      id: 'cs_test_reorder_456',
      customerName: 'John Doe'
    });
    console.log('✅ Reorder email sent:', reorderResult.id);

    // Test Admin Alert
    console.log('\n🚨 Testing Admin Alert...');
    await sendAdminAlert('🔧 EMAIL SYSTEM TEST', {
      testRun: true,
      timestamp: new Date().toISOString(),
      systemStatus: 'operational'
    });
    console.log('✅ Admin alert sent');

    console.log('\n🎉 All email tests completed successfully!');
    console.log('\nEmail system is ready for production use.');

  } catch (error) {
    console.error('❌ Email test failed:', error);
    console.log('\n⚠️  Please check your RESEND_API_KEY configuration');
  }
}

// Run tests immediately
testEmails();

export { testEmails };