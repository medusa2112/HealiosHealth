import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function testAdminLogin() {
  console.log('Testing admin login with production credentials...\n');
  
  // Test primary admin
  console.log('1. Testing dn@thefourths.com:');
  const primaryRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'dn@thefourths.com',
      password: process.env.ADM_PW
    })
  });
  
  if (primaryRes.ok) {
    const data = await primaryRes.json();
    console.log('✅ Primary admin login successful:', data.user);
  } else {
    console.log('❌ Primary admin login failed:', primaryRes.status, await primaryRes.text());
  }
  
  // Test backup admin
  console.log('\n2. Testing admin@healios.com:');
  const backupRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@healios.com',
      password: process.env.ADM_PW
    })
  });
  
  if (backupRes.ok) {
    const data = await backupRes.json();
    console.log('✅ Backup admin login successful:', data.user);
  } else {
    console.log('❌ Backup admin login failed:', backupRes.status, await backupRes.text());
  }
}

testAdminLogin().catch(console.error);
