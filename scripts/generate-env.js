#!/usr/bin/env node

// Script to generate .env.local from influencer configuration
const config = require('../influencer.config.js');
const fs = require('fs');
const path = require('path');

console.log('🔧 **GENERATING ENVIRONMENT FILES**\n');

function generateEnvFile() {
  const envContent = `# Generated from influencer.config.js
# Influencer: ${config.influencer.displayName} (${config.influencer.handle})

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=${config.database.supabase.url}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${config.database.supabase.anonKey}
SUPABASE_SERVICE_ROLE_KEY=${config.database.supabase.serviceRoleKey}
DATABASE_URL=${config.database.url}

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${config.stripe.publishableKey}
STRIPE_SECRET_KEY=${config.stripe.secretKey}
STRIPE_WEBHOOK_SECRET=${config.stripe.webhookSecret}

# OpenAI Configuration
OPENAI_API_KEY=${config.ai.openaiApiKey}

# Influencer Configuration
NEXT_PUBLIC_INFLUENCER_ID=${config.influencer.id}
NEXT_PUBLIC_INFLUENCER_NAME=${config.influencer.displayName}
NEXT_PUBLIC_INFLUENCER_HANDLE=${config.influencer.handle}

# Deployment Configuration
NEXT_PUBLIC_APP_URL=${config.deployment.baseUrl}
NEXT_PUBLIC_DOMAIN=${config.deployment.domain}

# Branding
NEXT_PUBLIC_PRIMARY_COLOR=${config.branding.primaryColor}
NEXT_PUBLIC_SECONDARY_COLOR=${config.branding.secondaryColor}
NEXT_PUBLIC_ACCENT_COLOR=${config.branding.accentColor}
`;

  // Write .env.local
  const envPath = path.join(__dirname, '../.env.local');
  fs.writeFileSync(envPath, envContent);
  
  console.log('✅ Generated .env.local');
  console.log(`   Influencer: ${config.influencer.displayName}`);
  console.log(`   Domain: ${config.deployment.domain}`);
  console.log(`   Plans: ${config.plans.length} subscription plans`);
  console.log(`   Stripe: ${config.stripe.publishableKey.substring(0, 20)}...`);
  
  // Generate .env.production for deployment
  const prodEnvPath = path.join(__dirname, '../.env.production');
  fs.writeFileSync(prodEnvPath, envContent);
  console.log('✅ Generated .env.production');
  
  console.log('\n🚀 **Environment files ready for deployment!**');
  console.log('Copy these files to your Hostinger public_html folder.');
}

generateEnvFile();
