import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function testAdminOAuthFlow() {
  console.log('Testing Admin OAuth Flow...\n');
  
  try {
    // Step 1: Test /api/admin/oauth/login redirect
    console.log('1. Testing /api/admin/oauth/login redirect...');
    const loginResponse = await fetch(`${BASE_URL}/api/admin/oauth/login`, {
      redirect: 'manual',
      headers: {
        'Accept': 'text/html,application/json'
      }
    });
    
    const location = loginResponse.headers.get('location');
    const setCookie = loginResponse.headers.get('set-cookie');
    
    console.log('   Status:', loginResponse.status);
    console.log('   Redirect to:', location);
    console.log('   Session cookie set:', !!setCookie);
    
    if (loginResponse.status !== 302 || location !== '/api/login') {
      console.error('   ❌ Expected redirect to /api/login');
    } else {
      console.log('   ✅ Correctly redirects to /api/login');
    }
    
    // Extract session cookie for next request
    const sessionCookie = setCookie ? setCookie.split(';')[0] : '';
    
    // Step 2: Test /api/admin/oauth/status (should be unauthenticated initially)
    console.log('\n2. Testing /api/admin/oauth/status (before auth)...');
    const statusResponse = await fetch(`${BASE_URL}/api/admin/oauth/status`, {
      headers: {
        'Cookie': sessionCookie
      }
    });
    
    const statusData = await statusResponse.json();
    console.log('   Response:', JSON.stringify(statusData));
    
    if (statusData.authenticated === false) {
      console.log('   ✅ Correctly shows unauthenticated');
    } else {
      console.log('   ❌ Should be unauthenticated before OAuth login');
    }
    
    // Step 3: Check admin dashboard access (should fail without auth)
    console.log('\n3. Testing /api/admin access (without auth)...');
    const adminResponse = await fetch(`${BASE_URL}/api/admin`, {
      headers: {
        'Cookie': sessionCookie
      }
    });
    
    if (adminResponse.status === 401) {
      console.log('   ✅ Correctly blocks access (401)');
    } else {
      console.log('   ❌ Should return 401 without authentication');
    }
    
    console.log('\n✅ Admin OAuth flow test complete!');
    console.log('\nTo complete authentication:');
    console.log('1. Navigate to /api/admin/oauth/login in your browser');
    console.log('2. Complete the OAuth login with an admin account');
    console.log('3. You should be redirected to /admin after successful authentication');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAdminOAuthFlow();
