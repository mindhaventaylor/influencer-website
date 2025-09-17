# 🚀 Multi-Influencer Site Setup Guide

This guide will help you create multiple influencer sites using the same codebase. Each site will be completely isolated with its own configuration, database records, and user data.

## 📋 Prerequisites

- Node.js 18+ installed
- PostgreSQL database (Supabase recommended)
- Stripe account for payments
- OpenAI API key
- Domain names for each influencer site

## 🎯 Quick Setup (Recommended)

### Option 1: Automated Setup (Recommended)
```bash
# Run the complete automated setup
npm run setup
```

This will:
1. Create a new influencer configuration
2. Set up the database
3. Generate environment files
4. Run the complete system setup

### Option 2: Manual Setup
```bash
# Step 1: Interactive configuration
npm run configure

# Step 2: Run complete system setup
npm run setup
```

## 🔧 Creating Multiple Influencer Sites

### Method 1: Copy Project Folders (Recommended)

1. **Copy the entire project folder** for each new influencer:
   ```bash
   cp -r influencer-website influencer-website-influencer2
   cd influencer-website-influencer2
   ```

2. **Update the configuration**:
   - Edit `influencer.config.js` with new influencer details
   - Update domain, branding, plans, etc.

3. **Run the setup**:
   ```bash
   npm run setup
   ```

4. **Start development**:
   ```bash
   npm run dev
   ```

### Method 2: Single Project with Multiple Configs

1. **Create configuration files** for each influencer:
   ```bash
   cp influencer.config.js influencer.config.influencer2.js
   cp influencer.config.js influencer.config.influencer3.js
   ```

2. **Create setup scripts** for each influencer:
   ```bash
   # Create setup-influencer2.js
   cp scripts/setup-complete-system.js scripts/setup-influencer2.js
   # Edit the script to use influencer.config.influencer2.js
   ```

3. **Run setup for each influencer**:
   ```bash
   node scripts/setup-influencer2.js
   ```

## 📝 Configuration Requirements

Each `influencer.config.js` must include:

### Required Fields
```javascript
module.exports = {
  influencer: {
    id: "unique-influencer-id",           // Unique identifier
    name: "Influencer Name",              // Database name
    handle: "influencerhandle",           // URL-friendly handle
    displayName: "Display Name",          // UI display name
    bio: "Influencer bio...",             // Description
    avatarUrl: "/images/avatar.jpg",      // Profile image
    websiteUrl: "https://domain.com",     // Site URL
    socialMedia: {                        // Social links
      instagram: "https://instagram.com/...",
      twitter: "https://twitter.com/...",
      tiktok: "https://tiktok.com/@..."
    }
  },
  branding: {
    primaryColor: "#color",               // Brand colors
    secondaryColor: "#color",
    accentColor: "#color",
    logoUrl: "/images/logo.png",
    faviconUrl: "/images/favicon.ico"
  },
  plans: [                               // Subscription plans
    {
      id: "plan-id",
      name: "Plan Name",
      description: "Plan description",
      priceCents: 999,                   // Price in cents
      currency: "usd",
      interval: "month",
      stripePriceId: "price_...",        // Stripe price ID
      features: ["Feature 1", "Feature 2"],
      accessLevel: "basic",
      isPopular: false
    }
  ],
  stripe: {                              // Stripe configuration
    publishableKey: "pk_...",
    secretKey: "sk_...",
    webhookSecret: "whsec_...",
    products: {},
    prices: {}
  },
  ai: {                                  // AI configuration
    openaiApiKey: "sk-...",
    model: "gpt-4",
    temperature: 0.3,
    maxTokens: 3000,
    personalityPrompt: "You are...",
    systemMessage: "System message..."
  },
  database: {                            // Database configuration
    url: "postgresql://...",
    supabase: {
      url: "https://...supabase.co",
      anonKey: "eyJ...",
      serviceRoleKey: "eyJ..."
    }
  },
  deployment: {                         // Deployment configuration
    domain: "influencer.com",
    baseUrl: "https://influencer.com",
    environment: "production"
  }
};
```

## 🗄️ Database Isolation

Each influencer site will have:

- **Separate influencer records** in the `influencers` table
- **Isolated conversations** per influencer
- **Separate token balances** per influencer
- **Independent subscription data** per influencer
- **Isolated chat messages** per influencer

The system automatically filters data by influencer ID, ensuring complete isolation.

### 🔧 Chat Isolation Fix
The chat system has been updated to properly isolate messages between influencers:
- **Influencer Resolver**: Maps config influencers to database UUIDs
- **Proper Filtering**: Chat messages are filtered by the correct influencer ID
- **Shared Database**: Multiple influencers can safely share the same Supabase instance

📖 **[Chat Isolation Fix Details](./CHAT_ISOLATION_FIX.md)** - Technical details about the chat isolation implementation

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Deployment
```bash
# Build the project
npm run build

# Deploy to Hostinger
npm run deploy:hostinger
```

## 🔍 Testing Your Setup

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Test user registration**:
   - Visit `http://localhost:3002`
   - Create a new user account
   - Verify user data is stored correctly

3. **Test chat functionality**:
   - Start a conversation
   - Send messages
   - Verify AI responses

4. **Test subscription system**:
   - Purchase a plan
   - Verify token allocation
   - Test token consumption

5. **Test influencer isolation**:
   - Switch to another influencer site
   - Verify different branding/content
   - Verify separate user data

## 🛠️ Available Scripts

| Script | Description |
|--------|-------------|
| `npm run setup` | **Complete automated setup for new influencer** |
| `npm run configure` | Interactive influencer configuration |
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run deploy` | Deploy to Hostinger |
| `npm run db:studio` | Open database studio |
| `npm run tokens:add` | Add tokens to user (admin) |
| `npm run tokens:test` | Test token system |

📖 **[Complete Scripts Reference](./SCRIPTS_REFERENCE.md)** - Detailed information about all scripts

## 🚨 Important Notes

1. **Database Isolation**: Each influencer site should use the same database but with different influencer IDs
2. **Stripe Products**: Each influencer needs separate Stripe products and prices
3. **Domain Configuration**: Update deployment URLs for each influencer
4. **Environment Variables**: Generate separate `.env` files for each site
5. **Backup**: Always backup your configuration before making changes

## 🔧 Troubleshooting

### Common Issues

1. **500 Errors**: Check database connection and influencer configuration
2. **Stripe Errors**: Verify Stripe keys and product IDs
3. **AI Not Responding**: Check OpenAI API key and model configuration
4. **Database Connection**: Verify database URL and credentials

### Debug Commands

```bash
# Check database connection
npm run db:studio

# Test token system
npm run test:tokens

# Add tokens to user
npm run add:tokens

# Check Stripe configuration
npm run stripe:list
```

## 📞 Support

If you encounter issues:

1. Check the console logs for error messages
2. Verify all configuration fields are correct
3. Test database connectivity
4. Verify Stripe and OpenAI API keys
5. Check that all required files exist

## 🎉 Success!

Once setup is complete, you'll have:

- ✅ Fully functional influencer site
- ✅ Isolated user data and conversations
- ✅ Working subscription system
- ✅ AI-powered chat functionality
- ✅ Production-ready deployment setup

You can now create as many influencer sites as needed by repeating this process!
