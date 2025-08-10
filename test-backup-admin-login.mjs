import fetch from 'node-fetch';

async function testBackupAdminLogin() {
  const baseUrl = 'http://localhost:5000';

  console.log('🔐 Testing backup admin login...');
  const allowedAdminEmails = (process.env.ALLOWED_ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean);
  const adminEmail = allowedAdminEmails[1] || allowedAdminEmails[0] || 'admin@healios.com';
  console.log('📧 Email:', adminEmail);
  console.log('🔑 Password: [Using ADM_PW secret]\n');
  
  try {
    // Login request
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: adminEmail,
        password: process.env.ADM_PW
      })
    });
    
    const loginResult = await loginResponse.json();
    
    if (loginResponse.ok && loginResult.user) {
      console.log('✅ Backup admin login successful!');
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
      const adminTestResponse = await fetch(`${baseUrl}/api/admin/products`, {
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

testBackupAdminLogin();
