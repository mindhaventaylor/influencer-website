#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔄 **UPDATING ALL SCRIPTS TO USE ENVIRONMENT VARIABLES**\n');

// List of scripts that need updating (excluding the ones we've already updated)
const scriptsToUpdate = [
  'scripts/update-influencer-data.js',
  'scripts/test-token-system.js',
  'scripts/update-stripe-product-names.js',
  'scripts/update-project-info.js',
  'scripts/test-signup-data-flow.js',
  'scripts/setup-stripe-products.js',
  'scripts/test-401-handling.js',
  'scripts/generate-env.js',
  'scripts/setup-complete-system-with-stripe-names.js',
  'scripts/setup-complete-system-updated.js',
  'scripts/setup-configured-plans.js',
  'scripts/setup-database-independent.js',
  'scripts/fix-missing-users.js',
  'scripts/deploy-hostinger.js',
  'scripts/fix-stripe-prices.js',
  'scripts/debug-profile-plan-display.js',
  'scripts/create-conversations-table.js',
  'scripts/check-stripe-prices.js',
  'scripts/check-database-schema.js',
  'scripts/add-tokens-to-user.js'
];

function updateScript(scriptPath) {
  try {
    console.log(`📝 Updating ${scriptPath}...`);
    
    let content = fs.readFileSync(scriptPath, 'utf8');
    
    // Replace require('../influencer.config.js') with config loader
    if (content.includes("require('../influencer.config.js')")) {
      content = content.replace(
        /const config = require\('\.\.\/influencer\.config\.js'\);/g,
        `const { loadConfig } = require('./config-loader');
const config = loadConfig();`
      );
      
      // Add dotenv loading if not present
      if (!content.includes("require('dotenv')")) {
        content = content.replace(
          /#!/,
          `#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });`
        );
      }
      
      // Add validation if not present
      if (!content.includes('validateEnvironment')) {
        content = content.replace(
          /const config = loadConfig\(\);/,
          `const { validateEnvironment } = require('./config-loader');

// Validate environment variables
if (!validateEnvironment()) {
  process.exit(1);
}

const config = loadConfig();`
        );
      }
      
      fs.writeFileSync(scriptPath, content);
      console.log(`   ✅ Updated ${scriptPath}`);
      return true;
    } else {
      console.log(`   ⏭️  Skipped ${scriptPath} (no config require found)`);
      return false;
    }
  } catch (error) {
    console.error(`   ❌ Error updating ${scriptPath}: ${error.message}`);
    return false;
  }
}

function updateAllScripts() {
  let updatedCount = 0;
  
  scriptsToUpdate.forEach(scriptPath => {
    if (fs.existsSync(scriptPath)) {
      if (updateScript(scriptPath)) {
        updatedCount++;
      }
    } else {
      console.log(`   ⚠️  File not found: ${scriptPath}`);
    }
  });
  
  console.log(`\n🎉 Updated ${updatedCount} scripts successfully!`);
  console.log('\n📋 All scripts now use environment variables with fallback to config file');
  console.log('💡 Run: npm run migrate:env to generate environment files');
}

updateAllScripts();

