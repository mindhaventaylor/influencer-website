# 💳 Shared Stripe Setup Guide

This guide explains how to use a single Stripe account for multiple influencer websites, with each influencer having their own products and prices.

## 🎯 Overview

- **One Stripe Account**: All influencer websites use the same Stripe account
- **Separate Products**: Each influencer gets their own products (Basic, Premium, VIP)
- **Separate Prices**: Each influencer gets their own prices for each plan
- **Metadata Tracking**: Products are tagged with influencer metadata for easy management
- **Automatic Creation**: Products and prices are created automatically when setting up a new influencer

## 🚀 Quick Start

### 1. Create New Influencer (with automatic Stripe setup)

```bash
npm run create:influencer
```

This will:
- Ask for influencer details
- Create Stripe products automatically
- Create Stripe prices automatically
- Generate configuration with real Stripe IDs
- Create deployment package

### 2. Manage Stripe Influencers

```bash
# List all influencers in Stripe
npm run stripe:list

# Generate performance report
npm run stripe:report
```

## 📋 Stripe Account Structure

### Products
Each influencer gets 3 products:
- `{Influencer Name} - Basic Chat Access`
- `{Influencer Name} - Premium Chat Access`
- `{Influencer Name} - VIP Chat Access`

### Prices
Each product gets 1 price:
- Monthly recurring subscription
- Amount based on influencer configuration

### Metadata
All products and prices include metadata:
```json
{
  "influencer": "taylorswift",
  "plan_id": "basic",
  "access_level": "basic"
}
```

## 🔧 Configuration

### influencer.config.js
```javascript
stripe: {
  publishableKey: 'pk_test_...', // Same for all influencers
  secretKey: 'sk_test_...',      // Same for all influencers
  webhookSecret: 'whsec_...',    // Same for all influencers
  
  // Real Stripe IDs (created automatically)
  products: {
    basic: 'prod_taylor_swift_basic_001',
    premium: 'prod_taylor_swift_premium_001',
    vip: 'prod_taylor_swift_vip_001'
  },
  prices: {
    basic_monthly: 'price_taylor_swift_basic_monthly_001',
    premium_monthly: 'price_taylor_swift_premium_monthly_001',
    vip_monthly: 'price_taylor_swift_vip_monthly_001'
  }
}
```

## 📊 Managing Multiple Influencers

### List All Influencers
```bash
node scripts/manage-stripe-influencers.js list <stripe_secret_key>
```

Output:
```
👤 TAYLORSWIFT
   Products: 3
   Prices: 3
   📦 Taylor Swift - Basic Chat Access (prod_...)
      💰 $9.99/month (price_...)
   📦 Taylor Swift - Premium Chat Access (prod_...)
      💰 $19.99/month (price_...)
   📦 Taylor Swift - VIP Chat Access (prod_...)
      💰 $49.99/month (price_...)

👤 DRAKE
   Products: 3
   Prices: 3
   📦 Drake - Basic Chat Access (prod_...)
      💰 $14.99/month (price_...)
   ...
```

### Generate Performance Report
```bash
node scripts/manage-stripe-influencers.js report <stripe_secret_key>
```

Output:
```
📈 INFLUENCER PERFORMANCE REPORT

👤 TAYLORSWIFT
   Products: 3
   Active Subscriptions: 45
   Monthly Revenue: $899.55

👤 DRAKE
   Products: 3
   Active Subscriptions: 32
   Monthly Revenue: $639.68
```

### Delete Influencer
```bash
node scripts/manage-stripe-influencers.js delete taylorswift <stripe_secret_key>
```

## 🎭 Creating Multiple Influencers

### Method 1: Interactive Creation
```bash
# Create Taylor Swift
npm run create:influencer
# Enter: Taylor Swift, taylorswift, taylor-swift-ai.com, $9.99, $19.99, $49.99

# Create Drake
npm run create:influencer
# Enter: Drake, drake, drake-ai.com, $14.99, $29.99, $69.99

# Create Billie Eilish
npm run create:influencer
# Enter: Billie Eilish, billieeilish, billie-eilish-ai.com, $12.99, $24.99, $59.99
```

### Method 2: Batch Creation Script
```javascript
// scripts/create-multiple-influencers.js
const influencers = [
  {
    name: 'Taylor Swift',
    handle: 'taylorswift',
    domain: 'taylor-swift-ai.com',
    prices: { basic: 999, premium: 1999, vip: 4999 }
  },
  {
    name: 'Drake',
    handle: 'drake',
    domain: 'drake-ai.com',
    prices: { basic: 1499, premium: 2999, vip: 6999 }
  },
  {
    name: 'Billie Eilish',
    handle: 'billieeilish',
    domain: 'billie-eilish-ai.com',
    prices: { basic: 1299, premium: 2499, vip: 5999 }
  }
];

// Create each influencer
for (const influencer of influencers) {
  await createInfluencerTemplate(influencer);
}
```

## 🔄 Webhook Configuration

### Single Webhook Endpoint
All influencer websites can use the same webhook endpoint:
```
https://your-main-domain.com/api/stripe/webhook
```

### Webhook Events
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

### Webhook Handler
The webhook handler automatically routes to the correct influencer based on the product metadata:

```javascript
// src/app/api/stripe/webhook/route.ts
export async function POST(request) {
  const event = await stripe.webhooks.constructEvent(/*...*/);
  
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const productId = session.line_items.data[0].price.product;
    
    // Get product to find influencer
    const product = await stripe.products.retrieve(productId);
    const influencerHandle = product.metadata.influencer;
    
    // Route to correct influencer logic
    await handleSubscriptionForInfluencer(influencerHandle, session);
  }
}
```

## 💰 Revenue Tracking

### Per-Influencer Revenue
Track revenue by influencer using product metadata:

```javascript
async function getInfluencerRevenue(influencerHandle) {
  const subscriptions = await stripe.subscriptions.list();
  let revenue = 0;
  
  for (const subscription of subscriptions.data) {
    if (subscription.status === 'active') {
      const product = await stripe.products.retrieve(
        subscription.items.data[0].price.product
      );
      
      if (product.metadata.influencer === influencerHandle) {
        revenue += subscription.items.data[0].price.unit_amount;
      }
    }
  }
  
  return revenue;
}
```

### Dashboard Integration
Create a central dashboard showing all influencers:

```javascript
// Dashboard showing all influencers
const influencers = [
  { name: 'Taylor Swift', handle: 'taylorswift', revenue: 899.55, subscribers: 45 },
  { name: 'Drake', handle: 'drake', revenue: 639.68, subscribers: 32 },
  { name: 'Billie Eilish', handle: 'billieeilish', revenue: 1249.90, subscribers: 25 }
];
```

## 🚀 Deployment

### Hostinger Setup
Each influencer website gets its own folder:
```
/public_html/taylor-swift-ai/
/public_html/drake-ai/
/public_html/billie-eilish-ai/
```

### Environment Variables
Each website has the same Stripe keys but different influencer config:
```bash
# Same for all websites
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Different for each website
NEXT_PUBLIC_INFLUENCER_ID=taylor-swift-001
NEXT_PUBLIC_INFLUENCER_NAME=Taylor Swift
```

## 🔧 Maintenance

### Adding New Plans
To add a new plan (e.g., yearly pricing):

1. Update the influencer config
2. Create new Stripe prices manually or via script
3. Update the configuration with new price IDs

### Updating Prices
To update existing prices:

1. Create new Stripe prices with updated amounts
2. Update influencer configuration
3. Existing subscribers keep old prices (Stripe handles this)

### Removing Influencers
To remove an influencer:

1. Archive all their products in Stripe
2. Archive all their prices
3. Existing subscribers continue until they cancel

## 📈 Scaling

### Performance
- **Products**: Stripe supports unlimited products
- **Prices**: Each product can have multiple prices
- **Subscriptions**: Unlimited subscriptions per account
- **Webhooks**: Single webhook handles all influencers

### Costs
- **Stripe Fees**: 2.9% + 30¢ per transaction (same for all)
- **No Additional Costs**: No extra fees for multiple products
- **Volume Discounts**: Available for high-volume accounts

## 🆘 Troubleshooting

### Common Issues

1. **Duplicate Products**: Check if products already exist before creating
2. **Metadata Missing**: Ensure all products have proper metadata
3. **Webhook Failures**: Check webhook endpoint and event types
4. **Price Updates**: New prices don't affect existing subscriptions

### Support Tools

```bash
# Check Stripe account status
stripe balance retrieve

# List all products
stripe products list

# List all subscriptions
stripe subscriptions list

# Test webhook
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## 🎉 Benefits

✅ **Single Account Management**: One Stripe account for all influencers
✅ **Automatic Setup**: Products and prices created automatically
✅ **Easy Tracking**: Metadata-based influencer identification
✅ **Scalable**: Supports unlimited influencers
✅ **Cost Effective**: No additional Stripe fees
✅ **Centralized Reporting**: View all influencers in one place
✅ **Flexible Pricing**: Each influencer can have different prices
✅ **Independent Websites**: Each influencer has their own domain and branding

This setup allows you to manage multiple influencer websites efficiently while keeping all payments in a single Stripe account!
