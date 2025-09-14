#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

console.log('🎭 **CONFIGURE YOUR INFLUENCER**\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function configureInfluencer() {
  try {
    console.log('📝 Let\'s configure your influencer website!\n');

    // Basic Info
    const id = await askQuestion('🎯 Influencer ID (unique identifier): ');
    const name = await askQuestion('👤 Full name: ');
    const handle = await askQuestion('🏷️  Handle (username): ');
    const displayName = await askQuestion('🌟 Display name: ');
    const bio = await askQuestion('📖 Bio/Description: ');
    const websiteUrl = await askQuestion('🌐 Website URL: ');

    // Social Media
    console.log('\n📱 Social Media Links:');
    const instagram = await askQuestion('📸 Instagram URL: ');
    const twitter = await askQuestion('🐦 Twitter URL: ');
    const tiktok = await askQuestion('🎵 TikTok URL: ');

    // Branding
    console.log('\n🎨 Branding:');
    const primaryColor = await askQuestion('🎨 Primary color (hex): ');
    const secondaryColor = await askQuestion('🎨 Secondary color (hex): ');
    const accentColor = await askQuestion('🎨 Accent color (hex): ');

    // Domain
    console.log('\n🌐 Domain Configuration:');
    const domain = await askQuestion('🌐 Domain (e.g., yourname-ai.com): ');
    const baseUrl = `https://${domain}`;

    // Plans
    console.log('\n💳 Subscription Plans:');
    const plans = [];

    const planCount = await askQuestion('📊 How many plans? (1-5): ');
    const planCountNum = parseInt(planCount) || 3;

    for (let i = 0; i < planCountNum; i++) {
      console.log(`\n📦 Plan ${i + 1}:`);
      const planId = await askQuestion(`   ID (e.g., basic, premium, vip): `);
      const planName = await askQuestion(`   Name: `);
      const planDescription = await askQuestion(`   Description: `);
      const planPrice = await askQuestion(`   Price in cents (e.g., 999 for $9.99): `);
      const planInterval = await askQuestion(`   Interval (month/year): `);
      const planAccessLevel = await askQuestion(`   Access level (basic/premium/vip): `);
      const isPopular = await askQuestion(`   Is popular? (true/false): `);

      // Features
      console.log(`   Features (comma-separated):`);
      const featuresInput = await askQuestion(`   `);
      const features = featuresInput.split(',').map(f => f.trim()).filter(f => f);

      plans.push({
        id: planId,
        name: planName,
        description: planDescription,
        priceCents: parseInt(planPrice) || 999,
        currency: 'usd',
        interval: planInterval,
        stripePriceId: `price_${planId}_monthly_${handle}`,
        features: features,
        accessLevel: planAccessLevel,
        isPopular: isPopular.toLowerCase() === 'true'
      });
    }

    // AI Configuration
    console.log('\n🤖 AI Configuration:');
    const openaiApiKey = await askQuestion('🔑 OpenAI API Key: ');
    const model = await askQuestion('🧠 Model (gpt-4/gpt-3.5-turbo): ');
    const temperature = await askQuestion('🌡️  Temperature (0.1-1.0): ');
    const maxTokens = await askQuestion('📝 Max tokens: ');

    console.log('\n💭 Personality Prompt:');
    const personalityPrompt = await askQuestion('   ');

    // Database (keep existing)
    console.log('\n🗄️  Database Configuration:');
    console.log('   Using existing database configuration...');

    // Create the configuration
    const config = {
      influencer: {
        id: id,
        name: name,
        handle: handle,
        displayName: displayName,
        bio: bio,
        avatarUrl: `/images/${handle}-avatar.jpg`,
        coverImageUrl: `/images/${handle}-cover.jpg`,
        websiteUrl: websiteUrl,
        socialMedia: {
          instagram: instagram,
          twitter: twitter,
          tiktok: tiktok
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
        publishableKey: 'pk_test_51S6dfkRzyGIanNct9Aj5XTOf3fwHdHpmFidCk9r4xLd1DFR3IKENCytUVkSHmNXCvvkfvO5nZdJBo4rSLN7qANGn005dTnjPGY',
        secretKey: 'sk_test_51S6dfkRzyGIanNctawSg0T298jHbCCLJ3GLunvHnYOeSeE8PJjCbAp1fWvUXAbU7QfrAj2xtMKW6pLPq8Bsb4JWw00i5UIImTr',
        webhookSecret: 'whsec_your_webhook_secret_here',
        products: {},
        prices: {}
      },
      plans: plans,
      ai: {
        openaiApiKey: openaiApiKey,
        model: model,
        temperature: parseFloat(temperature) || 0.7,
        maxTokens: parseInt(maxTokens) || 1000,
        personalityPrompt: personalityPrompt,
        systemMessage: `You are having a personal conversation with a fan. Be authentic, supportive, and engaging.`
      },
      database: {
        url: 'postgresql://postgres.qroflmfvlhbvhtpzoqbu:Q6hHim4cqSUxVeC9@aws-1-us-east-2.pooler.supabase.com:6543/postgres',
        supabase: {
          url: 'https://qroflmfvlhbvhtpzoqbu.supabase.co',
          anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyb2ZsbWZ2bGhidmh0cHpvcWJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNTg3NDUsImV4cCI6MjA3MDkzNDc0NX0.mx9cdTujNcu5h-27vwnnJFn0f41LOI2uy28mlWQbBqk',
          serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyb2ZsbWZ2bGhidmh0cHpvcWJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM1ODc0NSwiZXhwIjoyMDcwOTM0NzQ1fQ.sgMewwAVNLznA5CnODlkZEnuElp2eQnbigCjm6EiFZA'
        }
      },
      deployment: {
        domain: domain,
        baseUrl: baseUrl,
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

    // Write the configuration
    const configPath = path.join(__dirname, '../influencer.config.js');
    const configContent = `// Influencer Configuration
// Generated on ${new Date().toISOString()}

module.exports = ${JSON.stringify(config, null, 2)};`;

    fs.writeFileSync(configPath, configContent);

    console.log('\n🎉 **CONFIGURATION COMPLETED!**');
    console.log(`✅ Influencer: ${displayName} (@${handle})`);
    console.log(`✅ Domain: ${domain}`);
    console.log(`✅ Plans: ${plans.length} subscription plans`);
    console.log(`✅ Branding: ${primaryColor}, ${secondaryColor}, ${accentColor}`);
    
    console.log('\n🚀 **Next Steps:**');
    console.log('1. Run: npm run setup:complete');
    console.log('2. Run: npm run dev');
    console.log(`3. Visit: ${baseUrl}`);

    rl.close();

  } catch (error) {
    console.error('❌ Configuration failed:', error.message);
    rl.close();
    process.exit(1);
  }
}

configureInfluencer();

