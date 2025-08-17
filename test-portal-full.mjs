import fetch from 'node-fetch';

const API_URL = 'http://localhost:5000';

async function testPortalFull() {
  console.log('=== FULL CUSTOMER PORTAL QA AUDIT ===\n');
  
  // Step 1: Authenticate
  console.log('1. Authenticating...');
  await fetch(`${API_URL}/api/auth/send-pin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'dominicnel@mac.com' })
  });
  
  const verifyResponse = await fetch(`${API_URL}/api/auth/verify-pin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      email: 'dominicnel@mac.com',
      pin: '123456' 
    })
  });
  
  const cookies = verifyResponse.headers.raw()['set-cookie'];
  const sessionCookie = cookies?.find(c => c.includes('connect.sid'));
  
  if (!sessionCookie) {
    console.error('   Failed to authenticate - no session cookie');
    return;
  }
  console.log('   ✓ Authenticated successfully');
  
  // Step 2: Get CSRF token
  const csrfResponse = await fetch(`${API_URL}/api/csrf/token`, {
    headers: { 'Cookie': sessionCookie }
  });
  const { csrfToken } = await csrfResponse.json();
  console.log('   ✓ CSRF token obtained');
  
  // Step 3: Test Addresses
  console.log('\n2. Testing Addresses Tab:');
  
  // Get current addresses
  let response = await fetch(`${API_URL}/api/portal/addresses`, {
    headers: { 'Cookie': sessionCookie }
  });
  let addresses = await response.json();
  console.log(`   Current addresses: ${addresses.length} found`);
  
  // Create a new address
  response = await fetch(`${API_URL}/api/portal/addresses`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Cookie': sessionCookie,
      'X-CSRF-Token': csrfToken
    },
    body: JSON.stringify({
      type: 'shipping',
      line1: 'Test Address Line 1',
      line2: 'Apt 2B',
      city: 'Cape Town',
      zipCode: '8001',
      country: 'ZA'
    })
  });
  
  if (response.ok) {
    const newAddress = await response.json();
    console.log('   ✓ Address created:', newAddress.id || 'success');
  } else {
    console.log('   ✗ Failed to create address:', response.status);
  }
  
  // Get addresses again
  response = await fetch(`${API_URL}/api/portal/addresses`, {
    headers: { 'Cookie': sessionCookie }
  });
  addresses = await response.json();
  console.log(`   After creation: ${addresses.length} addresses`);
  
  // Step 4: Test Orders
  console.log('\n3. Testing Orders Tab:');
  response = await fetch(`${API_URL}/api/portal/orders`, {
    headers: { 'Cookie': sessionCookie }
  });
  const orders = await response.json();
  console.log(`   Orders: ${orders.length} found`);
  
  // Step 5: Test Referrals
  console.log('\n4. Testing Referrals Tab:');
  response = await fetch(`${API_URL}/api/referrals/my-referral`, {
    headers: { 'Cookie': sessionCookie }
  });
  const referral = await response.json();
  console.log(`   Referral code: ${referral.code || 'not found'}`);
  
  response = await fetch(`${API_URL}/api/referrals/stats`, {
    headers: { 'Cookie': sessionCookie }
  });
  const stats = await response.json();
  console.log(`   Referral stats: ${stats.totalUses || 0} uses, ${stats.totalRevenue || 0} revenue`);
  
  // Step 6: Test Portal main endpoint
  console.log('\n5. Testing Portal Data:');
  response = await fetch(`${API_URL}/api/portal`, {
    headers: { 'Cookie': sessionCookie }
  });
  const portalData = await response.json();
  console.log(`   Recent orders: ${portalData.recentOrders?.length || 0}`);
  console.log(`   Addresses: ${portalData.addresses?.length || 0}`);
  console.log(`   Referral info: ${portalData.referral ? 'present' : 'missing'}`);
  
  console.log('\n=== AUDIT COMPLETE ===');
  console.log('\nSummary:');
  console.log(`✓ Authentication: Working`);
  console.log(`${addresses.length > 0 ? '✓' : '✗'} Addresses: ${addresses.length} saved`);
  console.log(`${orders.length > 0 ? '✓' : '✗'} Orders: ${orders.length} found`);
  console.log(`${referral.code ? '✓' : '✗'} Referral system: ${referral.code ? 'Active' : 'Not setup'}`);
}

testPortalFull().catch(console.error);
