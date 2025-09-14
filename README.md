# 🎯 Influencer AI Chat Platform

A complete AI chat platform that can be customized for any influencer. Each influencer gets their own branded website with AI chat, subscription plans, and token-based access control.

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd influencer-website
npm install
```

### 2. Setup Your Influencer
```bash
# Complete automated setup
npm run setup
```

This will guide you through:
- ✅ Influencer name and branding
- ✅ AI personality and prompts  
- ✅ Subscription plans and pricing
- ✅ Stripe integration
- ✅ Database configuration
- ✅ Domain and deployment settings

### 3. Start Development
```bash
npm run dev
```

Visit `http://localhost:3002` to see your influencer's website!

## 🎭 Multiple Influencer Sites

Create multiple influencer sites with complete data isolation:

### Method 1: Copy Project (Recommended)
```bash
# Copy the entire project
cp -r influencer-website influencer-website-selena
cd influencer-website-selena

# Run setup for new influencer
npm run setup
```

### Method 2: Example Configuration
```bash
# Create example for second influencer
node scripts/create-second-influencer-example.js
```

📖 **[Complete Multi-Influencer Guide](./MULTI_INFLUENCER_SETUP_GUIDE.md)**

## 📋 Available Commands

| Command | Description |
|---------|-------------|
| `npm run setup` | **Complete automated setup for new influencer** |
| `npm run configure` | Interactive influencer configuration |
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run deploy` | Deploy to Hostinger |
| `npm run db:studio` | Open database studio |
| `npm run tokens:add` | Add tokens to user (admin) |
| `npm run tokens:test` | Test token system |

## 🎨 Features

- **🤖 AI-Powered Chat**: Customizable AI personality for each influencer
- **💳 Subscription Plans**: Multiple pricing tiers with Stripe integration
- **🎫 Token System**: Pay-per-message or subscription-based access
- **🎨 Custom Branding**: Colors, logos, and styling per influencer
- **📱 Mobile-First**: Responsive design optimized for mobile
- **🔒 Secure**: User authentication and data isolation
- **🚀 Production Ready**: Easy deployment to Hostinger

## 🗄️ Database Isolation

Each influencer site has complete data isolation:
- ✅ **Separate conversations** per influencer
- ✅ **Independent token balances** per influencer  
- ✅ **Isolated subscription data** per influencer
- ✅ **Separate chat messages** per influencer

Multiple influencers can safely share the same Supabase database.

## 🛡️ Safety Features

- ✅ **No destructive scripts** - All scripts are safe and non-destructive
- ✅ **Safe setup** - Only adds data, never deletes
- ✅ **Backup-friendly** - All operations are reversible
- ✅ **Error handling** - Comprehensive error checking

## 🚨 Important Notes

### ⚠️ Before You Start
- **Backup your data** before making major changes
- **Test locally first** before deploying to production
- **Use staging domains** for testing

### 💡 Best Practices
1. **Test the setup** - Always test on localhost first
2. **Use staging** - Deploy to a staging domain first  
3. **Monitor tokens** - Check token usage regularly
4. **Update regularly** - Keep dependencies updated

## 🆘 Troubleshooting

### Common Issues

**"User not found in database"**
```bash
npm run setup  # Fixes missing user data
```

**"No tokens remaining"**
```bash
npm run tokens:add  # Add more tokens for testing
```

**"Chat messages failing"**
```bash
npm run setup  # Recreates conversations
```

**"Stripe errors"**
- Check your Stripe keys in the configuration
- Verify product and price IDs
- Test with Stripe test mode first

### Debug Commands

```bash
# Check database
npm run db:studio

# Test token system  
npm run tokens:test

# Add tokens to user
npm run tokens:add
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

You can now create as many influencer sites as needed!

---

## 📚 Additional Resources

- **[Multi-Influencer Setup Guide](./MULTI_INFLUENCER_SETUP_GUIDE.md)** - Detailed guide for multiple sites
- **[Chat Isolation Fix](./CHAT_ISOLATION_FIX.md)** - Technical details about chat isolation
- **[Safe Scripts Guide](./SAFE_SCRIPTS_GUIDE.md)** - Information about safe operations
- **[Stripe Setup Guide](./STRIPE_SHARED_SETUP.md)** - Stripe configuration details