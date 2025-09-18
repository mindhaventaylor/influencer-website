#!/usr/bin/env node

const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

console.log('💳 **UPDATING STRIPE PRICE IDs**\n');

function generateUpdatedEnvContent(plans, stripeProducts) {
  return `# Generated from influencer.config.js - Development Environment
# Influencer: ${process.env.INFLUENCER_DISPLAY_NAME} (${process.env.INFLUENCER_HANDLE})

# Influencer Information
INFLUENCER_ID=${process.env.INFLUENCER_ID}
INFLUENCER_NAME=${process.env.INFLUENCER_NAME}
INFLUENCER_HANDLE=${process.env.INFLUENCER_HANDLE}
INFLUENCER_DISPLAY_NAME=${process.env.INFLUENCER_DISPLAY_NAME}
INFLUENCER_BIO=${process.env.INFLUENCER_BIO}
INFLUENCER_AVATAR_URL=${process.env.INFLUENCER_AVATAR_URL}
INFLUENCER_WEBSITE_URL=${process.env.INFLUENCER_WEBSITE_URL}
INFLUENCER_DATABASE_ID=${process.env.INFLUENCER_DATABASE_ID}
INFLUENCER_INSTAGRAM=${process.env.INFLUENCER_INSTAGRAM}
INFLUENCER_TWITTER=${process.env.INFLUENCER_TWITTER}
INFLUENCER_TIKTOK=${process.env.INFLUENCER_TIKTOK}

# Branding
BRANDING_PRIMARY_COLOR=${process.env.BRANDING_PRIMARY_COLOR}
BRANDING_SECONDARY_COLOR=${process.env.BRANDING_SECONDARY_COLOR}
BRANDING_ACCENT_COLOR=${process.env.BRANDING_ACCENT_COLOR}
BRANDING_LOGO_URL=${process.env.BRANDING_LOGO_URL}
BRANDING_FAVICON_URL=${process.env.BRANDING_FAVICON_URL}
BRANDING_CUSTOM_CSS=${process.env.BRANDING_CUSTOM_CSS}

# Plans Configuration (JSON string)
PLANS_CONFIG=${JSON.stringify(plans)}

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
STRIPE_SECRET_KEY=${process.env.STRIPE_SECRET_KEY}
STRIPE_WEBHOOK_SECRET=${process.env.STRIPE_WEBHOOK_SECRET}

# Stripe Products (JSON string)
STRIPE_PRODUCTS=${JSON.stringify(stripeProducts)}

# AI Configuration
AI_CREATOR_ID=${process.env.AI_CREATOR_ID}
OPENAI_API_KEY=${process.env.OPENAI_API_KEY}
AI_MODEL=${process.env.AI_MODEL}
AI_TEMPERATURE=${process.env.AI_TEMPERATURE}
AI_MAX_TOKENS=${process.env.AI_MAX_TOKENS}
AI_PERSONALITY_PROMPT=${process.env.AI_PERSONALITY_PROMPT}
AI_SYSTEM_MESSAGE=${process.env.AI_SYSTEM_MESSAGE}

# Database Configuration
DATABASE_URL=${process.env.DATABASE_URL}

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=${process.env.NEXT_PUBLIC_SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${process.env.SUPABASE_SERVICE_ROLE_KEY}

# Deployment Configuration
DEPLOYMENT_DOMAIN=${process.env.DEPLOYMENT_DOMAIN}
DEPLOYMENT_BASE_URL=${process.env.DEPLOYMENT_BASE_URL}
NODE_ENV=development
`;
}

function updateStripePriceIds() {
  try {
    // Load config from environment variables
    const influencerName = process.env.INFLUENCER_DISPLAY_NAME;
    
    if (!influencerName) {
      console.error('❌ Missing INFLUENCER_DISPLAY_NAME environment variable!');
      console.log('💡 Make sure you have run: npm run migrate:env');
      process.exit(1);
    }
    
    console.log(`📝 Updating Stripe price IDs for: ${influencerName}`);
    
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
    
    // Parse plans from environment variable
    const plansConfig = JSON.parse(process.env.PLANS_CONFIG || '[]');
    let updatedCount = 0;

    const updatedPlans = plansConfig.map(plan => {
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
      // Generate new environment file with updated plans
      const updatedEnvContent = generateUpdatedEnvContent(updatedPlans, deploymentInfo.stripeProducts);
      fs.writeFileSync('./.env.local', updatedEnvContent);
      console.log(`\n✅ Successfully updated .env.local!`);
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
