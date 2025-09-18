// Configuration system based on environment variables
// Secure and deployment-friendly approach

// Fallback to config file if environment variables are not set (for development)
let fallbackConfig: any = {};
try {
  // Only try to load config file in development environment
  if (process.env.NODE_ENV === 'development') {
    fallbackConfig = require('../../influencer.config.js');
  }
} catch (error) {
  // Config file not found, will use environment variables only
  console.log('Config file not found, using environment variables only');
}

export interface InfluencerConfig {
  influencer: {
    id: string;
    name: string;
    handle: string;
    displayName: string;
    bio: string;
    avatarUrl: string;
    websiteUrl: string;
    databaseId?: string; // Database UUID for instant access
    socialMedia: {
      instagram: string;
      twitter: string;
      tiktok: string;
    };
  };
  branding: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    logoUrl: string;
    faviconUrl: string;
    customCss: string;
  };
  plans: Array<{
    id: string;
    name: string;
    description: string;
    priceCents: number;
    currency: string;
    interval: string;
    stripePriceId: string;
    features: string[];
    accessLevel: string;
    isPopular: boolean;
  }>;
  stripe: {
    publishableKey: string;
    secretKey: string;
    webhookSecret: string;
    products: Record<string, string>;
  };
  ai: {
    creator_id: string;
    openaiApiKey: string;
    model: string;
    temperature: number;
    maxTokens: number;
    personalityPrompt: string;
    systemMessage: string;
  };
  database: {
    url: string;
    supabase: {
      url: string;
      anonKey: string;
      serviceRoleKey: string;
    };
  };
  deployment: {
    domain: string;
    baseUrl: string;
    environment: string;
  };
}

// Environment-based configuration loader
function loadConfigFromEnv(): InfluencerConfig {
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

// Export the configuration
export const config: InfluencerConfig = loadConfigFromEnv();

// Helper functions to get specific config values
export const getInfluencerInfo = () => config.influencer;
export const getInfluencerConfig = () => config;
export const getBranding = () => config.branding;
export const getPlans = () => config.plans;
export const getStripeConfig = () => config.stripe;
export const getAIConfig = () => config.ai;
export const getDatabaseConfig = () => config.database;
export const getDeploymentConfig = () => config.deployment;

// Get influencer database ID for instant access
export const getInfluencerDatabaseId = () => config.influencer.databaseId;

// Environment variables derived from config
export const getEnvVars = () => ({
  NEXT_PUBLIC_SUPABASE_URL: config.database.supabase.url,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: config.database.supabase.anonKey,
  SUPABASE_SERVICE_ROLE_KEY: config.database.supabase.serviceRoleKey,
  DATABASE_URL: config.database.url,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: config.stripe.publishableKey,
  STRIPE_SECRET_KEY: config.stripe.secretKey,
  STRIPE_WEBHOOK_SECRET: config.stripe.webhookSecret,
  OPENAI_API_KEY: config.ai.openaiApiKey,
  NEXT_PUBLIC_INFLUENCER_ID: config.influencer.id,
  NEXT_PUBLIC_INFLUENCER_NAME: config.influencer.displayName,
  NEXT_PUBLIC_INFLUENCER_HANDLE: config.influencer.handle,
  NEXT_PUBLIC_APP_URL: config.deployment.baseUrl,
  NEXT_PUBLIC_DOMAIN: config.deployment.domain,
  NEXT_PUBLIC_PRIMARY_COLOR: config.branding.primaryColor,
  NEXT_PUBLIC_SECONDARY_COLOR: config.branding.secondaryColor,
  NEXT_PUBLIC_ACCENT_COLOR: config.branding.accentColor,
});

// Set environment variables from config (for runtime)
if (typeof window === 'undefined') {
  const envVars = getEnvVars();
  Object.entries(envVars).forEach(([key, value]) => {
    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
}