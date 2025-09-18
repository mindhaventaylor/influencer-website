#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔄 **MIGRATING FROM CONFIG FILES TO ENVIRONMENT VARIABLES**\n');

function migrateToEnvironmentVariables() {
  try {
    // Check if influencer.config.js exists
    const configPath = path.join(__dirname, '../influencer.config.js');
    
    if (!fs.existsSync(configPath)) {
      console.log('❌ influencer.config.js not found. Please create it first.');
      return false;
    }

    // Load the config
    const config = require(configPath);
    console.log(`📝 Found config for: ${config.influencer.displayName}`);

    // Generate .env.local for development
    const envLocalContent = `# Generated from influencer.config.js - Development Environment
# Influencer: ${config.influencer.displayName} (${config.influencer.handle})

# Influencer Information
INFLUENCER_ID=${config.influencer.id}
INFLUENCER_NAME=${config.influencer.name}
INFLUENCER_HANDLE=${config.influencer.handle}
INFLUENCER_DISPLAY_NAME=${config.influencer.displayName}
INFLUENCER_BIO=${config.influencer.bio}
INFLUENCER_AVATAR_URL=${config.influencer.avatarUrl}
INFLUENCER_WEBSITE_URL=${config.influencer.websiteUrl}
INFLUENCER_DATABASE_ID=${config.influencer.databaseId || ''}
INFLUENCER_INSTAGRAM=${config.influencer.socialMedia.instagram}
INFLUENCER_TWITTER=${config.influencer.socialMedia.twitter}
INFLUENCER_TIKTOK=${config.influencer.socialMedia.tiktok}

# Branding
BRANDING_PRIMARY_COLOR=${config.branding.primaryColor}
BRANDING_SECONDARY_COLOR=${config.branding.secondaryColor}
BRANDING_ACCENT_COLOR=${config.branding.accentColor}
BRANDING_LOGO_URL=${config.branding.logoUrl}
BRANDING_FAVICON_URL=${config.branding.faviconUrl}
BRANDING_CUSTOM_CSS=${config.branding.customCss || ''}

# Plans Configuration (JSON string)
PLANS_CONFIG=${JSON.stringify(config.plans)}

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${config.stripe.publishableKey}
STRIPE_SECRET_KEY=${config.stripe.secretKey}
STRIPE_WEBHOOK_SECRET=${config.stripe.webhookSecret}

# Stripe Products (JSON string)
STRIPE_PRODUCTS=${JSON.stringify(config.stripe.products)}

# AI Configuration
AI_CREATOR_ID=${config.ai.creator_id}
OPENAI_API_KEY=${config.ai.openaiApiKey}
AI_MODEL=${config.ai.model}
AI_TEMPERATURE=${config.ai.temperature}
AI_MAX_TOKENS=${config.ai.maxTokens}
AI_PERSONALITY_PROMPT=${config.ai.personalityPrompt}
AI_SYSTEM_MESSAGE=${config.ai.systemMessage}

# Database Configuration
DATABASE_URL=${config.database.url}

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=${config.database.supabase.url}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${config.database.supabase.anonKey}
SUPABASE_SERVICE_ROLE_KEY=${config.database.supabase.serviceRoleKey}

# Deployment Configuration
DEPLOYMENT_DOMAIN=${config.deployment.domain}
DEPLOYMENT_BASE_URL=${config.deployment.baseUrl}
NODE_ENV=development
`;

    // Generate .env for production
    const envContent = envLocalContent.replace('NODE_ENV=development', 'NODE_ENV=production');

    // Write files
    fs.writeFileSync('./.env.local', envLocalContent);
    fs.writeFileSync('./.env', envContent);

    console.log('✅ Generated .env.local for development');
    console.log('✅ Generated .env for production');
    
    console.log('\n📋 Migration Summary:');
    console.log('   - All configuration moved to environment variables');
    console.log('   - .env.local created for local development');
    console.log('   - .env created for production deployment');
    console.log('   - influencer.config.js can now be safely removed from repository');
    
    console.log('\n🚀 Next Steps:');
    console.log('   1. Test your application locally with .env.local');
    console.log('   2. Add environment variables to your deployment platform');
    console.log('   3. Remove influencer.config.js from git tracking');
    console.log('   4. Deploy your application');
    
    console.log('\n🔒 Security Benefits:');
    console.log('   - Sensitive data no longer in source code');
    console.log('   - Environment-specific configuration');
    console.log('   - Easy to manage secrets in production');
    console.log('   - Better security practices');

    return true;
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    return false;
  }
}

// Run migration
if (migrateToEnvironmentVariables()) {
  console.log('\n🎉 Migration completed successfully!');
  process.exit(0);
} else {
  console.log('\n❌ Migration failed!');
  process.exit(1);
}
