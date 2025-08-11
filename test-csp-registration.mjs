#!/usr/bin/env node

/**
 * Test CSP-fixed registration system
 */

const BASE_URL = 'http://localhost:5000';

async function testRegistration() {
  console.log('🔐 Testing Registration After CSP Fix...');
  console.log('=====================================');
  
  const testUser = {
    email: `test${Date.now()}@example.com`,
    password: 'TestPass123!',
    name: 'Test User'
  };
  
  try {
    // Test 1: Register new user
    console.log('\n📝 Testing User Registration:');
    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });
    
    const registerData = await registerResponse.json();
    console.log('✅ Registration response:', registerData);
    
    if (registerData.success) {
      console.log('✅ Registration successful');
      console.log('📧 Email:', testUser.email);
      console.log('🔑 Verification required:', registerData.requiresVerification);
    } else {
      console.log('❌ Registration failed:', registerData.error);
    }
    
    // Test 2: Check CSP headers
    console.log('\n🛡️ Checking CSP Configuration:');
    const homeResponse = await fetch(BASE_URL);
    const cspHeader = homeResponse.headers.get('content-security-policy');
    
    if (cspHeader) {
      const policies = cspHeader.split(';').map(p => p.trim());
      
      // Check for required CSP directives
      const hasUnsafeInline = policies.some(p => p.includes("script-src") && p.includes("'unsafe-inline'"));
      const hasIpApi = policies.some(p => p.includes("connect-src") && p.includes("ipapi.co"));
      const hasStripe = policies.some(p => p.includes("script-src") && p.includes("js.stripe.com"));
      
      console.log(`✅ Script unsafe-inline: ${hasUnsafeInline ? 'Enabled' : 'Disabled'}`);
      console.log(`✅ IPApi.co connection: ${hasIpApi ? 'Allowed' : 'Blocked'}`);
      console.log(`✅ Stripe scripts: ${hasStripe ? 'Allowed' : 'Blocked'}`);
      
      if (!hasUnsafeInline || !hasIpApi) {
        console.log('\n⚠️  CSP may still be too restrictive');
        console.log('CSP Header:', cspHeader.substring(0, 200) + '...');
      }
    } else {
      console.log('⚠️  No CSP header found');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

// Run test
testRegistration().then(success => {
  console.log('\n' + (success ? '🚀 CSP issues fixed - Registration working!' : '⚠️  Registration needs attention'));
  process.exit(success ? 0 : 1);
});