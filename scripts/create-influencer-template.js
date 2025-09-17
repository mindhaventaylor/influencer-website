#!/usr/bin/env node

// Script to create a new influencer website template
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const Stripe = require('stripe');
const postgres = require('postgres');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function createStripeProductsAndPrices(influencerName, handle, plans, stripeSecretKey) {
  console.log('\n🔄 Creating Stripe products and prices...');
  
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

console.log('🎭 **CREATE NEW INFLUENCER WEBSITE TEMPLATE**\n');

// Function to create influencer and plans in database
async function createInfluencerAndPlansInDatabase(influencerName, handle, bio, influencerId, plans, stripeData) {
  try {
    // Get database URL from environment or config
    const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:[password]@db.qroflmfvlhbvhtpzoqbu.supabase.co:5432/postgres';
    
    if (databaseUrl.includes('[password]')) {
      console.log('⚠️  Please set DATABASE_URL environment variable with your database credentials');
      console.log('   Example: DATABASE_URL="postgresql://postgres:your_password@db.qroflmfvlhbvhtpzoqbu.supabase.co:5432/postgres"');
      return { influencerId: null, planIds: [] };
    }

    const sql = postgres(databaseUrl);

    // Create or update influencer record
    const [influencer] = await sql`
      INSERT INTO influencers (
        id, handle, display_name, bio, is_active, created_at, updated_at
      ) VALUES (
        ${influencerId}, ${handle}, ${influencerName}, ${bio}, true, now(), now()
      )
      ON CONFLICT (handle) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        bio = EXCLUDED.bio,
        updated_at = now()
      RETURNING id
    `;

    console.log(`✅ Created influencer: ${influencerName} (${influencer.id})`);

    // Create plans
    const planIds = [];
    for (const plan of plans) {
      const [createdPlan] = await sql`
        INSERT INTO plans (
          id, name, description, price_cents, currency, interval, influencer_id,
          features, is_active, stripe_price_id, stripe_product_id, access_level, created_at, updated_at
        ) VALUES (
          gen_random_uuid(), ${plan.name}, ${plan.description}, ${plan.priceCents}, ${plan.currency}, ${plan.interval}, ${influencer.id},
          ${JSON.stringify(plan.features)}, true, ${plan.stripePriceId}, ${plan.stripeProductId}, ${plan.accessLevel}, now(), now()
        )
        ON CONFLICT (stripe_price_id) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          price_cents = EXCLUDED.price_cents,
          features = EXCLUDED.features,
          access_level = EXCLUDED.access_level,
          updated_at = now()
        RETURNING id
      `;

      planIds.push(createdPlan.id);
      console.log(`✅ Created plan: ${plan.name} (${createdPlan.id})`);
    }

    await sql.end();
    return { influencerId: influencer.id, planIds };

  } catch (error) {
    console.error('❌ Error creating influencer and plans in database:', error.message);
    return { influencerId: null, planIds: [] };
  }
}

async function createInfluencerTemplate() {
  try {
    // Collect influencer information
    console.log('📝 Please provide the following information:\n');
    
    const influencerName = await question('Influencer Name (e.g., "Taylor Swift"): ');
    const handle = await question('Handle (e.g., "taylorswift"): ');
    const bio = await question('Bio (short description): ');
    const domain = await question('Domain (e.g., "taylor-swift-ai.com"): ');
    
    console.log('\n💳 Stripe Configuration (Shared Account):');
    const stripePublishableKey = await question('Stripe Publishable Key (pk_test_...): ');
    const stripeSecretKey = await question('Stripe Secret Key (sk_test_...): ');
    const stripeWebhookSecret = await question('Stripe Webhook Secret (whsec_...): ');
    
    console.log('\n🎨 Branding:');
    const primaryColor = await question('Primary Color (e.g., "#E91E63"): ') || '#E91E63';
    const secondaryColor = await question('Secondary Color (e.g., "#9C27B0"): ') || '#9C27B0';
    const accentColor = await question('Accent Color (e.g., "#FF4081"): ') || '#FF4081';
    
    console.log('\n💰 Pricing Plans:');
    const basicPrice = await question('Basic Plan Price (cents, e.g., 999 for $9.99): ') || '999';
    const premiumPrice = await question('Premium Plan Price (cents, e.g., 1999 for $19.99): ') || '1999';
    const vipPrice = await question('VIP Plan Price (cents, e.g., 4999 for $49.99): ') || '4999';
    
    console.log('\n🤖 AI Configuration:');
    const openaiApiKey = await question('OpenAI API Key: ');
    const personalityPrompt = await question('Personality Prompt (how the AI should behave): ') || `You are ${influencerName}. Be authentic, engaging, and supportive in your responses.`;
    
    // Generate configuration
    const influencerId = handle.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now().toString(36);
    
    // Create plans configuration
    const plans = [
      {
        id: 'basic',
        name: 'Basic Chat Access',
        description: `Basic access to chat with ${influencerName}`,
        priceCents: parseInt(basicPrice),
        currency: 'usd',
        interval: 'month',
        stripePriceId: `price_basic_monthly_${handle}`, // Will be updated with real Stripe price ID
        features: [
          '5 messages per day',
          'Basic responses',
          'Standard response time',
          'Text messages only'
        ],
        accessLevel: 'basic',
        isPopular: false
      },
      {
        id: 'premium',
        name: 'Premium Chat Access',
        description: `Premium access to chat with ${influencerName}`,
        priceCents: parseInt(premiumPrice),
        currency: 'usd',
        interval: 'month',
        stripePriceId: `price_premium_monthly_${handle}`, // Will be updated with real Stripe price ID
        features: [
          'Unlimited messages',
          'Priority responses',
          'Media message support',
          'Exclusive content access',
          'Faster response time'
        ],
        accessLevel: 'premium',
        isPopular: true
      },
      {
        id: 'vip',
        name: 'VIP Chat Access',
        description: `VIP access to chat with ${influencerName}`,
        priceCents: parseInt(vipPrice),
        currency: 'usd',
        interval: 'month',
        stripePriceId: `price_vip_monthly_${handle}`, // Will be updated with real Stripe price ID
        features: [
          'Unlimited messages',
          'Instant responses',
          'Media and voice messages',
          'Personalized content',
          'Exclusive updates',
          'Direct access',
          'Analytics dashboard'
        ],
        accessLevel: 'vip',
        isPopular: false
      }
    ];
    
    // Create Stripe products and prices
    console.log('\n🔄 Creating Stripe products and prices...');
    const stripeData = await createStripeProductsAndPrices(influencerName, handle, plans, stripeSecretKey);
    
    // Update plans with real Stripe IDs
    plans.forEach(plan => {
      plan.stripePriceId = stripeData.prices[`${plan.id}_${plan.interval}`];
      plan.stripeProductId = stripeData.products[plan.id];
    });

    // Create influencer and plans in database
    console.log('\n🔄 Creating influencer and plans in database...');
    const dbData = await createInfluencerAndPlansInDatabase(influencerName, handle, bio, influencerId, plans, stripeData);
    
    const config = {
      influencer: {
        id: influencerId,
        name: influencerName,
        handle: handle.toLowerCase(),
        displayName: influencerName,
        bio: bio,
        avatarUrl: `/images/${handle}-avatar.jpg`,
        coverImageUrl: `/images/${handle}-cover.jpg`,
        websiteUrl: `https://${domain}`,
        socialMedia: {
          instagram: `https://instagram.com/${handle}`,
          twitter: `https://twitter.com/${handle}`,
          tiktok: `https://tiktok.com/@${handle}`
        }
      },
      branding: {
        primaryColor: primaryColor,
        secondaryColor: secondaryColor,
        accentColor: accentColor,
        logoUrl: `/images/${handle}-logo.png`,
        faviconUrl: `/images/${handle}-favicon.ico`,
        backgroundImage: `/images/${handle}-background.jpg`,
        customCss: `
          .gradient-bg {
            background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});
          }
          .text-primary {
            color: ${primaryColor};
          }
        `
      },
      stripe: {
        publishableKey: stripePublishableKey,
        secretKey: stripeSecretKey,
        webhookSecret: stripeWebhookSecret,
        products: stripeData.products,
        prices: stripeData.prices
      },
      plans: plans,
      ai: {
        openaiApiKey: openaiApiKey,
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 1000,
        personalityPrompt: personalityPrompt,
        systemMessage: `You are having a personal conversation with a fan. Be authentic, supportive, and engaging.`
      },
      database: {
        url: 'postgresql://postgres:[password]@db.qroflmfvlhbvhtpzoqbu.supabase.co:5432/postgres',
        supabase: {
          url: 'https://qroflmfvlhbvhtpzoqbu.supabase.co',
          anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyb2ZsbWZ2bGhidmh0cHpvcWJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNTg3NDUsImV4cCI6MjA3MDkzNDc0NX0.mx9cdTujNcu5h-27vwnnJFn0f41LOI2uy28mlWQbBqk',
          serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyb2ZsbWZ2bGhidmh0cHpvcWJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM1ODc0NSwiZXhwIjoyMDcwOTM0NzQ1fQ.sgMewwAVNLznA5CnODlkZEnuElp2eQnbigCjm6EiFZA'
        }
      },
      deployment: {
        domain: domain,
        baseUrl: `https://${domain}`,
        environment: 'production',
        hostinger: {
          publicHtmlPath: `/public_html/${handle}-ai`,
          sslEnabled: true
        }
      },
      features: {
        enableVoiceMessages: true,
        enableMediaUpload: true,
        enableAnalytics: true,
        enableNotifications: true,
        enableSocialLogin: true,
        enableGiftSubscriptions: true
      }
    };
    
    // Create deployment directory
    const deploymentDir = `deployments/${handle}-ai`;
    if (!fs.existsSync(deploymentDir)) {
      fs.mkdirSync(deploymentDir, { recursive: true });
    }
    
    // Write configuration
    fs.writeFileSync(
      path.join(deploymentDir, 'influencer.config.js'),
      `module.exports = ${JSON.stringify(config, null, 2)};`
    );
    
    // Generate environment files
    const envContent = `# ${influencerName} - Generated ${new Date().toISOString()}

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

    fs.writeFileSync(path.join(deploymentDir, '.env.local'), envContent);
    fs.writeFileSync(path.join(deploymentDir, '.env.production'), envContent);
    
    console.log('\n🎉 **INFLUENCER TEMPLATE CREATED!**\n');
    console.log(`📁 Deployment folder: ${deploymentDir}`);
    console.log(`🌐 Domain: ${domain}`);
    console.log(`👤 Influencer: ${influencerName}`);
    console.log(`💳 Plans: 3 subscription tiers`);
    console.log(`🎨 Colors: ${primaryColor}, ${secondaryColor}, ${accentColor}`);
    
    console.log('\n💳 **Stripe Products Created:**');
    Object.entries(stripeData.products).forEach(([planId, productId]) => {
      console.log(`   ${planId}: ${productId}`);
    });
    
    console.log('\n💰 **Stripe Prices Created:**');
    Object.entries(stripeData.prices).forEach(([planKey, priceId]) => {
      console.log(`   ${planKey}: ${priceId}`);
    });
    
    console.log('\n📋 **Next Steps:**');
    console.log('1. Copy the entire project to the deployment folder');
    console.log('2. Upload to Hostinger public_html');
    console.log('3. Install dependencies: npm install --production');
    console.log('4. Update project info: npm run update:project');
    console.log('5. Build: npm run build');
    console.log('6. ✅ Stripe products and prices already created!');
    console.log('7. Set up webhooks in Stripe dashboard');
    console.log('8. Update DNS');
    
    rl.close();
    
  } catch (error) {
    console.error('❌ Error creating template:', error.message);
    rl.close();
  }
}

createInfluencerTemplate();
