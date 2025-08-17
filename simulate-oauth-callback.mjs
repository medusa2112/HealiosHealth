import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function simulateOAuthCallback() {
  console.log('Simulating OAuth Callback with Admin Role...\n');
  
  try {
    // First, initiate admin login to set session flags
    console.log('1. Initiating admin login...');
    const loginResponse = await fetch(`${BASE_URL}/api/admin/oauth/login`, {
      redirect: 'manual'
    });
    
    const sessionCookie = loginResponse.headers.get('set-cookie')?.split(';')[0] || '';
    console.log('   Session cookie obtained:', !!sessionCookie);
    
    // Simulate OAuth callback with admin user data
    console.log('\n2. Simulating OAuth callback with admin credentials...');
    // Note: This won't work without actual OAuth, but shows the expected flow
    
    // Check status after simulated callback
    console.log('\n3. Checking admin status after OAuth...');
    const statusResponse = await fetch(`${BASE_URL}/api/admin/oauth/status`, {
      headers: {
        'Cookie': sessionCookie
      }
    });
    
    const statusData = await statusResponse.json();
    console.log('   Status response:', JSON.stringify(statusData, null, 2));
    
    if (statusData.authenticated) {
      console.log('   ✅ Admin is authenticated!');
      console.log('   Email:', statusData.email);
      console.log('   Role:', statusData.role);
    } else {
      console.log('   ⚠️  Admin not authenticated (requires actual OAuth flow)');
    }
    
    console.log('\n📝 Note: To complete actual authentication:');
    console.log('   1. Go to http://localhost:5000/admin in your browser');
    console.log('   2. Click "Admin Login" button');
    console.log('   3. Complete OAuth with an admin account');
    console.log('   4. You should be redirected to /admin dashboard');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

simulateOAuthCallback();
