#!/usr/bin/env node

// Script to update Stripe product names to match configuration
require('dotenv').config({ path: '.env.local' });

const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const config = require('../influencer.config.js');

console.log('🔄 **UPDATING STRIPE PRODUCT NAMES**\n');

async function updateStripeProductNames() {
  try {
    console.log('🔍 Updating Stripe product names to match configuration...\n');

    // Load deployment info to get current Stripe product IDs
    const fs = require('fs');
    const deploymentInfoPath = './deployment-info.json';
    
    if (!fs.existsSync(deploymentInfoPath)) {
      console.log('❌ deployment-info.json not found');
      return;
    }

    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentInfoPath, 'utf8'));
    
    if (!deploymentInfo.stripeProducts) {
      console.log('❌ No Stripe products found in deployment-info.json');
      return;
    }

    console.log('📋 Current Stripe products:');
    for (const [planId, productId] of Object.entries(deploymentInfo.stripeProducts)) {
      const product = await stripe.products.retrieve(productId);
      console.log(`   • ${product.name} (${productId})`);
    }

    console.log('\n🚀 Updating product names...\n');

    // Update each product with the correct name from config
    for (const planConfig of config.plans) {
      const productId = deploymentInfo.stripeProducts[planConfig.id];
      
      if (!productId) {
        console.log(`⚠️  No Stripe product ID found for plan: ${planConfig.id}`);
        continue;
      }

      console.log(`Updating ${planConfig.id}:`);
      console.log(`   Product ID: ${productId}`);
      console.log(`   Old name: ${deploymentInfo.plans.find(p => p.id === planConfig.id)?.name || 'Unknown'}`);
      console.log(`   New name: ${planConfig.name}`);

      try {
        const updatedProduct = await stripe.products.update(productId, {
          name: planConfig.name,
          description: planConfig.description,
          metadata: {
            planId: planConfig.id,
            influencerName: config.influencer.name
          }
        });

        console.log(`   ✅ Updated successfully: ${updatedProduct.name}`);
      } catch (error) {
        console.log(`   ❌ Error updating product: ${error.message}`);
      }
      console.log('');
    }

    // Update deployment-info.json with new names
    console.log('📝 Updating deployment-info.json...');
    const updatedDeploymentInfo = { ...deploymentInfo };
    
    updatedDeploymentInfo.plans = updatedDeploymentInfo.plans.map(plan => {
      const configPlan = config.plans.find(p => p.id === plan.id);
      if (configPlan) {
        return {
          ...plan,
          name: configPlan.name,
          price: configPlan.priceCents
        };
      }
      return plan;
    });

    fs.writeFileSync(deploymentInfoPath, JSON.stringify(updatedDeploymentInfo, null, 2));
    console.log('✅ Updated deployment-info.json with new plan names');

    console.log('\n🎉 Stripe product names updated successfully!');
    console.log('\n📋 Updated products:');
    for (const planConfig of config.plans) {
      const productId = deploymentInfo.stripeProducts[planConfig.id];
      if (productId) {
        const product = await stripe.products.retrieve(productId);
        console.log(`   • ${product.name} (${productId})`);
      }
    }

    console.log('\n💡 Next steps:');
    console.log('   1. Test the payment flow');
    console.log('   2. Verify checkout shows correct plan names');
    console.log('   3. Check that subscriptions work correctly');

  } catch (error) {
    console.error('❌ Error updating Stripe product names:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the update
updateStripeProductNames();

