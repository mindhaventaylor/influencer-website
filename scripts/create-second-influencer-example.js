#!/usr/bin/env node

// Example script showing how to create a second influencer site
const fs = require('fs');
const path = require('path');

console.log('🎭 **CREATING SECOND INFLUENCER EXAMPLE**\n');

// Example configuration for a second influencer
const secondInfluencerConfig = {
  influencer: {
    id: "selena",
    name: "Selena Gomez (AI Bot)",
    handle: "selenagomez",
    displayName: "Selena (AI Bot)",
    bio: "A warm, music-inspired AI that chats like Selena Gomez. Friendly, encouraging, and full of positivity. Not the real Selena Gomez—just a respectful fan-made simulation.",
    avatarUrl: "/images/selena-avatar.jpg",
    coverImageUrl: "/images/selena-cover.jpg",
    websiteUrl: "https://selena.devopai.net/",
    socialMedia: {
      instagram: "https://www.instagram.com/selenagomez/",
      twitter: "https://x.com/selenagomez",
      tiktok: "https://www.tiktok.com/@selenagomez"
    }
  },
  branding: {
    primaryColor: "#ff6b9d",
    secondaryColor: "#c44569",
    accentColor: "#f8b500",
    logoUrl: "/images/selena-logo.png",
    faviconUrl: "/images/selena-favicon.ico",
    backgroundImage: "/images/selena-background.jpg",
    customCss: `
      .gradient-bg {
        background: linear-gradient(135deg, #ff6b9d, #c44569);
      }
      .text-primary {
        color: #ff6b9d;
      }
    `
  },
  stripe: {
    publishableKey: "pk_test_51S6dfkRzyGIanNct9Aj5XTOf3fwHdHpmFidCk9r4xLd1DFR3IKENCytUVkSHmNXCvvkfvO5nZdJBo4rSLN7qANGn005dTnjPGY",
    secretKey: "sk_test_51S6dfkRzyGIanNctawSg0T298jHbCCLJ3GLunvHnYOeSeE8PJjCbAp1fWvUXAbU7QfrAj2xtMKW6pLPq8Bsb4JWw00i5UIImTr",
    webhookSecret: "whsec_your_webhook_secret_here",
    products: {
      "basic": "prod_SelenaBasic",
      "premium": "prod_SelenaPremium",
      "vip": "prod_SelenaVIP"
    },
    prices: {}
  },
  plans: [
    {
      id: "basic",
      name: "Selena Basic",
      description: "Core chat access with music-flavored replies and basic perks.",
      priceCents: 999,
      currency: "usd",
      interval: "month",
      stripePriceId: "price_selena_basic",
      features: [
        "Music-inspired chat persona",
        "Daily message allowance",
        "Fan-quiz mini games"
      ],
      accessLevel: "basic",
      isPopular: false
    },
    {
      id: "premium",
      name: "Rare Premium",
      description: "Deeper conversations, longer replies, and special prompts.",
      priceCents: 1999,
      currency: "usd",
      interval: "month",
      stripePriceId: "price_rare_premium",
      features: [
        "Longer, more nuanced replies",
        "Custom 'era' prompt styles",
        "Priority message queue",
        "Monthly themed chat adventures"
      ],
      accessLevel: "premium",
      isPopular: true
    },
    {
      id: "vip",
      name: "Backstage VIP",
      description: "Maximum access, collectibles, and exclusive roleplay modes.",
      priceCents: 2999,
      currency: "usd",
      interval: "month",
      stripePriceId: "price_backstage_vip",
      features: [
        "Extended message limits",
        "Exclusive roleplay + music prompts",
        "Collectible digital moments",
        "Early access to new features"
      ],
      accessLevel: "vip",
      isPopular: false
    }
  ],
  ai: {
    openaiApiKey: "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",
    model: "gpt-4",
    temperature: 0.3,
    maxTokens: 3000,
    personalityPrompt: "You are Selena Gomez, the famous singer and actress. You're known for your positive energy, authenticity, and connection with fans. You're supportive, encouraging, and genuine. Respond as if you're personally chatting with a fan.",
    systemMessage: "You are having a personal conversation with a fan. Be authentic, supportive, and engaging."
  },
  database: {
    url: "postgresql://postgres.qroflmfvlhbvhtpzoqbu:Q6hHim4cqSUxVeC9@aws-1-us-east-2.pooler.supabase.com:6543/postgres",
    supabase: {
      url: "https://qroflmfvlhbvhtpzoqbu.supabase.co",
      anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyb2ZsbWZ2bGhidmh0cHpvcWJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNTg3NDUsImV4cCI6MjA3MDkzNDc0NX0.mx9cdTujNcu5h-27vwnnJFn0f41LOI2uy28mlWQbBqk",
      serviceRoleKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyb2ZsbWZ2bGhidmh0cHpvcWJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM1ODc0NSwiZXhwIjoyMDcwOTM0NzQ1fQ.sgMewwAVNLznA5CnODlkZEnuElp2eQnbigCjm6EiFZA"
    }
  },
  deployment: {
    domain: "selena.devopai.net",
    baseUrl: "https://selena.devopai.net",
    environment: "production",
    hostinger: {
      publicHtmlPath: "/public_html/selena-ai",
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

// Save the example configuration
const configPath = path.join(__dirname, '../influencer.config.selena.example.js');
fs.writeFileSync(configPath, `module.exports = ${JSON.stringify(secondInfluencerConfig, null, 2)};`);

console.log('✅ Created example configuration for Selena Gomez');
console.log(`📁 Saved to: ${configPath}`);
console.log('\n📝 **To create a second influencer site:**');
console.log('1. Copy this entire project folder:');
console.log('   cp -r influencer-website influencer-website-selena');
console.log('');
console.log('2. Navigate to the new folder:');
console.log('   cd influencer-website-selena');
console.log('');
console.log('3. Copy the example config:');
console.log('   cp influencer.config.selena.example.js influencer.config.js');
console.log('');
console.log('4. Update the configuration with your details:');
console.log('   - Update Stripe keys and product IDs');
console.log('   - Update domain and deployment URLs');
console.log('   - Update OpenAI API key');
console.log('   - Update database credentials');
console.log('');
console.log('5. Run the setup:');
console.log('   npm run setup:new');
console.log('');
console.log('6. Start development:');
console.log('   npm run dev');
console.log('');
console.log('🎉 You now have two separate influencer sites!');
console.log('   - Taylor Swift: http://localhost:3002');
console.log('   - Selena Gomez: http://localhost:3003 (if you change the port)');
