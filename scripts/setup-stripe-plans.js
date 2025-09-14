#!/usr/bin/env node

// Script to set up Stripe products and prices for testing
require('dotenv').config({ path: '.env.local' });

const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

console.log('💳 **SETTING UP STRIPE PRODUCTS AND PRICES**\n');

async function setupStripeProducts() {
  try {
    console.log('🔍 Checking for existing products...\n');

    // Check if we already have products
    const existingProducts = await stripe.products.list({ limit: 10 });
    
    if (existingProducts.data.length > 0) {
      console.log('✅ Found existing products:');
      existingProducts.data.forEach(product => {
        console.log(`   - ${product.name} (${product.id})`);
      });
      console.log('\n💡 You can use these existing products or create new ones.\n');
    }

    console.log('🚀 **Creating sample products and prices...**\n');

    // Create sample products for different influencer tiers
    const sampleProducts = [
      {
        name: 'Basic Chat Access',
        description: 'Basic access to chat with Taylor Swift',
        features: [
          '5 messages per day',
          'Basic responses',
          'Standard response time'
        ]
      },
      {
        name: 'Premium Chat Access',
        description: 'Premium access to chat with Taylor Swift',
        features: [
          'Unlimited messages',
          'Priority responses',
          'Faster response time',
          'Exclusive content'
        ]
      },
      {
        name: 'VIP Chat Access',
        description: 'VIP access to chat with Taylor Swift',
        features: [
          'Unlimited messages',
          'Instant responses',
          'Personalized content',
          'Exclusive updates',
          'Direct access'
        ]
      }
    ];

    const createdProducts = [];

    for (const productData of sampleProducts) {
      console.log(`Creating product: ${productData.name}`);
      
      const product = await stripe.products.create({
        name: productData.name,
        description: productData.description,
        metadata: {
          features: JSON.stringify(productData.features)
        }
      });

      // Create monthly price
      const monthlyPrice = await stripe.prices.create({
        unit_amount: getPriceForProduct(productData.name, 'monthly'),
        currency: 'usd',
        recurring: { interval: 'month' },
        product: product.id,
      });

      // Create yearly price (with discount)
      const yearlyPrice = await stripe.prices.create({
        unit_amount: getPriceForProduct(productData.name, 'yearly'),
        currency: 'usd',
        recurring: { interval: 'year' },
        product: product.id,
      });

      createdProducts.push({
        product,
        monthlyPrice,
        yearlyPrice,
        features: productData.features
      });

      console.log(`   ✅ Product created: ${product.id}`);
      console.log(`   ✅ Monthly price: ${monthlyPrice.id} (${formatPrice(getPriceForProduct(productData.name, 'monthly'))}/month)`);
      console.log(`   ✅ Yearly price: ${yearlyPrice.id} (${formatPrice(getPriceForProduct(productData.name, 'yearly'))}/year)`);
      console.log('');
    }

    console.log('🎉 **Setup complete!**\n');
    console.log('📋 **Next steps:**');
    console.log('1. Add these product IDs to your database plans table');
    console.log('2. Use the price IDs in your checkout sessions');
    console.log('3. Test the payment flow\n');

    console.log('📄 **Product Summary:**');
    createdProducts.forEach(({ product, monthlyPrice, yearlyPrice, features }) => {
      console.log(`\n**${product.name}**`);
      console.log(`   Product ID: ${product.id}`);
      console.log(`   Monthly Price ID: ${monthlyPrice.id}`);
      console.log(`   Yearly Price ID: ${yearlyPrice.id}`);
      console.log(`   Features: ${features.join(', ')}`);
    });

    console.log('\n💡 **To add these to your database:**');
    console.log('Run the database setup script or manually insert the data.');

  } catch (error) {
    console.error('❌ Error setting up Stripe products:', error.message);
  }
}

function getPriceForProduct(productName, interval) {
  const prices = {
    'Basic Chat Access': {
      monthly: 999, // $9.99
      yearly: 9999  // $99.99 (2 months free)
    },
    'Premium Chat Access': {
      monthly: 1999, // $19.99
      yearly: 19999  // $199.99 (2 months free)
    },
    'VIP Chat Access': {
      monthly: 4999, // $49.99
      yearly: 49999  // $499.99 (2 months free)
    }
  };
  
  return prices[productName]?.[interval] || 999;
}

function formatPrice(amountInCents) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amountInCents / 100);
}

setupStripeProducts();
