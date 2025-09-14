#!/usr/bin/env node

const postgres = require('postgres');

async function addAccessLevelColumn() {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      console.log('❌ Please set DATABASE_URL environment variable');
      process.exit(1);
    }

    const sql = postgres(databaseUrl);

    console.log('🔧 Adding access_level column to plans table...\n');

    // Add the column if it doesn't exist
    await sql`
      ALTER TABLE "plans" ADD COLUMN IF NOT EXISTS "access_level" varchar(50) DEFAULT 'basic'
    `;

    // Update existing plans with access levels based on their names
    await sql`
      UPDATE "plans" SET "access_level" = 'basic' WHERE "name" LIKE '%Basic%'
    `;
    
    await sql`
      UPDATE "plans" SET "access_level" = 'premium' WHERE "name" LIKE '%Premium%'
    `;
    
    await sql`
      UPDATE "plans" SET "access_level" = 'vip' WHERE "name" LIKE '%VIP%'
    `;

    // Show the updated plans
    const plans = await sql`
      SELECT id, name, price_cents, access_level 
      FROM "plans" 
      ORDER BY price_cents
    `;

    console.log('✅ Updated plans:');
    plans.forEach(plan => {
      console.log(`- ${plan.name}: $${(plan.price_cents / 100).toFixed(2)} (${plan.access_level})`);
    });

    await sql.end();

    console.log('\n✅ access_level column added successfully!');

  } catch (error) {
    console.error('❌ Error adding access_level column:', error);
    process.exit(1);
  }
}

addAccessLevelColumn();
