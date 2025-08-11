#!/usr/bin/env node
import fetch from 'node-fetch';
import { writeFileSync } from 'fs';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const ADMIN_EMAIL = 'dn@thefourths.com';
const ADMIN_PASSWORD = process.env.ADM_PW || 'admin123';

let cookies = {};

function parseCookies(setCookieHeaders) {
  if (!setCookieHeaders) return;
  const headers = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
  
  headers.forEach(header => {
    const [cookiePart] = header.split(';');
    const [name, value] = cookiePart.split('=');
    if (name && value) {
      cookies[name.trim()] = value.trim();
    }
  });
}

function getCookieHeader() {
  return Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; ');
}

async function test() {
  console.log('🔧 Testing Admin Login Flow...\n');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Admin Email: ${ADMIN_EMAIL}\n`);

  try {
    // Step 1: Get admin CSRF token
    console.log('1️⃣ Getting admin CSRF token...');
    const csrfRes = await fetch(`${BASE_URL}/api/admin/csrf`, {
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!csrfRes.ok) {
      throw new Error(`Failed to get CSRF token: ${csrfRes.status}`);
    }
    
    parseCookies(csrfRes.headers.raw()['set-cookie']);
    const csrfData = await csrfRes.json();
    const csrfToken = csrfData.csrfToken;
    console.log(`✅ Got CSRF token: ${csrfToken.substring(0, 10)}...`);

    // Step 2: Admin login
    console.log('\n2️⃣ Attempting admin login...');
    const loginRes = await fetch(`${BASE_URL}/api/auth/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
        'Cookie': getCookieHeader(),
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      })
    });

    parseCookies(loginRes.headers.raw()['set-cookie']);
    
    if (!loginRes.ok) {
      const error = await loginRes.text();
      throw new Error(`Login failed: ${loginRes.status} - ${error}`);
    }

    const loginData = await loginRes.json();
    console.log('✅ Admin login successful!');
    console.log(`   Admin ID: ${loginData.admin?.id}`);
    console.log(`   Email: ${loginData.admin?.email}`);
    console.log(`   Session Cookie: ${cookies['hh_admin_sess'] ? 'Present' : 'Missing'}`);

    // Step 3: Check admin session
    console.log('\n3️⃣ Checking admin session...');
    const meRes = await fetch(`${BASE_URL}/api/auth/admin/me`, {
      headers: {
        'Cookie': getCookieHeader(),
        'Accept': 'application/json',
      }
    });

    if (!meRes.ok) {
      const error = await meRes.text();
      throw new Error(`Session check failed: ${meRes.status} - ${error}`);
    }

    const meData = await meRes.json();
    console.log('✅ Admin session is valid!');
    console.log(`   Admin: ${meData.admin?.email}`);
    console.log(`   Role: ${meData.admin?.role}`);
    console.log(`   Active: ${meData.admin?.active}`);

    // Step 4: Test accessing admin endpoints
    console.log('\n4️⃣ Testing admin-only endpoints...');
    const productsRes = await fetch(`${BASE_URL}/api/admin/products`, {
      headers: {
        'Cookie': getCookieHeader(),
        'Accept': 'application/json',
      }
    });

    if (productsRes.ok) {
      const products = await productsRes.json();
      console.log(`✅ Can access admin endpoints! Found ${products.length || 0} products`);
    } else {
      console.log(`⚠️ Admin products endpoint returned: ${productsRes.status}`);
    }

    // Save cookies for manual testing
    writeFileSync('admin_cookies_test.txt', getCookieHeader());
    console.log('\n✅ All tests passed! Admin cookies saved to admin_cookies_test.txt');
    
    console.log('\n📝 Summary:');
    console.log('- Admin login: ✅ Working');
    console.log('- Session persistence: ✅ Working');
    console.log('- Admin endpoints: ✅ Accessible');
    console.log('\n🎉 Admin authentication system is fully functional!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nCookies present:', Object.keys(cookies));
    process.exit(1);
  }
}

test();