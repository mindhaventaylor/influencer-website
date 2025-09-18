#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });/usr/bin/env node

// Script to update project information based on influencer.config.js
const fs = require('fs');
const path = require('path');

console.log('🔄 **UPDATING PROJECT INFORMATION**\n');

function updateProjectInfo() {
  try {
    // Load influencer configuration
    const { loadConfig } = require('./config-loader');
const { validateEnvironment } = require('./config-loader');

// Validate environment variables
if (!validateEnvironment()) {
  process.exit(1);
}

const config = loadConfig();
    
    console.log(`📝 Updating project for: ${config.influencer.displayName}`);
    
    // 1. Update package.json
    updatePackageJson(config);
    
    // 2. Update layout.tsx metadata
    updateLayoutMetadata(config);
    
    // 3. Update README.md
    updateReadme(config);
    
    // 4. Update next.config.js title
    updateNextConfig(config);
    
    // 5. Create dynamic CSS variables
    updateCssVariables(config);
    
    console.log('\n✅ **Project information updated successfully!**');
    console.log(`   Project: ${config.influencer.displayName} AI Chat`);
    console.log(`   Domain: ${config.deployment.domain}`);
    console.log(`   Colors: ${config.branding.primaryColor}, ${config.branding.secondaryColor}`);
    
  } catch (error) {
    console.error('❌ Error updating project info:', error.message);
    process.exit(1);
  }
}

function updatePackageJson(config) {
  console.log('📦 Updating package.json...');
  
  const packagePath = path.join(__dirname, '../package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  // Update package name
  const projectName = `${config.influencer.handle}-ai-chat`.toLowerCase();
  packageJson.name = projectName;
  
  // Update description
  packageJson.description = `Chat with ${config.influencer.displayName} - AI-powered conversations`;
  
  // Add influencer-specific scripts
  packageJson.scripts = {
    ...packageJson.scripts,
    'update:project': 'node scripts/update-project-info.js',
    'dev:influencer': `echo "Starting ${config.influencer.displayName} AI Chat..." && npm run dev`
  };
  
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  console.log(`   ✅ Package name: ${projectName}`);
}

function updateLayoutMetadata(config) {
  console.log('🎨 Updating layout metadata...');
  
  const layoutPath = path.join(__dirname, '../src/app/layout.tsx');
  let layoutContent = fs.readFileSync(layoutPath, 'utf8');
  
  // Update metadata
  const newMetadata = `export const metadata: Metadata = {
  title: "${config.influencer.displayName} AI Chat",
  description: "Chat with ${config.influencer.displayName} - ${config.influencer.bio}",
  keywords: ["${config.influencer.displayName}", "AI chat", "influencer", "conversation"],
  authors: [{ name: "${config.influencer.displayName}" }],
  openGraph: {
    title: "${config.influencer.displayName} AI Chat",
    description: "${config.influencer.bio}",
    url: "${config.deployment.baseUrl}",
    siteName: "${config.influencer.displayName} AI",
    images: [
      {
        url: "${config.deployment.baseUrl}${config.influencer.avatarUrl}",
        width: 1200,
        height: 630,
        alt: "${config.influencer.displayName}",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "${config.influencer.displayName} AI Chat",
    description: "${config.influencer.bio}",
    images: ["${config.deployment.baseUrl}${config.influencer.avatarUrl}"],
  },
};`;
  
  // Replace the metadata section
  layoutContent = layoutContent.replace(
    /export const metadata: Metadata = \{[\s\S]*?\};/,
    newMetadata
  );
  
  // Update favicon
  layoutContent = layoutContent.replace(
    /<meta name="theme-color" content="#000000" \/>/,
    `<meta name="theme-color" content="${config.branding.primaryColor}" />
        <link rel="icon" href="${config.influencer.faviconUrl || '/favicon.ico'}" />`
  );
  
  fs.writeFileSync(layoutPath, layoutContent);
  console.log(`   ✅ Title: ${config.influencer.displayName} AI Chat`);
  console.log(`   ✅ Description: ${config.influencer.bio}`);
}

function updateReadme(config) {
  console.log('📖 Updating README.md...');
  
  const readmePath = path.join(__dirname, '../README.md');
  const readmeContent = `# ${config.influencer.displayName} AI Chat

> ${config.influencer.bio}

Chat with ${config.influencer.displayName} using advanced AI technology. Experience personalized conversations, get exclusive content, and interact with your favorite influencer like never before.

## 🌟 Features

- **AI-Powered Conversations**: Advanced AI that captures ${config.influencer.displayName}'s personality
- **Multiple Subscription Tiers**: Choose from Basic, Premium, or VIP access
- **Real-time Chat**: Instant responses and continuous conversations
- **Exclusive Content**: Access to special content and updates
- **Mobile Optimized**: Perfect experience on all devices

## 💳 Subscription Plans

${config.plans.map(plan => `
### ${plan.name}
- **Price**: $${(plan.priceCents / 100).toFixed(2)}/${plan.interval}
- **Features**: ${plan.features.join(', ')}
`).join('')}

## 🚀 Getting Started

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd ${config.influencer.handle}-ai-chat
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Configure environment**
   \`\`\`bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   \`\`\`

4. **Start development server**
   \`\`\`bash
   npm run dev
   \`\`\`

## 🎨 Customization

This project is built for ${config.influencer.displayName}. To customize for another influencer:

1. Update \`influencer.config.js\` with new influencer details
2. Run \`npm run update:project\` to update project information
3. Update Stripe products and prices
4. Deploy to your domain

## 🔧 Configuration

The project uses \`influencer.config.js\` for all customization:

- **Influencer Info**: Name, bio, social media links
- **Branding**: Colors, logos, custom CSS
- **Pricing**: Subscription plans and Stripe integration
- **AI Personality**: Custom prompts and behavior

## 📱 Deployment

Deploy to Hostinger or any hosting provider:

\`\`\`bash
npm run build
npm run deploy:hostinger
\`\`\`

## 🌐 Live Demo

Visit: ${config.deployment.baseUrl}

## 📞 Support

For support, contact: ${config.influencer.websiteUrl}

---

Built with ❤️ for ${config.influencer.displayName} fans
`;

  fs.writeFileSync(readmePath, readmeContent);
  console.log(`   ✅ README updated for ${config.influencer.displayName}`);
}

function updateNextConfig(config) {
  console.log('⚙️ Updating next.config.js...');
  
  const configPath = path.join(__dirname, '../next.config.js');
  
  if (fs.existsSync(configPath)) {
    let configContent = fs.readFileSync(configPath, 'utf8');
    
    // Add influencer-specific configuration
    const influencerConfig = `
// Influencer-specific configuration
const influencerConfig = require('./influencer.config.js');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... existing config
  env: {
    INFLUENCER_NAME: influencerConfig.influencer.displayName,
    INFLUENCER_HANDLE: influencerConfig.influencer.handle,
    PRIMARY_COLOR: influencerConfig.branding.primaryColor,
    SECONDARY_COLOR: influencerConfig.branding.secondaryColor,
  },
  // ... rest of config
};

module.exports = nextConfig;`;

    fs.writeFileSync(configPath, configContent);
  }
  
  console.log(`   ✅ Next.js config updated`);
}

function updateCssVariables(config) {
  console.log('🎨 Updating CSS variables...');
  
  const cssPath = path.join(__dirname, '../src/app/globals.css');
  
  if (fs.existsSync(cssPath)) {
    let cssContent = fs.readFileSync(cssPath, 'utf8');
    
    // Add influencer-specific CSS variables
    const influencerCss = `
/* Influencer-specific CSS variables */
:root {
  --influencer-primary: ${config.branding.primaryColor};
  --influencer-secondary: ${config.branding.secondaryColor};
  --influencer-accent: ${config.branding.accentColor};
  --influencer-name: "${config.influencer.displayName}";
  --influencer-handle: "${config.influencer.handle}";
}

/* Custom influencer styling */
.influencer-gradient {
  background: linear-gradient(135deg, var(--influencer-primary), var(--influencer-secondary));
}

.influencer-text-primary {
  color: var(--influencer-primary);
}

.influencer-branding {
  --primary: var(--influencer-primary);
  --secondary: var(--influencer-secondary);
  --accent: var(--influencer-accent);
}
`;

    // Add the influencer CSS to the end of the file
    cssContent += influencerCss;
    fs.writeFileSync(cssPath, cssContent);
  }
  
  console.log(`   ✅ CSS variables updated`);
}

// Run the update
updateProjectInfo();
