# 🎯 Influencer AI Chat Platform

A complete AI chat platform that can be customized for any influencer. Each influencer gets their own branded website with AI chat, subscription plans, and token-based access control.

## 🚀 Quick Start for New Influencer

### 1. Clone and Setup
```bash
# Clone this repository
git clone <your-repo-url>
cd influencer-website

# Install dependencies
npm install
```

### 2. Configure Your Influencer
```bash
# Interactive setup - this will guide you through all configurations
npm run configure
```

This script will help you set up:
- ✅ Influencer name and branding
- ✅ AI personality and prompts
- ✅ Subscription plans and pricing
- ✅ Stripe integration
- ✅ Database configuration
- ✅ Domain and deployment settings

### 3. Setup Database and System
```bash
# Complete system setup (safe - won't break existing data)
npm run setup:complete
```

This script will:
- ✅ Create/update influencer in database
- ✅ Fix any missing user data
- ✅ Create conversations and sample messages
- ✅ Verify everything is working

### 4. Start Development
```bash
# Start the development server
npm run dev
```

Visit `http://localhost:3002` to see your influencer's website!

## 📋 Available Scripts

### 🔧 Essential Commands
```bash
npm run configure          # Interactive influencer setup
npm run setup:complete     # Setup database and system
npm run dev               # Start development server
```

### 🎨 Customization
```bash
npm run create:influencer  # Create new influencer template
npm run generate:env       # Generate environment variables
npm run update:project     # Update project metadata
```

### 💰 Stripe Management
```bash
npm run stripe:list        # List Stripe products/prices
npm run stripe:report      # Generate Stripe usage report
```

### 🎫 Token Management
```bash
npm run test:tokens        # Check token system status
npm run add:tokens         # Add tokens to user (for testing)
```

### 🔐 User Management
```bash
npm run cleanup:auth       # Delete user from auth (if needed)
```

### 🚀 Deployment
```bash
npm run deploy:hostinger   # Deploy to Hostinger
```

## 🏗️ System Architecture

### Database Schema
- **`users`** - User accounts with Stripe integration
- **`influencers`** - Influencer profiles and AI settings
- **`conversations`** - Chat sessions with token tracking
- **`chat_messages`** - Individual chat messages

### Key Features
- ✅ **AI Chat** - Powered by OpenAI with custom personalities
- ✅ **Token System** - Pay-per-message or subscription-based
- ✅ **Stripe Integration** - Secure payment processing
- ✅ **Multi-tenant** - Each influencer has their own space
- ✅ **Responsive Design** - Works on all devices

## 🎯 Creating Multiple Influencers

### Method 1: Copy and Customize
1. Copy the entire project folder
2. Run `npm run configure` in the new folder
3. Update all settings for the new influencer
4. Deploy to a new domain

### Method 2: Use Deployment Folders
The project includes a `deployments/` folder with pre-configured setups:
- `deployments/teste-ai/` - Example configuration
- `deployments/-ai/` - Another example

## 🔧 Configuration Files

### `influencer.config.js` (Main Configuration)
```javascript
module.exports = {
  influencer: {
    name: "Your Influencer Name",
    prompt: "AI personality prompt",
    modelPreset: { /* AI settings */ }
  },
  plans: [
    {
      id: "basic",
      name: "Basic Plan",
      priceCents: 1000,
      // ... plan details
    }
  ],
  stripe: {
    // Stripe configuration
  },
  database: {
    // Database settings
  }
}
```

## 🛡️ Safety Features

### What's Protected
- ✅ **No destructive scripts** - Removed all dangerous database cleanup scripts
- ✅ **Safe setup** - `setup:complete` only adds data, never deletes
- ✅ **Backup-friendly** - All scripts are non-destructive
- ✅ **Error handling** - Comprehensive error checking

### Safe Scripts Only
- `setup:complete` - Safe setup (adds data only)
- `configure` - Interactive configuration
- `test:tokens` - Read-only testing
- `add:tokens` - Safe token addition

## 🚨 Important Notes

### ⚠️ Database Safety
- **Never run cleanup scripts** - They have been removed for safety
- **Always backup** before major changes
- **Use `setup:complete`** for initial setup - it's safe and non-destructive

### 💡 Best Practices
1. **Test locally first** - Always test on localhost before deployment
2. **Use staging** - Deploy to a staging domain first
3. **Monitor tokens** - Check token usage regularly
4. **Update regularly** - Keep dependencies updated

## 🆘 Troubleshooting

### Common Issues

**"User not found in database"**
```bash
npm run setup:complete  # Fixes missing user data
```

**"No tokens remaining"**
```bash
npm run add:tokens      # Add more tokens for testing
```

**"Chat messages failing"**
```bash
npm run setup:complete  # Recreates conversations
```

**"Plans not showing"**
```bash
npm run configure       # Reconfigure plans
```

### Getting Help
1. Check the terminal logs for detailed error messages
2. Run `npm run test:tokens` to check system health
3. Verify your `influencer.config.js` is properly configured
4. Ensure your Stripe keys are correct

## 📞 Support

For issues or questions:
1. Check this README first
2. Run the troubleshooting commands
3. Check the terminal logs for specific errors
4. Verify all configuration files are correct

---

**🎉 Your influencer AI chat platform is ready to go!**

Start with `npm run configure` to set up your first influencer, then `npm run setup:complete` to initialize the system.