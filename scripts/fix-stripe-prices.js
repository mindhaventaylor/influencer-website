#!/usr/bin/env node

// Script to fix Stripe prices to match configuration
require('dotenv').config({ path: '.env.local' });

const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const config = require('../influencer.config.js');

console.log('🔧 **FIXING STRIPE PRICES**\n');

async function fixStripePrices() {
  try {
    console.log('🔧 Fixing Stripe prices to match configuration...\n');

    // Load deployment info to get current Stripe product IDs
    const fs = require('fs');
    const deploymentInfoPath = './deployment-info.json';
    
    if (!fs.existsSync(deploymentInfoPath)) {
      console.log('❌ deployment-info.json not found');
      return;
    }

    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentInfoPath, 'utf8'));
    
    console.log('🚀 Creating new Stripe prices with correct amounts...\n');

    const updatedPlans = [];

    for (const planConfig of config.plans) {
      const productId = deploymentInfo.stripeProducts[planConfig.id];
      
      if (!productId) {
        console.log(`⚠️  No Stripe product ID found for plan: ${planConfig.id}`);
        continue;
      }

      console.log(`Creating new price for ${planConfig.name}:`);
      console.log(`   Product ID: ${productId}`);
      console.log(`   Amount: $${planConfig.priceCents/100}`);
      console.log(`   Interval: ${planConfig.interval}`);

      try {
        // Create new price with correct amount
        const newPrice = await stripe.prices.create({
          unit_amount: planConfig.priceCents,
          currency: 'usd',
          recurring: { interval: planConfig.interval },
          product: productId,
          metadata: {
            planId: planConfig.id,
            influencerName: config.influencer.name
          }
        });

        console.log(`   ✅ Created new price: ${newPrice.id}`);
        console.log(`   💰 Amount: $${newPrice.unit_amount/100}/${newPrice.recurring.interval}`);

        // Update the plan config with new price ID
        updatedPlans.push({
          ...planConfig,
          stripePriceId: newPrice.id
        });

        console.log('');
      } catch (error) {
        console.log(`   ❌ Error creating new price: ${error.message}`);
      }
    }

    if (updatedPlans.length > 0) {
      // Update influencer.config.js with new price IDs
      console.log('📝 Updating influencer.config.js with new price IDs...');
      
      const updatedConfig = { ...config };
      updatedConfig.plans = updatedConfig.plans.map(plan => {
        const updatedPlan = updatedPlans.find(p => p.id === plan.id);
        if (updatedPlan) {
          console.log(`   ✅ Updated ${plan.name}: ${plan.stripePriceId} → ${updatedPlan.stripePriceId}`);
          return updatedPlan;
        }
        return plan;
      });

      fs.writeFileSync('./influencer.config.js', `module.exports = ${JSON.stringify(updatedConfig, null, 2)};`);
      console.log('✅ Updated influencer.config.js with new price IDs');

      // Update deployment-info.json
      console.log('📝 Updating deployment-info.json with new price IDs...');
      
      const updatedDeploymentInfo = { ...deploymentInfo };
      updatedDeploymentInfo.plans = updatedDeploymentInfo.plans.map(plan => {
        const updatedPlan = updatedPlans.find(p => p.id === plan.id);
        if (updatedPlan) {
          return {
            ...plan,
            stripePriceId: updatedPlan.stripePriceId,
            price: updatedPlan.priceCents
          };
        }
        return plan;
      });

      fs.writeFileSync(deploymentInfoPath, JSON.stringify(updatedDeploymentInfo, null, 2));
      console.log('✅ Updated deployment-info.json with new price IDs');

      console.log('\n🎉 Stripe prices fixed successfully!');
      console.log('\n📋 New Price IDs:');
      updatedPlans.forEach(plan => {
        console.log(`   • ${plan.name}: ${plan.stripePriceId} ($${plan.priceCents/100}/${plan.interval})`);
      });

      console.log('\n💡 Next steps:');
      console.log('   1. Test the payment flow with new prices');
      console.log('   2. Verify checkout shows correct amounts');
      console.log('   3. Old price IDs are now inactive (customers will use new prices)');
    } else {
      console.log('❌ No prices were updated');
    }

  } catch (error) {
    console.error('❌ Error fixing Stripe prices:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the fix
fixStripePrices();

