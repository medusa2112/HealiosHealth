import fetch from 'node-fetch';

async function testAddressCreation() {
  const API_URL = 'http://localhost:5000';
  
  console.log('=== Testing Address Creation Flow ===\n');
  
  // First, send PIN
  console.log('1. Sending PIN...');
  await fetch(`${API_URL}/api/auth/send-pin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'dominicnel@mac.com' })
  });
  
  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Use development PIN
  console.log('2. Verifying with development PIN (123456)...');
  const verifyResponse = await fetch(`${API_URL}/api/auth/verify-pin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      email: 'dominicnel@mac.com',
      pin: '123456'
    })
  });
  
  const verifyData = await verifyResponse.json();
  console.log('   Response:', verifyData.message);
  
  if (!verifyData.success) {
    console.log('\nNote: PIN verification failed. In development mode, the PIN is sent to your actual email.');
    console.log('Please check your email for the PIN and update the script with the correct PIN.');
    return;
  }
  
  // Get cookies
  const cookies = verifyResponse.headers.raw()['set-cookie'];
  const sessionCookie = cookies?.find(c => c.includes('connect.sid'));
  
  if (!sessionCookie) {
    console.log('No session cookie received');
    return;
  }
  
  // Get CSRF token
  console.log('\n3. Getting CSRF token...');
  const csrfResponse = await fetch(`${API_URL}/api/csrf/token`, {
    headers: { 'Cookie': sessionCookie }
  });
  const csrfData = await csrfResponse.json();
  console.log('   Token obtained:', csrfData.csrfToken ? 'Yes' : 'No');
  
  // Test address creation
  console.log('\n4. Creating test address...');
  const createResponse = await fetch(`${API_URL}/api/portal/addresses`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Cookie': sessionCookie,
      'X-CSRF-Token': csrfData.csrfToken
    },
    body: JSON.stringify({
      type: 'shipping',
      line1: '6A 2nd Street, Linden',
      line2: '',
      city: 'Johannesburg',
      zipCode: '2195',
      country: 'ZA'
    })
  });
  
  const createData = await createResponse.json();
  console.log('   Status:', createResponse.status);
  console.log('   Response:', createData);
  
  // Fetch addresses to verify
  console.log('\n5. Fetching addresses to verify...');
  const listResponse = await fetch(`${API_URL}/api/portal/addresses`, {
    headers: { 'Cookie': sessionCookie }
  });
  
  const addresses = await listResponse.json();
  console.log('   Total addresses:', Array.isArray(addresses) ? addresses.length : 'Error');
  if (Array.isArray(addresses) && addresses.length > 0) {
    console.log('   Latest address:', addresses[addresses.length - 1]);
  }
  
  console.log('\n=== Test Complete ===');
}

testAddressCreation().catch(console.error);
