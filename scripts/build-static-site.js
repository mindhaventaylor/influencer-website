#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Building Static Site...\n');

try {
  // Step 1: Create a temporary directory for static build
  const tempDir = path.join(__dirname, '..', '.temp-static');
  const outDir = path.join(__dirname, '..', 'out');
  
  // Clean up previous builds
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true });
  }
  if (fs.existsSync(outDir)) {
    fs.rmSync(outDir, { recursive: true });
  }
  
  console.log('📁 Creating temporary build directory...');
  fs.mkdirSync(tempDir, { recursive: true });
  
  // Step 2: Copy only the static pages to temp directory
  console.log('📋 Copying static pages...');
  
  const staticPages = [
    'src/app/page.tsx',
    'src/app/layout.tsx',
    'src/app/globals.css',
    'src/app/favicon.ico',
    'src/app/payment/cancel/page.tsx',
    'src/app/payment/success/page.tsx',
    'src/app/fix-user/page.tsx',
    'src/app/test-user/page.tsx'
  ];
  
  // Copy static pages
  staticPages.forEach(page => {
    const srcPath = path.join(__dirname, '..', page);
    const destPath = path.join(tempDir, page);
    
    if (fs.existsSync(srcPath)) {
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.copyFileSync(srcPath, destPath);
      console.log(`   ✅ Copied: ${page}`);
    }
  });
  
  // Step 3: Copy necessary components and utilities
  console.log('🔧 Copying components and utilities...');
  
  const componentsToCopy = [
    'src/components',
    'src/lib',
    'src/api',
    'src/hooks',
    'src/assets',
    'src/store',
    'src/app/api' // We'll filter this later
  ];
  
  componentsToCopy.forEach(component => {
    const srcPath = path.join(__dirname, '..', component);
    const destPath = path.join(tempDir, component);
    
    if (fs.existsSync(srcPath)) {
      copyDirectory(srcPath, destPath);
      console.log(`   ✅ Copied: ${component}`);
    }
  });
  
  // Step 4: Copy configuration files
  console.log('⚙️ Copying configuration files...');
  
  const configFiles = [
    'package.json',
    'next.config.static.js',
    'tailwind.config.ts',
    'tsconfig.json',
    'postcss.config.mjs',
    'public',
    'influencer.config.js',
    'deployment-info.json'
  ];
  
  configFiles.forEach(file => {
    const srcPath = path.join(__dirname, '..', file);
    const destPath = path.join(tempDir, file);
    
    if (fs.existsSync(srcPath)) {
      if (fs.statSync(srcPath).isDirectory()) {
        copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
      console.log(`   ✅ Copied: ${file}`);
    }
  });
  
  // Step 5: Configure for static export with external API support
  console.log('🔧 Configuring for static export with external API support...');
  
  // Create a static-friendly next.config.js
  const staticConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Static export configuration
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Custom dist directory for static export
  distDir: 'out',
};

module.exports = nextConfig;`;
  
  fs.writeFileSync(path.join(tempDir, 'next.config.js'), staticConfig);
  
  // Create environment configuration for static site
  const envConfig = `# Static site environment configuration
# This file configures the static site to use external APIs

# API Base URL - Update this to point to your deployed API server
NEXT_PUBLIC_API_BASE_URL=https://your-api-server.com/api

# Supabase configuration (same as production)
NEXT_PUBLIC_SUPABASE_URL=${process.env.NEXT_PUBLIC_SUPABASE_URL || 'your_supabase_url'}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your_supabase_anon_key'}

# Stripe configuration (same as production)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'your_stripe_publishable_key'}

# Other environment variables
NODE_ENV=production`;
  
  fs.writeFileSync(path.join(tempDir, '.env.local'), envConfig);
  
  // Remove API routes since they won't work in static export
  const apiDir = path.join(tempDir, 'src/app/api');
  if (fs.existsSync(apiDir)) {
    fs.rmSync(apiDir, { recursive: true });
    console.log('   ✅ Removed API routes (will use external APIs)');
  }
  
  console.log('   ✅ Created static-friendly config and environment');
  
  // Step 6: Build the static site
  console.log('🔨 Building static site...');
  
  process.chdir(tempDir);
  
  // Rename the static config to be the main config
  fs.renameSync('next.config.static.js', 'next.config.js');
  
  // Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm install --silent', { stdio: 'inherit' });
  
  // Build the site
  console.log('🏗️ Building Next.js static export...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Step 7: Copy the built files to the main project
  console.log('📋 Copying built files to main project...');
  
  const builtDir = path.join(tempDir, 'out');
  if (fs.existsSync(builtDir)) {
    copyDirectory(builtDir, outDir);
    console.log('   ✅ Static site built successfully!');
  }
  
  // Step 8: Clean up
  console.log('🧹 Cleaning up...');
  fs.rmSync(tempDir, { recursive: true });
  
  console.log('\n🎉 Static site build completed!');
  console.log(`📁 Output directory: ${outDir}`);
  console.log('\n📋 Static files generated:');
  
  // List the generated files
  listFiles(outDir, '');
  
  console.log('\n🚀 You can now deploy the "out" directory to any static hosting service!');
  console.log('   Examples: Vercel, Netlify, GitHub Pages, AWS S3, etc.');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function listFiles(dir, prefix) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(prefix, entry.name);
    
    if (entry.isDirectory()) {
      console.log(`   📁 ${relativePath}/`);
      listFiles(fullPath, relativePath);
    } else {
      const stats = fs.statSync(fullPath);
      const size = (stats.size / 1024).toFixed(1);
      console.log(`   📄 ${relativePath} (${size}KB)`);
    }
  }
}
