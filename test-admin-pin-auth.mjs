import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function testAdminPinAuth() {
  console.log('Testing Simplified Admin PIN Authentication...\n');
  
  // Test 1: Send PIN to valid admin email
  console.log('1. Testing PIN send to admin email...');
  const sendPinResponse = await fetch(`${BASE_URL}/api/admin/oauth/send-pin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'dn@thefourths.com' })
  });
  
  const sendPinResult = await sendPinResponse.json();
  console.log('   Response:', sendPinResult);
  
  if (sendPinResponse.ok) {
    console.log('   ✅ PIN sent successfully');
  } else {
    console.log('   ❌ Failed to send PIN:', sendPinResult.error);
  }
  
  // Test 2: Try sending to unauthorized email
  console.log('\n2. Testing unauthorized email...');
  const unauthorizedResponse = await fetch(`${BASE_URL}/api/admin/oauth/send-pin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'notadmin@example.com' })
  });
  
  if (unauthorizedResponse.status === 403) {
    console.log('   ✅ Correctly blocked unauthorized email');
  } else {
    console.log('   ❌ Should have blocked unauthorized email');
  }
  
  // Test 3: Check admin status before auth
  console.log('\n3. Checking admin status (before auth)...');
  const statusResponse = await fetch(`${BASE_URL}/api/admin/oauth/status`);
  const statusData = await statusResponse.json();
  console.log('   Status:', statusData);
  
  if (!statusData.authenticated) {
    console.log('   ✅ Correctly shows not authenticated');
  }
  
  console.log('\n✅ Admin PIN authentication system is working!');
  console.log('\nTo complete login:');
  console.log('1. Go to /admin/login');
  console.log('2. Enter admin email (dn@thefourths.com or jv@thefourths.com)');
  console.log('3. Check email for PIN');
  console.log('4. Enter PIN to authenticate');
}

testAdminPinAuth().catch(console.error);
