#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });/usr/bin/env node

// Script to prepare deployment package for Hostinger
const { loadConfig } = require('./config-loader');
const { validateEnvironment } = require('./config-loader');

// Validate environment variables
if (!validateEnvironment()) {
  process.exit(1);
}

const config = loadConfig();
const fs = require('fs');
const path = require('path');

console.log(`🚀 **PREPARING DEPLOYMENT FOR ${config.influencer.displayName.toUpperCase()}**\n`);

function createDeploymentPackage() {
  const influencerName = config.influencer.handle.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const deploymentDir = `deployments/${influencerName}`;
  
  // Create deployment directory
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }
  
  console.log(`📁 Creating deployment package: ${deploymentDir}`);
  
  // Create deployment-specific configuration
  const deploymentConfig = {
    ...config,
    deployment: {
      ...config.deployment,
      influencerName,
      deploymentPath: deploymentDir,
      buildDate: new Date().toISOString()
    }
  };
  
  // Write deployment config
  fs.writeFileSync(
    path.join(deploymentDir, 'influencer.config.js'),
    `module.exports = ${JSON.stringify(deploymentConfig, null, 2)};`
  );
  
  // Generate environment files
  const envContent = `# ${config.influencer.displayName} - Generated ${new Date().toISOString()}

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
`;

  // Write environment files
  fs.writeFileSync(path.join(deploymentDir, '.env.local'), envContent);
  fs.writeFileSync(path.join(deploymentDir, '.env.production'), envContent);
  
  // Create deployment instructions
  const instructions = `# Deployment Instructions for ${config.influencer.displayName}

## Hostinger Deployment Steps:

1. **Upload Files to Hostinger:**
   - Upload all files to: ${config.deployment.hostinger.publicHtmlPath}
   - Make sure to include the .env.production file

2. **Install Dependencies:**
   \`\`\`bash
   cd ${config.deployment.hostinger.publicHtmlPath}
   npm install --production
   \`\`\`

3. **Build the Application:**
   \`\`\`bash
   npm run build
   \`\`\`

4. **Configure Stripe Webhooks:**
   - Add webhook endpoint: ${config.deployment.baseUrl}/api/stripe/webhook
   - Events: checkout.session.completed, customer.subscription.*, invoice.payment_*

5. **Update DNS:**
   - Point ${config.deployment.domain} to your Hostinger hosting

6. **SSL Certificate:**
   - Enable SSL certificate in Hostinger control panel

## Configuration Details:
- Influencer: ${config.influencer.displayName}
- Domain: ${config.deployment.domain}
- Plans: ${config.plans.length} subscription plans
- Stripe Account: ${config.stripe.publishableKey.substring(0, 20)}...

## Files Included:
- Complete Next.js application
- Influencer-specific configuration
- Environment variables
- Stripe integration
- Database schema
- AI integration

## Support:
Contact support if you need help with deployment.
`;

  fs.writeFileSync(path.join(deploymentDir, 'DEPLOYMENT.md'), instructions);
  
  console.log('✅ Created deployment package');
  console.log(`   📁 Location: ${deploymentDir}`);
  console.log(`   🌐 Domain: ${config.deployment.domain}`);
  console.log(`   💳 Plans: ${config.plans.length} subscription plans`);
  console.log(`   📋 Instructions: ${deploymentDir}/DEPLOYMENT.md`);
  
  console.log('\n📋 **Next Steps:**');
  console.log('1. Copy the deployment folder to your Hostinger account');
  console.log('2. Upload files to the public_html directory');
  console.log('3. Install dependencies: npm install --production');
  console.log('4. Build the app: npm run build');
  console.log('5. Configure Stripe webhooks');
  console.log('6. Update DNS settings');
  
  console.log('\n🎉 **Deployment package ready!**');
  console.log('Your influencer website is ready to deploy to Hostinger!');
}

createDeploymentPackage();
