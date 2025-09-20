import jwt from 'jsonwebtoken';

const JWT_SECRET = '12345';

// Create a test user
const testUser = {
  userId: 1,
  username: 'testuser',
  isAdmin: true
};

// Generate token that never expires
const token = jwt.sign(testUser, JWT_SECRET);

console.log('Test Token:');
console.log(token);
console.log('\nUse this in your requests:');
console.log(`Authorization: Bearer ${token}`);