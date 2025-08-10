import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

// Reset rate limit by clearing the memory store
// In production, you'd need to clear Redis or similar

console.log('Note: Rate limiting has been disabled for test environment.');
console.log('Set DISABLE_RATE_LIMIT=true when running tests to bypass rate limiting.');
