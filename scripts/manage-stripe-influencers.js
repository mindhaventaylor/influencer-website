#!/usr/bin/env node

// Script to manage multiple influencers in the same Stripe account
const Stripe = require('stripe');
const fs = require('fs');
const path = require('path');

console.log('🎭 **MANAGE STRIPE INFLUENCERS**\n');

async function listAllInfluencers(stripeSecretKey) {
  console.log('📋 **LISTING ALL INFLUENCERS IN STRIPE**\n');
  
  const stripe = new Stripe(stripeSecretKey);
  
  try {
    // Get all products
    const products = await stripe.products.list({ limit: 100 });
    
    // Group products by influencer
    const influencers = {};
    
    products.data.forEach(product => {
      const influencerHandle = product.metadata.influencer;
      if (influencerHandle) {
        if (!influencers[influencerHandle]) {
          influencers[influencerHandle] = {
            handle: influencerHandle,
            products: [],
            prices: []
          };
        }
        influencers[influencerHandle].products.push(product);
      }
    });
    
    // Get prices for each influencer
    for (const [handle, influencer] of Object.entries(influencers)) {
      for (const product of influencer.products) {
        const prices = await stripe.prices.list({ product: product.id });
        influencer.prices.push(...prices.data);
      }
    }
    
    // Display results
    Object.entries(influencers).forEach(([handle, influencer]) => {
      console.log(`👤 **${handle.toUpperCase()}**`);
      console.log(`   Products: ${influencer.products.length}`);
      console.log(`   Prices: ${influencer.prices.length}`);
      
      influencer.products.forEach(product => {
        console.log(`   📦 ${product.name} (${product.id})`);
        const productPrices = influencer.prices.filter(p => p.product === product.id);
        productPrices.forEach(price => {
          console.log(`      💰 $${(price.unit_amount / 100).toFixed(2)}/${price.recurring.interval} (${price.id})`);
        });
      });
      console.log('');
    });
    
    return influencers;
    
  } catch (error) {
    console.error('❌ Error listing influencers:', error.message);
    throw error;
  }
}

async function createInfluencerInStripe(influencerName, handle, plans, stripeSecretKey) {
  console.log(`🔄 **CREATING ${influencerName.toUpperCase()} IN STRIPE**\n`);
  
  const stripe = new Stripe(stripeSecretKey);
  const createdProducts = {};
  const createdPrices = {};
  
  try {
    for (const plan of plans) {
      // Create product
      const product = await stripe.products.create({
        name: `${influencerName} - ${plan.name}`,
        description: plan.description,
        metadata: {
          influencer: handle,
          plan_id: plan.id,
          access_level: plan.accessLevel
        }
      });
      
      createdProducts[plan.id] = product.id;
      console.log(`✅ Created product: ${product.name} (${product.id})`);
      
      // Create price
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.priceCents,
        currency: plan.currency,
        recurring: {
          interval: plan.interval
        },
        metadata: {
          influencer: handle,
          plan_id: plan.id,
          access_level: plan.accessLevel
        }
      });
      
      createdPrices[`${plan.id}_${plan.interval}`] = price.id;
      console.log(`✅ Created price: ${price.id} ($${(plan.priceCents / 100).toFixed(2)}/${plan.interval})`);
    }
    
    console.log('\n🎉 All Stripe products and prices created successfully!');
    return { products: createdProducts, prices: createdPrices };
    
  } catch (error) {
    console.error('❌ Error creating Stripe products/prices:', error.message);
    throw error;
  }
}

async function deleteInfluencerFromStripe(influencerHandle, stripeSecretKey) {
  console.log(`🗑️ **DELETING ${influencerHandle.toUpperCase()} FROM STRIPE**\n`);
  
  const stripe = new Stripe(stripeSecretKey);
  
  try {
    // Get all products for this influencer
    const products = await stripe.products.list({ limit: 100 });
    const influencerProducts = products.data.filter(p => p.metadata.influencer === influencerHandle);
    
    if (influencerProducts.length === 0) {
      console.log(`❌ No products found for influencer: ${influencerHandle}`);
      return;
    }
    
    console.log(`Found ${influencerProducts.length} products to delete:`);
    
    for (const product of influencerProducts) {
      console.log(`🗑️ Deleting product: ${product.name} (${product.id})`);
      
      // Archive the product (Stripe doesn't allow deleting products with prices)
      await stripe.products.update(product.id, { active: false });
      
      // Get all prices for this product
      const prices = await stripe.prices.list({ product: product.id });
      
      // Archive all prices
      for (const price of prices.data) {
        console.log(`   🗑️ Archiving price: ${price.id}`);
        await stripe.prices.update(price.id, { active: false });
      }
    }
    
    console.log('\n✅ Influencer deleted successfully!');
    
  } catch (error) {
    console.error('❌ Error deleting influencer:', error.message);
    throw error;
  }
}

async function generateStripeReport(stripeSecretKey) {
  console.log('📊 **GENERATING STRIPE REPORT**\n');
  
  const stripe = new Stripe(stripeSecretKey);
  
  try {
    // Get all products
    const products = await stripe.products.list({ limit: 100 });
    
    // Get all subscriptions
    const subscriptions = await stripe.subscriptions.list({ limit: 100 });
    
    // Group by influencer
    const influencerStats = {};
    
    products.data.forEach(product => {
      const influencerHandle = product.metadata.influencer;
      if (influencerHandle) {
        if (!influencerStats[influencerHandle]) {
          influencerStats[influencerHandle] = {
            products: 0,
            activeSubscriptions: 0,
            revenue: 0
          };
        }
        influencerStats[influencerHandle].products++;
      }
    });
    
    // Count subscriptions and revenue
    subscriptions.data.forEach(subscription => {
      if (subscription.status === 'active') {
        // Get product from price
        const price = subscription.items.data[0].price;
        // Find product
        const product = products.data.find(p => p.id === price.product);
        if (product && product.metadata.influencer) {
          const influencerHandle = product.metadata.influencer;
          influencerStats[influencerHandle].activeSubscriptions++;
          influencerStats[influencerHandle].revenue += (price.unit_amount * subscription.items.data[0].quantity);
        }
      }
    });
    
    // Display report
    console.log('📈 **INFLUENCER PERFORMANCE REPORT**\n');
    Object.entries(influencerStats).forEach(([handle, stats]) => {
      console.log(`👤 **${handle.toUpperCase()}**`);
      console.log(`   Products: ${stats.products}`);
      console.log(`   Active Subscriptions: ${stats.activeSubscriptions}`);
      console.log(`   Monthly Revenue: $${(stats.revenue / 100).toFixed(2)}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error generating report:', error.message);
    throw error;
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY || args[1];
  
  if (!stripeSecretKey) {
    console.error('❌ Please provide Stripe secret key as argument or set STRIPE_SECRET_KEY environment variable');
    process.exit(1);
  }
  
  try {
    switch (command) {
      case 'list':
        await listAllInfluencers(stripeSecretKey);
        break;
        
      case 'create':
        const influencerName = args[2];
        const handle = args[3];
        if (!influencerName || !handle) {
          console.error('❌ Usage: node manage-stripe-influencers.js create <influencer_name> <handle>');
          process.exit(1);
        }
        // You would need to provide plans here
        console.log('❌ Create command needs plans data - use create-influencer-template.js instead');
        break;
        
      case 'delete':
        const deleteHandle = args[2];
        if (!deleteHandle) {
          console.error('❌ Usage: node manage-stripe-influencers.js delete <handle>');
          process.exit(1);
        }
        await deleteInfluencerFromStripe(deleteHandle, stripeSecretKey);
        break;
        
      case 'report':
        await generateStripeReport(stripeSecretKey);
        break;
        
      default:
        console.log('📋 **Available Commands:**');
        console.log('  list    - List all influencers in Stripe');
        console.log('  delete  - Delete influencer from Stripe');
        console.log('  report  - Generate performance report');
        console.log('');
        console.log('📖 **Usage:**');
        console.log('  node manage-stripe-influencers.js list <stripe_secret_key>');
        console.log('  node manage-stripe-influencers.js delete <handle> <stripe_secret_key>');
        console.log('  node manage-stripe-influencers.js report <stripe_secret_key>');
        break;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
