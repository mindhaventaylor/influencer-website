#!/usr/bin/env node

// Script to help set up Stripe environment variables
const fs = require('fs');
const path = require('path');

console.log('💳 **SETTING UP STRIPE PAYMENTS**\n');

// Check if .env.local exists
const envPath = path.join(__dirname, '../.env.local');
const envExists = fs.existsSync(envPath);

console.log('📋 **Environment Setup:**');

if (envExists) {
  console.log('✅ .env.local file exists');
  console.log('📝 You need to add these Stripe variables to your .env.local file:\n');
} else {
  console.log('⚠️  .env.local file not found');
  console.log('📝 Create a .env.local file with these variables:\n');
}

console.log('# Add these lines to your .env.local file:');
console.log('');
console.log('# Stripe Configuration');
console.log('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51S6dfkRzyGIanNct9Aj5XTOf3fwHdHpmFidCk9r4xLd1DFR3IKENCytUVkSHmNXCvvkfvO5nZdJBo4rSLN7qANGn005dTnjPGY');
console.log('STRIPE_SECRET_KEY=sk_test_51S6dfkRzyGIanNctawSg0T298jHbCCLJ3GLunvHnYOeSeE8PJjCbAp1fWvUXAbU7QfrAj2xtMKW6pLPq8Bsb4JWw00i5UIImTr');
console.log('STRIPE_WEBHOOK_SECRET=your_webhook_secret_when_ready');
console.log('');

console.log('🚀 **Next steps:**');
console.log('1. Add the Stripe keys to your .env.local file');
console.log('2. Install Stripe dependencies: npm install stripe @stripe/stripe-js');
console.log('3. I\'ll create the payment integration for you');
console.log('');

console.log('💡 **Security Note:**');
console.log('- The publishable key (pk_test_...) is safe for frontend use');
console.log('- The secret key (sk_test_...) should only be used on the backend');
console.log('- Never commit these keys to version control');
