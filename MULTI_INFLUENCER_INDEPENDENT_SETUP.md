# 🎭 Multi-Influencer Independent Setup Guide

This guide shows you how to create multiple influencer sites that operate completely independently - each with their own users, subscriptions, and conversations.

## 🎯 What You'll Get

Each influencer site will have:
- ✅ **Independent user authentication** (users sign up directly)
- ✅ **Separate subscription plans** (not shared between influencers)
- ✅ **Automatic conversation creation** (no manual setup required)
- ✅ **Independent branding and configuration**
- ✅ **Separate Stripe products and pricing**

## 🚀 Quick Setup for New Influencer

### Method 1: Copy Project (Recommended)

```bash
# 1. Copy the entire project for a new influencer
cp -r influencer-website influencer-website-selena
cd influencer-website-selena

# 2. Configure the new influencer
npm run setup:config

# 3. Set up Stripe products
npm run setup:stripe

# 4. Set up database
npm run setup:database

# 5. Start development
npm run dev
```

### Method 2: Use Different Ports

```bash
# Run multiple influencers on different ports
cd influencer-website-taylor
npm run dev -p 3002

cd influencer-website-selena  
npm run dev -p 3003

cd influencer-website-ariana
npm run dev -p 3004
```

## 📋 Detailed Setup Steps

### Step 1: Configure Influencer (`npm run setup:config`)

This interactive script will ask you for:

- **Influencer Information**: Name, handle, display name, bio
- **Branding**: Colors, logo, custom CSS
- **Subscription Plans**: 3 plans with different pricing
- **Stripe Configuration**: API keys and webhook secrets
- **Deployment**: Domain and base URL
- **AI Configuration**: OpenAI API key and personality prompt

### Step 2: Set Up Stripe (`npm run setup:stripe`)

This script will:
- Create separate Stripe products for each plan
- Create separate Stripe prices for each plan
- Update your configuration with the actual Stripe IDs
- Ensure each influencer has independent billing

### Step 3: Set Up Database (`npm run setup:database`)

This script will:
- Create/update the influencer in the database
- Create subscription plans linked to the influencer
- Set up the AI personality prompt
- Verify the setup is complete

## 🏗️ Architecture Overview

### Independent User Flow

```
User visits influencer site
    ↓
User signs up directly (no admin setup required)
    ↓
User starts chatting
    ↓
Conversation created automatically
    ↓
User can subscribe to plans
    ↓
User gets tokens based on subscription
```

### Data Isolation

Each influencer site has:
- **Separate user accounts** (users can't access other influencer sites)
- **Separate conversations** (chat history is isolated)
- **Separate subscriptions** (billing is independent)
- **Separate tokens** (usage tracking is per influencer)

### Database Structure

```
influencers table:
├── id (UUID)
├── name (e.g., "Taylor Swift")
├── prompt (AI personality)
└── plan_ids (array of plan UUIDs)

plans table:
├── id (UUID)
├── influencer_id (links to influencer)
├── name (e.g., "Taylor Swift Premium")
├── stripe_price_id (unique per influencer)
└── features (plan-specific features)

conversations table:
├── id (UUID)
├── user_id (user UUID)
├── influencer_id (influencer UUID)
└── tokens (remaining tokens)

chat_messages table:
├── id (UUID)
├── user_id (user UUID)
├── influencer_id (influencer UUID)
└── conversation_id (conversation UUID)
```

## 🔧 Configuration Examples

### Taylor Swift Site (`taylor.yourdomain.com`)

```javascript
// influencer.config.js
module.exports = {
  influencer: {
    name: "Taylor Swift",
    handle: "taylorswift",
    displayName: "Taylor (AI Fan Bot)",
    bio: "A warm, songwriting-inspired AI that chats like a Taylor Swift–themed companion."
  },
  plans: [
    {
      name: "Taylor Swift Basic",
      priceCents: 999,
      stripePriceId: "price_taylorswift_basic"
    },
    {
      name: "Taylor Swift Premium", 
      priceCents: 1999,
      stripePriceId: "price_taylorswift_premium"
    }
  ],
  deployment: {
    domain: "taylor.yourdomain.com",
    baseUrl: "https://taylor.yourdomain.com"
  }
};
```

### Selena Gomez Site (`selena.yourdomain.com`)

```javascript
// influencer.config.js
module.exports = {
  influencer: {
    name: "Selena Gomez",
    handle: "selenagomez", 
    displayName: "Selena (AI Fan Bot)",
    bio: "A vibrant, music-loving AI companion inspired by Selena Gomez."
  },
  plans: [
    {
      name: "Selena Gomez Basic",
      priceCents: 899,
      stripePriceId: "price_selenagomez_basic"
    },
    {
      name: "Selena Gomez Premium",
      priceCents: 1799, 
      stripePriceId: "price_selenagomez_premium"
    }
  ],
  deployment: {
    domain: "selena.yourdomain.com",
    baseUrl: "https://selena.yourdomain.com"
  }
};
```

## 🚀 Deployment

### Option 1: Separate Domains (Recommended)

```bash
# Deploy each influencer to their own domain
cd influencer-website-taylor
npm run deploy  # Deploys to taylor.yourdomain.com

cd influencer-website-selena
npm run deploy  # Deploys to selena.yourdomain.com
```

### Option 2: Subdirectories

```bash
# Deploy to subdirectories on the same domain
cd influencer-website-taylor
npm run deploy  # Deploys to yourdomain.com/taylor

cd influencer-website-selena  
npm run deploy  # Deploys to yourdomain.com/selena
```

## 🔐 Security & Isolation

### User Isolation
- Users can only access conversations for the influencer they're chatting with
- User data is isolated per influencer site
- No cross-influencer data access

### Billing Isolation
- Each influencer has separate Stripe products
- Billing is completely independent
- Revenue tracking is per influencer

### Data Isolation
- Chat messages are filtered by influencer_id
- Conversations are filtered by influencer_id
- Token balances are filtered by influencer_id

## 📊 Management

### Adding New Influencers

1. **Copy the project**:
   ```bash
   cp -r influencer-website influencer-website-new
   cd influencer-website-new
   ```

2. **Configure the influencer**:
   ```bash
   npm run setup:config
   ```

3. **Set up Stripe**:
   ```bash
   npm run setup:stripe
   ```

4. **Set up database**:
   ```bash
   npm run setup:database
   ```

5. **Deploy**:
   ```bash
   npm run deploy
   ```

### Monitoring Multiple Sites

Each influencer site has independent:
- User analytics
- Revenue tracking
- Chat metrics
- Token usage

## 🎉 Benefits

✅ **Scalable**: Add unlimited influencers
✅ **Independent**: Each site operates separately
✅ **User-friendly**: Users sign up directly
✅ **Automated**: Conversations created automatically
✅ **Secure**: Complete data isolation
✅ **Flexible**: Different pricing per influencer
✅ **Branded**: Each site has unique branding

## 🆘 Troubleshooting

### Common Issues

1. **Stripe Products Not Created**
   - Run `npm run setup:stripe` after configuration
   - Check Stripe API keys are correct

2. **Database Errors**
   - Run `npm run setup:database` after Stripe setup
   - Ensure database connection is working

3. **Users Can't Sign Up**
   - Check Supabase configuration
   - Verify authentication is enabled

4. **Chat Not Working**
   - Check OpenAI API key
   - Verify influencer prompt is set

### Getting Help

- Check the server logs for detailed error messages
- Verify all configuration steps were completed
- Ensure all API keys are valid and have proper permissions

---

🎭 **You're now ready to create unlimited influencer sites with complete independence!**
