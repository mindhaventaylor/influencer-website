#!/usr/bin/env node

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function setupInfluencerConfig() {
  console.log('🎭 Multi-Influencer Configuration Setup\n');
  console.log('This script will configure your influencer site for independent operation.');
  console.log('Users will be able to sign up directly and create conversations automatically.\n');

  try {
    // Read current config
    const configPath = path.join(process.cwd(), 'influencer.config.js');
    let currentConfig = {};
    
    if (fs.existsSync(configPath)) {
      delete require.cache[require.resolve(configPath)];
      currentConfig = require(configPath);
    }

    console.log('📝 Influencer Information');
    console.log('─'.repeat(50));
    
    const influencerName = await askQuestion(`Influencer Name (e.g., "Taylor Swift"): `) || currentConfig.influencer?.name || 'Taylor Swift';
    const influencerHandle = await askQuestion(`Handle/Username (e.g., "taylorswift"): `) || currentConfig.influencer?.handle || 'taylorswift';
    const displayName = await askQuestion(`Display Name (e.g., "Taylor (AI Fan Bot)"): `) || currentConfig.influencer?.displayName || `${influencerName} (AI Fan Bot)`;
    const bio = await askQuestion(`Bio (description): `) || currentConfig.influencer?.bio || `A warm, AI-powered companion inspired by ${influencerName}.`;
    
    console.log('\n🎨 Branding & Appearance');
    console.log('─'.repeat(50));
    
    const primaryColor = await askQuestion(`Primary Color (hex, e.g., "#e64162"): `) || currentConfig.branding?.primaryColor || '#e64162';
    const secondaryColor = await askQuestion(`Secondary Color (hex, e.g., "#bc3012"): `) || currentConfig.branding?.secondaryColor || '#bc3012';
    const accentColor = await askQuestion(`Accent Color (hex, e.g., "#81ddef"): `) || currentConfig.branding?.accentColor || '#81ddef';
    
    console.log('\n💰 Subscription Plans');
    console.log('─'.repeat(50));
    console.log('Configure your subscription plans. Each influencer will have separate plans.');
    
    const plans = [];
    const planNames = ['Basic', 'Premium', 'VIP'];
    const planDescriptions = [
      'Core chat access with basic features',
      'Enhanced features and longer conversations', 
      'Maximum access with exclusive features'
    ];
    const planPrices = [999, 1999, 2999]; // in cents
    
    for (let i = 0; i < 3; i++) {
      const planName = await askQuestion(`${planNames[i]} Plan Name (e.g., "${influencerName} ${planNames[i]}"): `) || `${influencerName} ${planNames[i]}`;
      const planDescription = await askQuestion(`${planNames[i]} Description: `) || planDescriptions[i];
      const planPrice = await askQuestion(`${planNames[i]} Price (in cents, e.g., ${planPrices[i]} for $${planPrices[i]/100}): `) || planPrices[i];
      
      plans.push({
        id: planName.toLowerCase().replace(/\s+/g, '_'),
        name: planName,
        description: planDescription,
        priceCents: parseInt(planPrice),
        currency: 'usd',
        interval: 'month',
        stripePriceId: `price_${influencerHandle}_${planName.toLowerCase().replace(/\s+/g, '_')}`,
        features: [
          `${planNames[i]} chat access`,
          'AI-powered conversations',
          'Mobile-friendly interface'
        ],
        accessLevel: planName.toLowerCase(),
        isPopular: i === 1 // Premium is popular
      });
    }
    
    console.log('\n🔑 Stripe Configuration');
    console.log('─'.repeat(50));
    console.log('Configure Stripe for this influencer. Each influencer needs separate Stripe products.');
    
    const stripePublishableKey = await askQuestion(`Stripe Publishable Key (pk_test_...): `) || currentConfig.stripe?.publishableKey || '';
    const stripeSecretKey = await askQuestion(`Stripe Secret Key (sk_test_...): `) || currentConfig.stripe?.secretKey || '';
    const stripeWebhookSecret = await askQuestion(`Stripe Webhook Secret (whsec_...): `) || currentConfig.stripe?.webhookSecret || '';
    
    console.log('\n🌐 Deployment Configuration');
    console.log('─'.repeat(50));
    
    const domain = await askQuestion(`Domain (e.g., "taylor.yourdomain.com"): `) || currentConfig.deployment?.domain || `${influencerHandle}.yourdomain.com`;
    const baseUrl = await askQuestion(`Base URL (e.g., "https://taylor.yourdomain.com"): `) || currentConfig.deployment?.baseUrl || `https://${domain}`;
    
    console.log('\n🤖 AI Configuration');
    console.log('─'.repeat(50));
    
    const openaiApiKey = await askQuestion(`OpenAI API Key (sk-proj-...): `) || currentConfig.ai?.openaiApiKey || '';
    const aiModel = await askQuestion(`AI Model (e.g., "gpt-4"): `) || currentConfig.ai?.model || 'gpt-4';
    const personalityPrompt = await askQuestion(`AI Personality Prompt (or press Enter for default): `) || 
      `You are ${influencerName}, the famous personality. You're known for your unique style and connection with fans. You're supportive, encouraging, and authentic. Respond as if you're personally chatting with a fan. Be warm, engaging, and use your signature style. Keep responses conversational and friendly, like you're talking to a close friend.`;

    // Create the new configuration
    const newConfig = {
      influencer: {
        id: influencerHandle,
        name: influencerName,
        handle: influencerHandle,
        displayName: displayName,
        bio: bio,
        avatarUrl: "/default_avatar.png",
        coverImageUrl: "/default_avatar.png",
        websiteUrl: baseUrl,
        socialMedia: {
          instagram: `https://www.instagram.com/${influencerHandle}/`,
          twitter: `https://x.com/${influencerHandle}`,
          tiktok: `https://www.tiktok.com/@${influencerHandle}`
        }
      },
      branding: {
        primaryColor: primaryColor,
        secondaryColor: secondaryColor,
        accentColor: accentColor,
        logoUrl: "/default_avatar.png",
        faviconUrl: "/favicon.ico",
        backgroundImage: "/default_avatar.png",
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
        products: {},
        prices: {}
      },
      plans: plans,
      ai: {
        openaiApiKey: openaiApiKey,
        model: aiModel,
        temperature: 0.3,
        maxTokens: 3000,
        personalityPrompt: personalityPrompt,
        systemMessage: `You are having a personal conversation with a fan. Be authentic, supportive, and engaging.`
      },
      database: {
        url: currentConfig.database?.url || "postgresql://postgres:password@localhost:5432/influencer_db",
        supabase: currentConfig.database?.supabase || {
          url: "https://your-project.supabase.co",
          anonKey: "your-anon-key",
          serviceRoleKey: "your-service-role-key"
        }
      },
      deployment: {
        domain: domain,
        baseUrl: baseUrl,
        environment: "production",
        hostinger: {
          publicHtmlPath: `/public_html/${influencerHandle}`,
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

    // Write the configuration file
    const configContent = `module.exports = ${JSON.stringify(newConfig, null, 2)};`;
    fs.writeFileSync(configPath, configContent);

    console.log('\n✅ Configuration Complete!');
    console.log('─'.repeat(50));
    console.log(`📁 Configuration saved to: ${configPath}`);
    console.log(`🎭 Influencer: ${displayName}`);
    console.log(`🌐 Domain: ${domain}`);
    console.log(`💰 Plans: ${plans.length} subscription plans configured`);
    console.log(`🔑 Stripe: ${stripePublishableKey ? 'Configured' : 'Not configured'}`);
    console.log(`🤖 AI: ${openaiApiKey ? 'Configured' : 'Not configured'}`);
    
    console.log('\n📋 Next Steps:');
    console.log('1. Run "npm run setup:stripe" to create Stripe products');
    console.log('2. Run "npm run setup:database" to set up the database');
    console.log('3. Run "npm run dev" to start development');
    console.log('4. Deploy to your domain when ready');
    
    console.log('\n🎉 Your influencer site is ready for independent operation!');
    console.log('Users can now sign up directly and create conversations automatically.');

  } catch (error) {
    console.error('❌ Error during setup:', error);
  } finally {
    rl.close();
  }
}

setupInfluencerConfig();
