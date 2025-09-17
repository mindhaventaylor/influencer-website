#!/usr/bin/env node

// Script to check current Stripe prices
require('dotenv').config({ path: '.env.local' });

const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const config = require('../influencer.config.js');

console.log('🔍 **CHECKING STRIPE PRICES**\n');

async function checkStripePrices() {
  try {
    console.log('🔍 Checking current Stripe prices...\n');

    // Load deployment info to get current Stripe price IDs
    const fs = require('fs');
    const deploymentInfoPath = './deployment-info.json';
    
    if (!fs.existsSync(deploymentInfoPath)) {
      console.log('❌ deployment-info.json not found');
      return;
    }

    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentInfoPath, 'utf8'));
    
    console.log('📋 Current Stripe Prices vs Configuration:');
    console.log('');

    for (const planConfig of config.plans) {
      const priceId = planConfig.stripePriceId;
      const deploymentPlan = deploymentInfo.plans.find(p => p.id === planConfig.id);
      
      console.log(`🎯 ${planConfig.name} (${planConfig.id}):`);
      console.log(`   Config Price: $${planConfig.priceCents/100}/${planConfig.interval}`);
      console.log(`   Config Price ID: ${priceId}`);
      
      if (deploymentPlan) {
        console.log(`   Deployment Price: $${deploymentPlan.price/100}/${deploymentPlan.interval}`);
        console.log(`   Deployment Price ID: ${deploymentPlan.stripePriceId}`);
      }
      
      try {
        const price = await stripe.prices.retrieve(priceId);
        console.log(`   Stripe Price: $${price.unit_amount/100}/${price.recurring.interval}`);
        console.log(`   Stripe Product: ${price.product}`);
        
        // Check if prices match
        const configPrice = planConfig.priceCents;
        const stripePrice = price.unit_amount;
        
        if (configPrice === stripePrice) {
          console.log(`   ✅ Prices match!`);
        } else {
          console.log(`   ❌ Price mismatch! Config: $${configPrice/100}, Stripe: $${stripePrice/100}`);
        }
      } catch (error) {
        console.log(`   ❌ Error fetching Stripe price: ${error.message}`);
      }
      
      console.log('');
    }

    console.log('🎉 Stripe prices check completed!');
    
  } catch (error) {
    console.error('❌ Error checking Stripe prices:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the check
checkStripePrices();

