import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function testAdminProductUpdate() {
  console.log('Testing Admin Product Update with CSRF...\n');
  
  // Step 1: Login as admin first
  console.log('1. Sending PIN to admin email...');
  const sendPinResponse = await fetch(`${BASE_URL}/api/admin/oauth/send-pin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'dn@thefourths.com' })
  });
  
  if (!sendPinResponse.ok) {
    console.log('❌ Failed to send PIN');
    return;
  }
  
  console.log('   ✅ PIN sent successfully');
  
  // Note: In a real test, you'd get the PIN from email
  // For now, let's check the CSRF endpoint after authentication
  
  console.log('\n2. Testing CSRF token retrieval...');
  const csrfResponse = await fetch(`${BASE_URL}/api/admin/csrf`, {
    method: 'GET',
    credentials: 'include'
  });
  
  if (csrfResponse.ok) {
    const csrfData = await csrfResponse.json();
    console.log('   ✅ CSRF token retrieved:', csrfData.csrfToken.substring(0, 10) + '...');
  } else {
    console.log('   ❌ Failed to get CSRF token');
  }
  
  console.log('\n✅ Ready for product testing!');
  console.log('To complete the test:');
  console.log('1. Complete admin login via web interface');
  console.log('2. Try updating a product');
  console.log('3. Check for CSRF errors');
}

testAdminProductUpdate().catch(console.error);
