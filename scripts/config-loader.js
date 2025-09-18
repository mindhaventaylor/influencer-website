#!/usr/bin/env node

// Environment-based configuration loader for scripts
// This module provides a unified way to load configuration from environment variables
// with fallback to influencer.config.js for backward compatibility

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Fallback config loader
let fallbackConfig = {};
try {
  fallbackConfig = require('../influencer.config.js');
} catch (error) {
  // Config file not found, will use environment variables only
}

/**
 * Load configuration from environment variables with fallback to config file
 */
function loadConfig() {
  return {
    influencer: {
      id: process.env.INFLUENCER_ID || fallbackConfig.influencer?.id || '',
      name: process.env.INFLUENCER_NAME || fallbackConfig.influencer?.name || '',
      handle: process.env.INFLUENCER_HANDLE || fallbackConfig.influencer?.handle || '',
      displayName: process.env.INFLUENCER_DISPLAY_NAME || fallbackConfig.influencer?.displayName || '',
      bio: process.env.INFLUENCER_BIO || fallbackConfig.influencer?.bio || '',
      avatarUrl: process.env.INFLUENCER_AVATAR_URL || fallbackConfig.influencer?.avatarUrl || '/default_avatar.png',
      websiteUrl: process.env.INFLUENCER_WEBSITE_URL || fallbackConfig.influencer?.websiteUrl || '',
      databaseId: process.env.INFLUENCER_DATABASE_ID || fallbackConfig.influencer?.databaseId,
      socialMedia: {
        instagram: process.env.INFLUENCER_INSTAGRAM || fallbackConfig.influencer?.socialMedia?.instagram || '',
        twitter: process.env.INFLUENCER_TWITTER || fallbackConfig.influencer?.socialMedia?.twitter || '',
        tiktok: process.env.INFLUENCER_TIKTOK || fallbackConfig.influencer?.socialMedia?.tiktok || '',
      },
    },
    branding: {
      primaryColor: process.env.BRANDING_PRIMARY_COLOR || fallbackConfig.branding?.primaryColor || '#e64162',
      secondaryColor: process.env.BRANDING_SECONDARY_COLOR || fallbackConfig.branding?.secondaryColor || '#bc3012',
      accentColor: process.env.BRANDING_ACCENT_COLOR || fallbackConfig.branding?.accentColor || '#81ddef',
      logoUrl: process.env.BRANDING_LOGO_URL || fallbackConfig.branding?.logoUrl || '/images/teste-logo.png',
      faviconUrl: process.env.BRANDING_FAVICON_URL || fallbackConfig.branding?.faviconUrl || '/images/teste-favicon.ico',
      customCss: process.env.BRANDING_CUSTOM_CSS || fallbackConfig.branding?.customCss || '',
    },
    plans: JSON.parse(process.env.PLANS_CONFIG || JSON.stringify(fallbackConfig.plans || [])),
    stripe: {
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || fallbackConfig.stripe?.publishableKey || '',
      secretKey: process.env.STRIPE_SECRET_KEY || fallbackConfig.stripe?.secretKey || '',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || fallbackConfig.stripe?.webhookSecret || '',
      products: JSON.parse(process.env.STRIPE_PRODUCTS || JSON.stringify(fallbackConfig.stripe?.products || {})),
    },
    ai: {
      creator_id: process.env.AI_CREATOR_ID || fallbackConfig.ai?.creator_id || '',
      openaiApiKey: process.env.OPENAI_API_KEY || fallbackConfig.ai?.openaiApiKey || '',
      model: process.env.AI_MODEL || fallbackConfig.ai?.model || 'gpt-4',
      temperature: parseFloat(process.env.AI_TEMPERATURE || fallbackConfig.ai?.temperature || '0.3'),
      maxTokens: parseInt(process.env.AI_MAX_TOKENS || fallbackConfig.ai?.maxTokens || '3000'),
      personalityPrompt: process.env.AI_PERSONALITY_PROMPT || fallbackConfig.ai?.personalityPrompt || '',
      systemMessage: process.env.AI_SYSTEM_MESSAGE || fallbackConfig.ai?.systemMessage || '',
    },
    database: {
      url: process.env.DATABASE_URL || fallbackConfig.database?.url || '',
      supabase: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || fallbackConfig.database?.supabase?.url || '',
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || fallbackConfig.database?.supabase?.anonKey || '',
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || fallbackConfig.database?.supabase?.serviceRoleKey || '',
      },
    },
    deployment: {
      domain: process.env.DEPLOYMENT_DOMAIN || fallbackConfig.deployment?.domain || '',
      baseUrl: process.env.DEPLOYMENT_BASE_URL || fallbackConfig.deployment?.baseUrl || '',
      environment: process.env.NODE_ENV || fallbackConfig.deployment?.environment || 'development',
    },
  };
}

/**
 * Get specific configuration sections
 */
const getInfluencerInfo = () => loadConfig().influencer;
const getBranding = () => loadConfig().branding;
const getPlans = () => loadConfig().plans;
const getStripeConfig = () => loadConfig().stripe;
const getAIConfig = () => loadConfig().ai;
const getDatabaseConfig = () => loadConfig().database;
const getDeploymentConfig = () => loadConfig().deployment;

/**
 * Check if environment variables are properly set
 */
function validateEnvironment() {
  const requiredVars = [
    'INFLUENCER_NAME',
    'INFLUENCER_DISPLAY_NAME',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'DATABASE_URL'
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(varName => console.error(`   - ${varName}`));
    console.log('\n💡 Run: npm run migrate:env');
    return false;
  }
  
  return true;
}

/**
 * Generate environment file content from config
 */
function generateEnvContent(config, isProduction = false) {
  return `# Generated from influencer.config.js - ${isProduction ? 'Production' : 'Development'} Environment
# Influencer: ${config.influencer.displayName} (${config.influencer.handle})

# Influencer Information
INFLUENCER_ID=${config.influencer.id}
INFLUENCER_NAME=${config.influencer.name}
INFLUENCER_HANDLE=${config.influencer.handle}
INFLUENCER_DISPLAY_NAME=${config.influencer.displayName}
INFLUENCER_BIO=${config.influencer.bio}
INFLUENCER_AVATAR_URL=${config.influencer.avatarUrl}
INFLUENCER_WEBSITE_URL=${config.influencer.websiteUrl}
INFLUENCER_DATABASE_ID=${config.influencer.databaseId || ''}
INFLUENCER_INSTAGRAM=${config.influencer.socialMedia.instagram}
INFLUENCER_TWITTER=${config.influencer.socialMedia.twitter}
INFLUENCER_TIKTOK=${config.influencer.socialMedia.tiktok}

# Branding
BRANDING_PRIMARY_COLOR=${config.branding.primaryColor}
BRANDING_SECONDARY_COLOR=${config.branding.secondaryColor}
BRANDING_ACCENT_COLOR=${config.branding.accentColor}
BRANDING_LOGO_URL=${config.branding.logoUrl}
BRANDING_FAVICON_URL=${config.branding.faviconUrl}
BRANDING_CUSTOM_CSS=${config.branding.customCss}

# Plans Configuration (JSON string)
PLANS_CONFIG=${JSON.stringify(config.plans)}

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${config.stripe.publishableKey}
STRIPE_SECRET_KEY=${config.stripe.secretKey}
STRIPE_WEBHOOK_SECRET=${config.stripe.webhookSecret}

# Stripe Products (JSON string)
STRIPE_PRODUCTS=${JSON.stringify(config.stripe.products)}

# AI Configuration
AI_CREATOR_ID=${config.ai.creator_id}
OPENAI_API_KEY=${config.ai.openaiApiKey}
AI_MODEL=${config.ai.model}
AI_TEMPERATURE=${config.ai.temperature}
AI_MAX_TOKENS=${config.ai.maxTokens}
AI_PERSONALITY_PROMPT=${config.ai.personalityPrompt}
AI_SYSTEM_MESSAGE=${config.ai.systemMessage}

# Database Configuration
DATABASE_URL=${config.database.url}

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=${config.database.supabase.url}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${config.database.supabase.anonKey}
SUPABASE_SERVICE_ROLE_KEY=${config.database.supabase.serviceRoleKey}

# Deployment Configuration
DEPLOYMENT_DOMAIN=${config.deployment.domain}
DEPLOYMENT_BASE_URL=${config.deployment.baseUrl}
NODE_ENV=${isProduction ? 'production' : 'development'}
`;
}

module.exports = {
  loadConfig,
  getInfluencerInfo,
  getBranding,
  getPlans,
  getStripeConfig,
  getAIConfig,
  getDatabaseConfig,
  getDeploymentConfig,
  validateEnvironment,
  generateEnvContent
};

