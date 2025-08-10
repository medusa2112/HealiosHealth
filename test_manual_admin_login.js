const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testAdminLogin() {
  console.log('Testing admin login and activity logs access...');
  
  // Login as admin
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'qa-activity-admin@healios.test',
      password: 'Test123!'
    })
  });
  
  console.log('Login status:', loginRes.status);
  
  if (!loginRes.ok) {
    const error = await loginRes.text();
    console.log('Login error:', error);
    return;
  }
  
  const cookies = loginRes.headers.raw()['set-cookie'];
  console.log('Cookies received:', cookies);
  
  // Try to access admin logs
  const logsRes = await fetch(`${BASE_URL}/api/admin/logs`, {
    method: 'GET',
    headers: {
      'Cookie': cookies ? cookies.join('; ') : ''
    }
  });
  
  console.log('Logs access status:', logsRes.status);
  
  if (logsRes.ok) {
    const data = await logsRes.json();
    console.log('Logs data:', data.logs ? `${data.logs.length} logs` : data);
  } else {
    const error = await logsRes.text();
    console.log('Logs error:', error);
  }
}

testAdminLogin().catch(console.error);
