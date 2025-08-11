#!/usr/bin/env node

// Test OAuth flow to understand redirect behavior

console.log('=== OAUTH FLOW DEBUG TEST ===');

// Test current environment setup
const adminEmails = (process.env.ALLOWED_ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(e => e);
console.log('\n1. ADMIN EMAILS CONFIGURATION:');
adminEmails.forEach((email, i) => console.log(`   ${i+1}. ${email}`));

// Test role determination
console.log('\n2. ROLE DETERMINATION TEST:');
const testEmails = ['dominic@oricle.app', 'dominic96@replit.com'];
testEmails.forEach(email => {
  const isAdmin = adminEmails.includes(email);
  const role = isAdmin ? 'admin' : 'customer';
  console.log(`   ${email} → ${role} ${isAdmin ? '✅' : '❌'}`);
});

console.log('\n3. OAUTH CALLBACK LOGIC:');
console.log('   If role === "admin" → redirect to /admin');
console.log('   If role === "customer" → redirect to /');

console.log('\n4. CURRENT ISSUE ANALYSIS:');
console.log('   ❌ User logged in as: dominic@oricle.app (customer role)');
console.log('   ❌ Redirect destination: / (homepage)');
console.log('   ✅ Expected: Need to login as dominic96@replit.com (admin role)');
console.log('   ✅ Expected redirect: /admin (admin dashboard)');

console.log('\n5. SOLUTION:');
console.log('   • Either: Add dominic@oricle.app to ALLOWED_ADMIN_EMAILS');
console.log('   • Or: Login using dominic96@replit.com account instead');

console.log('\n=== END DEBUG TEST ===');