// Configuration system based only on influencer.config.js
// No .env files or constants needed

const influencerConfig = require('../../influencer.config.js');

export interface InfluencerConfig {
  influencer: {
    id: string;
    name: string;
    handle: string;
    displayName: string;
    bio: string;
    avatarUrl: string;
    websiteUrl: string;
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

// Export the configuration
export const config: InfluencerConfig = influencerConfig;

// Helper functions to get specific config values
export const getInfluencerInfo = () => config.influencer;
export const getInfluencerConfig = () => config;
export const getBranding = () => config.branding;
export const getPlans = () => config.plans;
export const getStripeConfig = () => config.stripe;
export const getAIConfig = () => config.ai;
export const getDatabaseConfig = () => config.database;
export const getDeploymentConfig = () => config.deployment;

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