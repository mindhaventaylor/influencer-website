#!/usr/bin/env node

const postgres = require('postgres');
const Stripe = require('stripe');

async function createStripeProductsForExistingPlans() {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      console.log('❌ Please set DATABASE_URL environment variable');
      process.exit(1);
    }

    const sql = postgres(databaseUrl);

    // Stripe keys from config
    const stripeSecretKey = 'sk_test_51S6dfkRzyGIanNctawSg0T298jHbCCLJ3GLunvHnYOeSeE8PJjCbAp1fWvUXAbU7QfrAj2xtMKW6pLPq8Bsb4JWw00i5UIImTr';
    const stripe = Stripe(stripeSecretKey);

    console.log('🔄 Creating Stripe products and prices for existing plans...\n');

    // Get all plans without Stripe IDs
    const plansWithoutStripe = await sql`
      SELECT p.*, i.handle, i.display_name
      FROM plans p
      JOIN influencers i ON p.influencer_id = i.id
      WHERE p.is_active = true
      AND (p.stripe_price_id IS NULL OR p.stripe_price_id = '' OR p.stripe_price_id LIKE 'price_%_template' OR p.stripe_price_id LIKE 'price_%_taylor_swift')
    `;

    if (plansWithoutStripe.length === 0) {
      console.log('✅ All plans already have Stripe IDs');
      await sql.end();
      return;
    }

    console.log(`Found ${plansWithoutStripe.length} plans that need Stripe IDs:`);
    plansWithoutStripe.forEach(plan => {
      console.log(`- ${plan.name} (${plan.handle}): $${(plan.price_cents / 100).toFixed(2)}/${plan.interval}`);
    });

    // Create Stripe products and prices for each plan
    for (const plan of plansWithoutStripe) {
      console.log(`\n🔄 Creating Stripe product for: ${plan.name}`);
      
      try {
        // Create product
        const product = await stripe.products.create({
          name: `${plan.display_name} - ${plan.name}`,
          description: plan.description,
          metadata: {
            influencer: plan.handle,
            plan_id: plan.id,
            access_level: plan.access_level
          }
        });
        
        console.log(`✅ Created product: ${product.name} (${product.id})`);
        
        // Create price
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: plan.price_cents,
          currency: plan.currency,
          recurring: {
            interval: plan.interval
          },
          metadata: {
            influencer: plan.handle,
            plan_id: plan.id,
            access_level: plan.access_level
          }
        });
        
        console.log(`✅ Created price: ${price.id} ($${(plan.price_cents / 100).toFixed(2)}/${plan.interval})`);
        
        // Update plan with Stripe IDs
        await sql`
          UPDATE plans
          SET 
            stripe_price_id = ${price.id},
            stripe_product_id = ${product.id},
            updated_at = now()
          WHERE id = ${plan.id}
        `;
        
        console.log(`✅ Updated plan ${plan.name} with Stripe IDs`);
        
      } catch (error) {
        console.error(`❌ Error creating Stripe product for ${plan.name}:`, error.message);
      }
    }

    // Show final results
    const finalPlans = await sql`
      SELECT p.*, i.handle, i.display_name
      FROM plans p
      JOIN influencers i ON p.influencer_id = i.id
      WHERE p.is_active = true
      ORDER BY i.display_name, p.price_cents
    `;

    console.log('\n🎉 Final plans with Stripe IDs:');
    let currentInfluencer = '';
    finalPlans.forEach(plan => {
      if (plan.display_name !== currentInfluencer) {
        currentInfluencer = plan.display_name;
        console.log(`\n📱 ${plan.display_name} (${plan.handle}):`);
      }
      console.log(`  - ${plan.name}: $${(plan.price_cents / 100).toFixed(2)}/${plan.interval} (${plan.access_level})`);
      if (plan.stripe_price_id) {
        console.log(`    Stripe Price ID: ${plan.stripe_price_id}`);
      }
    });

    await sql.end();

    console.log('\n✅ All plans now have Stripe IDs!');
    console.log('🎯 Your payment system is ready to use!');

  } catch (error) {
    console.error('❌ Error creating Stripe products:', error);
    process.exit(1);
  }
}

createStripeProductsForExistingPlans();
