#!/usr/bin/env node

// Test the PIN verification email system end-to-end
import express from 'express';
import session from 'express-session';
import { MemoryStore } from 'memorystore';
import { sendVerificationEmail } from './server/lib/verification.js';

console.log('=== Testing PIN Email System ===\n');

async function testPinEmailSystem() {
  try {
    console.log('1. Testing development mode PIN email...');
    
    // Set development environment
    process.env.NODE_ENV = 'development';
    
    // Test sending PIN to a regular user email (should go to admin emails in dev)
    await sendVerificationEmail('user@example.com', '123456', 'Test User');
    console.log('✅ Development mode test completed');
    
    console.log('\n2. Testing admin email directly in development...');
    await sendVerificationEmail('dn@thefourths.com', '654321', 'Admin');
    console.log('✅ Admin email test completed');
    
    console.log('\n3. Testing production mode PIN email...');
    
    // Set production environment
    process.env.NODE_ENV = 'production';
    
    // Test sending PIN in production mode
    await sendVerificationEmail('dn@thefourths.com', '789012', 'Production User');
    console.log('✅ Production mode test completed');
    
    console.log('\n🎯 PIN email system tests completed successfully!');
    console.log('Check your inbox at dn@thefourths.com for test PIN emails.');
    
  } catch (error) {
    console.error('❌ PIN email system test failed:', error);
    console.error('Error details:', error.message);
    
    if (error.message?.includes('Cannot resolve')) {
      console.error('💡 This might be a module import issue. The PIN system should work correctly when running through the main application.');
    }
  }
}

testPinEmailSystem();