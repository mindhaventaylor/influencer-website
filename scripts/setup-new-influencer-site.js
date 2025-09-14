#!/usr/bin/env node

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function setupNewInfluencerSite() {
  console.log('🎭 Multi-Influencer Site Setup\n');
  console.log('This will help you create a new influencer site that operates independently.');
  console.log('Users can sign up directly and conversations are created automatically.\n');

  try {
    // Get influencer details
    const influencerName = await askQuestion('Influencer Name (e.g., "Selena Gomez"): ');
    const influencerHandle = await askQuestion('Handle/Username (e.g., "selenagomez"): ');
    const port = await askQuestion('Development Port (e.g., "3005"): ') || '3005';
    
    if (!influencerName || !influencerHandle) {
      console.log('❌ Influencer name and handle are required.');
      rl.close();
      return;
    }

    // Clean handle (remove spaces, special chars)
    const cleanHandle = influencerHandle.toLowerCase().replace(/[^a-z0-9]/g, '');
    const dirName = `influencer-website-${cleanHandle}`;
    const targetPath = path.join(process.cwd(), dirName);

    console.log(`\n📁 Creating new site: ${dirName}`);
    console.log(`📍 Location: ${targetPath}`);
    console.log(`🌐 Port: ${port}`);

    // Check if directory already exists
    if (fs.existsSync(targetPath)) {
      console.log(`❌ Directory ${dirName} already exists. Please choose a different handle.`);
      rl.close();
      return;
    }

    // Copy the current project
    console.log('\n🔄 Copying project files...');
    try {
      execSync(`cp -r . "${targetPath}"`, { stdio: 'inherit' });
    } catch (error) {
      console.log('❌ Error copying files:', error.message);
      rl.close();
      return;
    }

    // Clean up copied files
    console.log('🧹 Cleaning up copied files...');
    try {
      const filesToRemove = ['node_modules', '.next', '.env', '.env.local'];
      filesToRemove.forEach(file => {
        const filePath = path.join(targetPath, file);
        if (fs.existsSync(filePath)) {
          if (fs.statSync(filePath).isDirectory()) {
            execSync(`rm -rf "${filePath}"`, { stdio: 'inherit' });
          } else {
            execSync(`rm -f "${filePath}"`, { stdio: 'inherit' });
          }
        }
      });
    } catch (error) {
      console.log('⚠️ Warning: Could not clean up some files:', error.message);
    }

    // Update package.json
    const packageJsonPath = path.join(targetPath, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    packageJson.name = `influencer-${cleanHandle}`;
    packageJson.scripts.dev = `next dev -p ${port}`;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

    // Create a basic influencer.config.js for the new site
    const configPath = path.join(targetPath, 'influencer.config.js');
    const basicConfig = {
      influencer: {
        id: cleanHandle,
        name: influencerName,
        handle: cleanHandle,
        displayName: `${influencerName} (AI Fan Bot)`,
        bio: `A warm, AI-powered companion inspired by ${influencerName}.`,
        avatarUrl: "/default_avatar.png",
        coverImageUrl: "/default_avatar.png",
        websiteUrl: `https://${cleanHandle}.yourdomain.com`,
        socialMedia: {
          instagram: `https://www.instagram.com/${cleanHandle}/`,
          twitter: `https://x.com/${cleanHandle}`,
          tiktok: `https://www.tiktok.com/@${cleanHandle}`
        }
      },
      branding: {
        primaryColor: "#e64162",
        secondaryColor: "#bc3012", 
        accentColor: "#81ddef",
        logoUrl: "/default_avatar.png",
        faviconUrl: "/favicon.ico",
        backgroundImage: "/default_avatar.png"
      },
      stripe: {
        publishableKey: "",
        secretKey: "",
        webhookSecret: "",
        products: {},
        prices: {}
      },
      plans: [
        {
          id: "basic",
          name: `${influencerName} Basic`,
          description: "Core chat access with basic features",
          priceCents: 999,
          currency: "usd",
          interval: "month",
          stripePriceId: `price_${cleanHandle}_basic`,
          features: ["Basic chat access", "AI-powered conversations", "Mobile-friendly interface"],
          accessLevel: "basic",
          isPopular: false
        },
        {
          id: "premium",
          name: `${influencerName} Premium`,
          description: "Enhanced features and longer conversations",
          priceCents: 1999,
          currency: "usd", 
          interval: "month",
          stripePriceId: `price_${cleanHandle}_premium`,
          features: ["Premium chat access", "Longer conversations", "Priority support"],
          accessLevel: "premium",
          isPopular: true
        },
        {
          id: "vip",
          name: `${influencerName} VIP`,
          description: "Maximum access with exclusive features",
          priceCents: 2999,
          currency: "usd",
          interval: "month", 
          stripePriceId: `price_${cleanHandle}_vip`,
          features: ["VIP chat access", "Unlimited conversations", "Exclusive content"],
          accessLevel: "vip",
          isPopular: false
        }
      ],
      ai: {
        openaiApiKey: "",
        model: "gpt-4",
        temperature: 0.3,
        maxTokens: 3000,
        personalityPrompt: `You are ${influencerName}, the famous personality. You're known for your unique style and connection with fans. You're supportive, encouraging, and authentic. Respond as if you're personally chatting with a fan. Be warm, engaging, and use your signature style. Keep responses conversational and friendly, like you're talking to a close friend.`,
        systemMessage: `You are having a personal conversation with a fan. Be authentic, supportive, and engaging.`
      },
      database: {
        url: "postgresql://postgres:password@localhost:5432/influencer_db",
        supabase: {
          url: "https://your-project.supabase.co",
          anonKey: "your-anon-key",
          serviceRoleKey: "your-service-role-key"
        }
      },
      deployment: {
        domain: `${cleanHandle}.yourdomain.com`,
        baseUrl: `https://${cleanHandle}.yourdomain.com`,
        environment: "production"
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

    const configContent = `module.exports = ${JSON.stringify(basicConfig, null, 2)};`;
    fs.writeFileSync(configPath, configContent);

    console.log('\n✅ New influencer site created successfully!');
    console.log('\n📋 Next Steps:');
    console.log(`1. cd "${dirName}"`);
    console.log('2. npm install');
    console.log('3. npm run setup:complete');
    console.log('4. npm run dev');
    console.log(`5. Visit http://localhost:${port}`);

    console.log('\n🎉 Your new influencer site is ready!');
    console.log('\n💡 What makes this independent:');
    console.log('• Users can sign up directly (no admin setup required)');
    console.log('• Conversations are created automatically when users chat');
    console.log('• Separate subscription plans and billing');
    console.log('• Complete data isolation from other influencer sites');
    console.log('• Uses influencer.config.js (no .env files needed)');
    console.log('• Shares database but with complete data isolation');

  } catch (error) {
    console.error('❌ Error creating new site:', error.message);
  } finally {
    rl.close();
  }
}

setupNewInfluencerSite();
