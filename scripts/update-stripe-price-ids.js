#!/usr/bin/env node

const fs = require('fs');

console.log('💳 **UPDATING STRIPE PRICE IDs**\n');

function updateStripePriceIds() {
  try {
    // Load current config
    const config = require('../influencer.config.js');
    console.log(`📝 Updating Stripe price IDs for: ${config.influencer.displayName}`);
    
    // Check if deployment-info.json exists
    const deploymentInfoPath = './deployment-info.json';
    if (!fs.existsSync(deploymentInfoPath)) {
      console.log('❌ deployment-info.json not found!');
      console.log('💡 Make sure you have run the Stripe setup script first.');
      process.exit(1);
    }

    // Load deployment info
    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentInfoPath, 'utf8'));
    
    if (!deploymentInfo.plans || deploymentInfo.plans.length === 0) {
      console.log('❌ No plans found in deployment-info.json');
      process.exit(1);
    }

    // Create a mapping of plan IDs to Stripe price IDs
    const stripePriceMapping = {};
    deploymentInfo.plans.forEach(plan => {
      if (plan.stripePriceId && plan.id) {
        stripePriceMapping[plan.id] = plan.stripePriceId;
      }
    });

    if (Object.keys(stripePriceMapping).length === 0) {
      console.log('❌ No valid Stripe price IDs found in deployment-info.json');
      process.exit(1);
    }

    console.log('\n🔄 Updating plans with real Stripe price IDs:');
    
    // Update the config plans with real Stripe price IDs
    const updatedConfig = { ...config };
    let updatedCount = 0;

    updatedConfig.plans = config.plans.map(plan => {
      if (stripePriceMapping[plan.id] && plan.stripePriceId !== stripePriceMapping[plan.id]) {
        console.log(`   ✅ ${plan.name}: ${plan.stripePriceId} → ${stripePriceMapping[plan.id]}`);
        updatedCount++;
        return {
          ...plan,
          stripePriceId: stripePriceMapping[plan.id]
        };
      } else if (stripePriceMapping[plan.id]) {
        console.log(`   ℹ️  ${plan.name}: Already using correct price ID (${stripePriceMapping[plan.id]})`);
      } else {
        console.log(`   ⚠️  ${plan.name}: No matching price ID found in deployment-info.json`);
      }
      return plan;
    });

    // Also update Stripe products if available
    if (deploymentInfo.stripeProducts) {
      updatedConfig.stripe = {
        ...config.stripe,
        products: deploymentInfo.stripeProducts
      };
      console.log('\n📦 Updated Stripe products mapping:');
      Object.entries(deploymentInfo.stripeProducts).forEach(([planId, productId]) => {
        console.log(`   ✅ ${planId}: ${productId}`);
      });
    }

    // Write the updated config back to file
    if (updatedCount > 0 || deploymentInfo.stripeProducts) {
      const configContent = `module.exports = ${JSON.stringify(updatedConfig, null, 2)};`;
      fs.writeFileSync('./influencer.config.js', configContent);
      console.log(`\n✅ Successfully updated influencer.config.js!`);
      console.log(`   - Updated ${updatedCount} plan price IDs`);
      console.log(`   - Updated Stripe products mapping`);
      console.log(`   - Configuration is now ready for production`);
    } else {
      console.log('\nℹ️  No updates needed - configuration is already up to date');
    }

    console.log('\n🎉 Stripe price ID update completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Test plan purchases to verify Stripe integration');
    console.log('   2. Deploy to production if everything works correctly');
    
  } catch (error) {
    console.error('❌ Error updating Stripe price IDs:', error.message);
    process.exit(1);
  }
}

// Run the update
updateStripePriceIds();
