#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function createNewInfluencerSite() {
  console.log('🎭 Create New Influencer Site\n');
  console.log('This script will help you create a completely independent influencer site.');
  console.log('Users will be able to sign up directly and create conversations automatically.\n');

  try {
    // Get influencer details
    const influencerName = await askQuestion('Influencer Name (e.g., "Selena Gomez"): ');
    const influencerHandle = await askQuestion('Handle/Username (e.g., "selenagomez"): ');
    const port = await askQuestion('Development Port (e.g., "3005"): ') || '3005';
    
    if (!influencerName || !influencerHandle) {
      console.log('❌ Influencer name and handle are required.');
      rl.close();
      return;
    }

    // Create directory name
    const dirName = `influencer-website-${influencerHandle}`;
    const targetPath = path.join(process.cwd(), dirName);

    console.log(`\n📁 Creating new site: ${dirName}`);
    console.log(`📍 Location: ${targetPath}`);
    console.log(`🌐 Port: ${port}`);

    // Check if directory already exists
    if (fs.existsSync(targetPath)) {
      console.log(`❌ Directory ${dirName} already exists. Please choose a different handle.`);
      rl.close();
      return;
    }

    // Copy the current project
    console.log('\n🔄 Copying project files...');
    try {
      execSync(`cp -r . "${targetPath}"`, { stdio: 'inherit' });
    } catch (error) {
      console.log('❌ Error copying files:', error.message);
      rl.close();
      return;
    }

    // Remove node_modules and .next to avoid conflicts
    console.log('🧹 Cleaning up copied files...');
    try {
      if (fs.existsSync(path.join(targetPath, 'node_modules'))) {
        execSync(`rm -rf "${targetPath}/node_modules"`, { stdio: 'inherit' });
      }
      if (fs.existsSync(path.join(targetPath, '.next'))) {
        execSync(`rm -rf "${targetPath}/.next"`, { stdio: 'inherit' });
      }
      // Remove any .env files to ensure clean config
      if (fs.existsSync(path.join(targetPath, '.env'))) {
        execSync(`rm -f "${targetPath}/.env"`, { stdio: 'inherit' });
      }
      if (fs.existsSync(path.join(targetPath, '.env.local'))) {
        execSync(`rm -f "${targetPath}/.env.local"`, { stdio: 'inherit' });
      }
    } catch (error) {
      console.log('⚠️ Warning: Could not clean up some files:', error.message);
    }

    // Update package.json with new port
    const packageJsonPath = path.join(targetPath, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    packageJson.name = `influencer-${influencerHandle}`;
    packageJson.scripts.dev = `next dev -p ${port}`;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

    console.log('\n✅ Project copied successfully!');
    console.log('\n📋 Next Steps:');
    console.log(`1. cd "${dirName}"`);
    console.log('2. npm install');
    console.log('3. npm run setup:config');
    console.log('4. npm run setup:stripe');
    console.log('5. npm run setup:database');
    console.log('6. npm run dev');
    console.log(`7. Visit http://localhost:${port}`);

    console.log('\n🎉 Your new influencer site is ready for setup!');
    console.log('\n💡 What makes this independent:');
    console.log('• Users can sign up directly (no admin setup required)');
    console.log('• Conversations are created automatically when users chat');
    console.log('• Separate subscription plans and billing');
    console.log('• Complete data isolation from other influencer sites');
    console.log('• Uses influencer.config.js (no .env files needed)');
    console.log('• Shares database but with complete data isolation');

  } catch (error) {
    console.error('❌ Error creating new site:', error.message);
  } finally {
    rl.close();
  }
}

createNewInfluencerSite();
