import fetch from 'node-fetch';

async function testAdminLogin() {
  const baseUrl = 'http://localhost:5000';
  
  console.log('🔐 Testing production admin login...');
  console.log('📧 Email: dn@thefourths.com');
  console.log('🔑 Password: [Using ADM_PW secret]\n');
  
  try {
    // Login request
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'dn@thefourths.com',
        password: process.env.ADM_PW
      })
    });
    
    const loginResult = await loginResponse.json();
    
    if (loginResponse.ok && loginResult.user) {
      console.log('✅ Login successful!');
      console.log('👤 User:', {
        id: loginResult.user.id,
        email: loginResult.user.email,
        role: loginResult.user.role,
        firstName: loginResult.user.firstName,
        lastName: loginResult.user.lastName
      });
      
      // Extract cookies for session
      const cookies = loginResponse.headers.raw()['set-cookie'];
      if (cookies) {
        console.log('\n🍪 Session established');
        console.log('✓ Ready for admin operations');
      }
      
      // Test admin access
      const adminTestResponse = await fetch(`${baseUrl}/api/admin/orders`, {
        method: 'GET',
        headers: {
          'Cookie': cookies ? cookies.join('; ') : ''
        }
      });
      
      if (adminTestResponse.ok) {
        console.log('✅ Admin access verified - can access admin endpoints');
      } else {
        console.log('⚠️ Admin endpoint returned:', adminTestResponse.status);
      }
      
    } else {
      console.log('❌ Login failed:', loginResult.error || 'Unknown error');
    }
  } catch (error) {
    console.log('❌ Error during login test:', error.message);
  }
}

testAdminLogin();
