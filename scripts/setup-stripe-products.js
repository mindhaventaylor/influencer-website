#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });/usr/bin/env node

const Stripe = require('stripe');
const { loadConfig } = require('./config-loader');
const { validateEnvironment } = require('./config-loader');

// Validate environment variables
if (!validateEnvironment()) {
  process.exit(1);
}

const config = loadConfig();

async function setupStripeProducts() {
  console.log('💳 Setting up Stripe products for influencer...\n');

  try {
    if (!config.stripe.secretKey) {
      console.log('❌ Stripe secret key not configured. Please run "npm run setup:config" first.');
      return;
    }

    const stripe = new Stripe(config.stripe.secretKey);
    const influencerHandle = config.influencer.handle;

    console.log(`🎭 Setting up Stripe for: ${config.influencer.displayName}`);
    console.log(`🔗 Influencer handle: ${influencerHandle}\n`);

    // Create products and prices for each plan
    const products = {};
    const prices = {};

    for (const plan of config.plans) {
      console.log(`📦 Creating product: ${plan.name}`);
      
      // Create product
      const product = await stripe.products.create({
        name: plan.name,
        description: plan.description,
        metadata: {
          influencer_handle: influencerHandle,
          plan_id: plan.id,
          access_level: plan.accessLevel
        }
      });

      products[plan.id] = product.id;
      console.log(`   ✅ Product created: ${product.id}`);

      // Create price
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.priceCents,
        currency: plan.currency,
        recurring: {
          interval: plan.interval
        },
        metadata: {
          influencer_handle: influencerHandle,
          plan_id: plan.id,
          access_level: plan.accessLevel
        }
      });

      prices[plan.id] = price.id;
      console.log(`   💰 Price created: ${price.id} ($${plan.priceCents / 100}/${plan.interval})`);
    }

    // Update the config with the actual Stripe IDs
    const updatedConfig = {
      ...config,
      stripe: {
        ...config.stripe,
        products: products,
        prices: prices
      }
    };

    // Write updated config
    const fs = require('fs');
    const configContent = `module.exports = ${JSON.stringify(updatedConfig, null, 2)};`;
    fs.writeFileSync('./influencer.config.js', configContent);

    console.log('\n✅ Stripe setup complete!');
    console.log('─'.repeat(50));
    console.log('📦 Products created:');
    Object.entries(products).forEach(([planId, productId]) => {
      const plan = config.plans.find(p => p.id === planId);
      console.log(`   ${plan.name}: ${productId}`);
    });
    
    console.log('\n💰 Prices created:');
    Object.entries(prices).forEach(([planId, priceId]) => {
      const plan = config.plans.find(p => p.id === planId);
      console.log(`   ${plan.name}: ${priceId}`);
    });

    console.log('\n📝 Configuration updated with Stripe IDs');
    console.log('🎉 Your influencer now has independent Stripe products!');

  } catch (error) {
    console.error('❌ Error setting up Stripe:', error.message);
    if (error.type === 'StripeAuthenticationError') {
      console.log('💡 Make sure your Stripe secret key is correct and has the right permissions.');
    }
  }
}

setupStripeProducts();
