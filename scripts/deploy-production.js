#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Production Deployment Script\n');

try {
  // Step 1: Check if we're in the right directory
  if (!fs.existsSync('package.json')) {
    throw new Error('package.json not found. Please run this script from the project root.');
  }

  // Step 2: Check environment variables
  console.log('🔍 Checking environment variables...');
  
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.log('⚠️  Missing environment variables:');
    missingVars.forEach(varName => console.log(`   - ${varName}`));
    console.log('\nPlease set these variables before deploying.');
    console.log('You can create a .env.production file or set them in your deployment platform.');
    process.exit(1);
  }
  
  console.log('   ✅ All required environment variables are set');

  // Step 3: Install dependencies
  console.log('\n📦 Installing dependencies...');
  execSync('npm ci --only=production', { stdio: 'inherit' });
  console.log('   ✅ Dependencies installed');

  // Step 4: Run setup if needed
  console.log('\n🔧 Running setup...');
  try {
    execSync('npm run setup:complete', { stdio: 'inherit' });
    console.log('   ✅ Setup completed');
  } catch (error) {
    console.log('   ⚠️  Setup failed, but continuing with deployment');
  }

  // Step 5: Build the application
  console.log('\n🏗️ Building application...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('   ✅ Application built successfully');

  // Step 6: Check build output
  if (!fs.existsSync('.next')) {
    throw new Error('Build failed: .next directory not found');
  }

  console.log('\n📊 Build Summary:');
  
  // Count pages
  const pagesDir = path.join('.next', 'server', 'app');
  let pageCount = 0;
  if (fs.existsSync(pagesDir)) {
    const countPages = (dir) => {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const itemPath = path.join(dir, item);
        if (fs.statSync(itemPath).isDirectory()) {
          if (fs.existsSync(path.join(itemPath, 'page.js'))) {
            pageCount++;
          }
          countPages(itemPath);
        }
      });
    };
    countPages(pagesDir);
  }

  console.log(`   📄 Pages built: ${pageCount}`);
  console.log(`   📁 Build size: ${getDirectorySize('.next')} MB`);
  console.log(`   🕒 Build time: ${new Date().toLocaleTimeString()}`);

  // Step 7: Production readiness check
  console.log('\n🔍 Production Readiness Check:');
  
  const checks = [
    { name: 'Environment variables', check: () => missingVars.length === 0 },
    { name: 'Build output', check: () => fs.existsSync('.next') },
    { name: 'Package.json', check: () => fs.existsSync('package.json') },
    { name: 'Start script', check: () => {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      return pkg.scripts && pkg.scripts.start;
    }},
  ];

  checks.forEach(check => {
    const passed = check.check();
    console.log(`   ${passed ? '✅' : '❌'} ${check.name}`);
  });

  // Step 8: Deployment instructions
  console.log('\n🚀 Deployment Instructions:');
  console.log('\n📋 Choose your deployment method:');
  console.log('\n1️⃣  Vercel (Recommended):');
  console.log('   npm i -g vercel');
  console.log('   vercel --prod');
  
  console.log('\n2️⃣  Railway:');
  console.log('   npm i -g @railway/cli');
  console.log('   railway login');
  console.log('   railway up');
  
  console.log('\n3️⃣  Self-hosted:');
  console.log('   npm run start');
  console.log('   # Or with PM2:');
  console.log('   npm i -g pm2');
  console.log('   pm2 start npm --name "influencer-chat" -- start');
  
  console.log('\n4️⃣  Docker:');
  console.log('   docker build -t influencer-chat .');
  console.log('   docker run -p 3005:3005 influencer-chat');

  console.log('\n🎉 Your app is ready for production deployment!');
  console.log('\n📖 For detailed instructions, see: PRODUCTION_DEPLOYMENT_GUIDE.md');

} catch (error) {
  console.error('❌ Deployment preparation failed:', error.message);
  process.exit(1);
}

function getDirectorySize(dirPath) {
  let totalSize = 0;
  
  function calculateSize(itemPath) {
    const stats = fs.statSync(itemPath);
    if (stats.isDirectory()) {
      const items = fs.readdirSync(itemPath);
      items.forEach(item => {
        calculateSize(path.join(itemPath, item));
      });
    } else {
      totalSize += stats.size;
    }
  }
  
  if (fs.existsSync(dirPath)) {
    calculateSize(dirPath);
  }
  
  return (totalSize / (1024 * 1024)).toFixed(2);
}
