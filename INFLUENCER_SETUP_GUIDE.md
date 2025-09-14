# 🎭 Influencer Website Setup Guide

This guide shows you how to create multiple influencer websites using this template system.

## 🚀 Quick Start

### 1. Create New Influencer Template

```bash
node scripts/create-influencer-template.js
```

This will ask you for:
- Influencer name and handle
- Domain name
- Stripe configuration
- Branding colors
- Pricing plans
- AI personality

### 2. Deploy to Hostinger

```bash
node scripts/deploy-hostinger.js
```

This creates a deployment package ready for Hostinger.

## 📁 Project Structure

```
influencer-website/
├── influencer.config.js          # Main configuration file
├── src/
│   ├── lib/
│   │   ├── config.ts            # Configuration loader
│   │   ├── db/
│   │   │   ├── config-queries.ts # Config-based database queries
│   │   │   └── ...
│   │   └── ...
│   └── ...
├── scripts/for stri
│   ├── create-influencer-template.js
│   ├── deploy-hostinger.js
│   └── generate-env.js
└── deployments/
    └── [influencer-name]/
        ├── influencer.config.js
        ├── .env.local
        ├── .env.production
        └── DEPLOYMENT.md
```

## ⚙️ Configuration System

### influencer.config.js

Each influencer has their own configuration file with:

```javascript
module.exports = {
  // Influencer Information
  influencer: {
    id: 'taylor-swift-001',
    name: 'Taylor Swift',
    handle: 'taylorswift',
    displayName: 'Taylor Swift',
    bio: 'Singer-songwriter...',
    avatarUrl: '/images/taylor-swift-avatar.jpg',
    // ... social media links
  },

  // Website Branding
  branding: {
    primaryColor: '#E91E63',
    secondaryColor: '#9C27B0',
    accentColor: '#FF4081',
    // ... custom CSS
  },

  // Stripe Configuration
  stripe: {
    publishableKey: 'pk_test_...',
    secretKey: 'sk_test_...',
    webhookSecret: 'whsec_...',
    products: { basic: 'prod_...', premium: 'prod_...', vip: 'prod_...' },
    prices: { basic_monthly: 'price_...', premium_monthly: 'price_...', vip_monthly: 'price_...' }
  },

  // Subscription Plans
  plans: [
    {
      id: 'basic',
      name: 'Basic Chat Access',
      priceCents: 999,
      features: ['5 messages per day', 'Basic responses'],
      accessLevel: 'basic'
    },
    // ... more plans
  ],

  // AI Configuration
  ai: {
    openaiApiKey: 'sk-proj-...',
    personalityPrompt: 'You are Taylor Swift...',
    // ... AI settings
  },

  // Deployment Configuration
  deployment: {
    domain: 'taylor-swift-ai.com',
    baseUrl: 'https://taylor-swift-ai.com',
    hostinger: {
      publicHtmlPath: '/public_html/taylor-swift-ai'
    }
  }
};
```

## 🎯 Creating Multiple Influencers

### Method 1: Interactive Template Creation

```bash
# Create Taylor Swift website
node scripts/create-influencer-template.js
# Enter: Taylor Swift, taylorswift, taylor-swift-ai.com, etc.

# Create Drake website  
node scripts/create-influencer-template.js
# Enter: Drake, drake, drake-ai.com, etc.

# Create Billie Eilish website
node scripts/create-influencer-template.js
# Enter: Billie Eilish, billieeilish, billie-eilish-ai.com, etc.
```

### Method 2: Manual Configuration

1. Copy `influencer.config.js` to `influencer.config.[name].js`
2. Modify all the settings for the new influencer
3. Run deployment script

### Method 3: Batch Creation

Create a script to generate multiple influencers at once:

```javascript
const influencers = [
  { name: 'Taylor Swift', handle: 'taylorswift', domain: 'taylor-swift-ai.com' },
  { name: 'Drake', handle: 'drake', domain: 'drake-ai.com' },
  { name: 'Billie Eilish', handle: 'billieeilish', domain: 'billie-eilish-ai.com' }
];

// Generate configs for each
```

## 🚀 Hostinger Deployment

### 1. Prepare Deployment Package

```bash
node scripts/deploy-hostinger.js
```

### 2. Upload to Hostinger

1. **Access Hostinger File Manager**
2. **Navigate to public_html**
3. **Create folder for influencer**: `/public_html/taylor-swift-ai/`
4. **Upload all files** from `deployments/taylor-swift-ai/`
5. **Set file permissions**: 755 for folders, 644 for files

### 3. Install Dependencies

```bash
cd /public_html/taylor-swift-ai/
npm install --production
```

### 4. Build Application

```bash
npm run build
```

### 5. Configure Stripe

1. **Create Stripe Products** for each plan
2. **Create Stripe Prices** for each product
3. **Update price IDs** in `influencer.config.js`
4. **Set up Webhooks**:
   - Endpoint: `https://taylor-swift-ai.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_*`

### 6. Configure DNS

1. **Point domain** to Hostinger hosting
2. **Enable SSL** certificate
3. **Test website** functionality

## 💳 Stripe Setup for Each Influencer

### 1. Create Stripe Account (or use existing)

### 2. Create Products

```bash
# For Taylor Swift
curl -X POST https://api.stripe.com/v1/products \
  -u sk_test_...: \
  -d name="Taylor Swift Basic Chat" \
  -d description="Basic access to chat with Taylor Swift"

# For Drake  
curl -X POST https://api.stripe.com/v1/products \
  -u sk_test_...: \
  -d name="Drake Basic Chat" \
  -d description="Basic access to chat with Drake"
```

### 3. Create Prices

```bash
# For Taylor Swift Basic Plan
curl -X POST https://api.stripe.com/v1/prices \
  -u sk_test_...: \
  -d product=prod_taylor_swift_basic \
  -d unit_amount=999 \
  -d currency=usd \
  -d recurring[interval]=month
```

### 4. Update Configuration

Update the `stripe.products` and `stripe.prices` in each influencer's config file.

## 🎨 Customization Options

### Branding

- **Colors**: Primary, secondary, accent colors
- **Logo**: Upload custom logo images
- **Fonts**: Custom font families
- **CSS**: Custom CSS overrides

### Features

- **Voice Messages**: Enable/disable voice features
- **Media Upload**: Enable/disable media sharing
- **Analytics**: Enable/disable user analytics
- **Social Login**: Enable/disable social authentication

### Pricing

- **Plan Names**: Customize plan names and descriptions
- **Prices**: Set different prices for each influencer
- **Features**: Customize features for each plan
- **Access Levels**: Define what each plan includes

### AI Personality

- **Personality Prompt**: Define how the AI should behave
- **Response Style**: Formal, casual, friendly, etc.
- **Topics**: What the AI can talk about
- **Limitations**: What the AI should avoid

## 📊 Management Dashboard

Create a central dashboard to manage all influencer websites:

```javascript
// admin-dashboard.js
const influencers = [
  { name: 'Taylor Swift', domain: 'taylor-swift-ai.com', status: 'active' },
  { name: 'Drake', domain: 'drake-ai.com', status: 'active' },
  { name: 'Billie Eilish', domain: 'billie-eilish-ai.com', status: 'building' }
];
```

## 🔧 Maintenance

### Updates

1. **Update base code** in main repository
2. **Copy updates** to each influencer deployment
3. **Rebuild and deploy** each website

### Monitoring

- **Analytics**: Track usage across all websites
- **Revenue**: Monitor Stripe payments
- **Performance**: Monitor website speed and uptime
- **Errors**: Track and fix issues

## 📈 Scaling

### Database

- **Shared Database**: All influencers share the same database
- **Separate Tables**: Each influencer has their own data
- **Multi-tenant**: Scale to hundreds of influencers

### Infrastructure

- **CDN**: Use Cloudflare or similar for global delivery
- **Caching**: Redis for session management
- **Load Balancing**: Handle high traffic

## 🆘 Troubleshooting

### Common Issues

1. **Environment Variables**: Check `.env.production` file
2. **Stripe Webhooks**: Verify webhook endpoints
3. **Database Connection**: Check database URL
4. **Build Errors**: Check Node.js version compatibility

### Support

- Check logs in Hostinger file manager
- Test Stripe webhooks with Stripe CLI
- Verify DNS settings
- Check SSL certificate status

## 🎉 Success!

Once deployed, each influencer will have their own:

- ✅ **Custom domain** (e.g., taylor-swift-ai.com)
- ✅ **Unique branding** and colors
- ✅ **Custom pricing** plans
- ✅ **AI personality** matching the influencer
- ✅ **Stripe integration** for payments
- ✅ **User management** and subscriptions
- ✅ **Mobile-responsive** design

Each website is completely independent and can be managed separately!
