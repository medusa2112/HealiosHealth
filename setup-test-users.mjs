#!/usr/bin/env node

// Script to create test users for Phase 8 authentication testing
// This ensures test users exist with known credentials

import bcrypt from 'bcrypt';
import pg from 'pg';
import { config } from 'dotenv';

config();

const { Pool } = pg;
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon.tech') 
    ? { rejectUnauthorized: false } 
    : false
});

const TEST_USERS = [
  {
    email: 'test.customer@example.com',
    password: 'TestCustomer123!',
    firstName: 'Test',
    lastName: 'Customer',
    role: 'customer',
  },
  {
    email: 'test.admin@healios.com',
    password: 'TestAdmin123!',
    firstName: 'Test',
    lastName: 'Admin',
    role: 'admin',
  }
];

async function setupTestUsers() {
  console.log('Setting up test users for Phase 8...\n');
  
  for (const user of TEST_USERS) {
    try {
      // Check if user exists
      const existing = await pool.query(
        'SELECT id, email, role FROM users WHERE email = $1',
        [user.email]
      );
      
      if (existing.rows.length > 0) {
        // Update existing user's password
        const passwordHash = await bcrypt.hash(user.password, 10);
        await pool.query(
          'UPDATE users SET password = $1, role = $2 WHERE email = $3',
          [passwordHash, user.role, user.email]
        );
        console.log(`✓ Updated ${user.role}: ${user.email}`);
      } else {
        // Create new user
        const passwordHash = await bcrypt.hash(user.password, 10);
        await pool.query(
          `INSERT INTO users (email, password, "firstName", "lastName", role, "emailVerified") 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [user.email, passwordHash, user.firstName, user.lastName, user.role, new Date().toISOString()]
        );
        console.log(`✓ Created ${user.role}: ${user.email}`);
      }
    } catch (error) {
      console.error(`✗ Error with ${user.email}:`, error.message);
    }
  }
  
  console.log('\nTest users ready. Credentials:');
  console.log('Customer: test.customer@example.com / TestCustomer123!');
  console.log('Admin: test.admin@healios.com / TestAdmin123!');
  
  await pool.end();
}

setupTestUsers().catch(console.error);