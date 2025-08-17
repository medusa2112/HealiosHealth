import fetch from 'node-fetch';

const API_URL = 'http://localhost:5000';

async function testAddressFlow() {
  console.log('=== TESTING CUSTOMER PORTAL ADDRESS FLOW ===\n');
  
  // Step 1: Send PIN
  console.log('1. Requesting PIN for dominicnel@mac.com...');
  let response = await fetch(`${API_URL}/api/auth/send-pin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'dominicnel@mac.com' })
  });
  let data = await response.json();
  console.log('   PIN sent:', data.message);
  
  // Step 2: Get PIN from development mode
  const pin = '123456'; // Development PIN
  console.log(`2. Using development PIN: ${pin}`);
  
  // Step 3: Verify PIN
  console.log('3. Verifying PIN...');
  response = await fetch(`${API_URL}/api/auth/verify-pin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      email: 'dominicnel@mac.com',
      pin: pin 
    })
  });
  
  const cookies = response.headers.raw()['set-cookie'];
  const sessionCookie = cookies?.find(c => c.includes('connect.sid'));
  console.log('   Session created:', !!sessionCookie);
  
  // Step 4: Check authentication
  console.log('4. Checking authentication...');
  response = await fetch(`${API_URL}/api/auth/customer/me`, {
    headers: { 'Cookie': sessionCookie }
  });
  const user = await response.json();
  console.log('   Authenticated as:', user.email, `(${user.id})`);
  
  // Step 5: Get addresses
  console.log('\n5. Fetching addresses...');
  response = await fetch(`${API_URL}/api/portal/addresses`, {
    headers: { 'Cookie': sessionCookie }
  });
  const addresses = await response.json();
  console.log('   Current addresses:', addresses);
  
  // Step 6: Create a test address
  console.log('\n6. Creating new address...');
  const csrfResponse = await fetch(`${API_URL}/api/csrf/token`, {
    headers: { 'Cookie': sessionCookie }
  });
  const { csrfToken } = await csrfResponse.json();
  
  response = await fetch(`${API_URL}/api/portal/addresses`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Cookie': sessionCookie,
      'X-CSRF-Token': csrfToken
    },
    body: JSON.stringify({
      type: 'shipping',
      line1: '6A 2nd Street, Linden',
      line2: '',
      city: 'Johannesburg', 
      zip: '2195',
      country: 'ZA'
    })
  });
  
  const newAddress = await response.json();
  console.log('   Response status:', response.status);
  console.log('   Created address:', newAddress);
  
  // Step 7: Fetch addresses again
  console.log('\n7. Fetching addresses after creation...');
  response = await fetch(`${API_URL}/api/portal/addresses`, {
    headers: { 'Cookie': sessionCookie }
  });
  const updatedAddresses = await response.json();
  console.log('   Updated addresses:', updatedAddresses);
  
  // Step 8: Test orders endpoint
  console.log('\n8. Testing orders endpoint...');
  response = await fetch(`${API_URL}/api/portal/orders`, {
    headers: { 'Cookie': sessionCookie }
  });
  const orders = await response.json();
  console.log('   Orders:', orders?.length ? `${orders.length} order(s) found` : 'No orders');
  
  console.log('\n=== TEST COMPLETE ===');
}

testAddressFlow().catch(console.error);
