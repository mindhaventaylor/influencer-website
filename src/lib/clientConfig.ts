// Client-safe configuration - only exposes NEXT_PUBLIC_ environment variables
// This file is safe to import in client components

export interface ClientInfluencerInfo {
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
}

export interface ClientBranding {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string;
  faviconUrl: string;
}

// Client-safe configuration loader
function loadClientConfig() {
  return {
    influencer: {
      id: process.env.NEXT_PUBLIC_INFLUENCER_ID || '',
      name: process.env.NEXT_PUBLIC_INFLUENCER_NAME || '',
      handle: process.env.NEXT_PUBLIC_INFLUENCER_HANDLE || '',
      displayName: process.env.NEXT_PUBLIC_INFLUENCER_NAME || '',
      bio: process.env.NEXT_PUBLIC_INFLUENCER_BIO || '',
      avatarUrl: process.env.NEXT_PUBLIC_INFLUENCER_AVATAR_URL || '/default_avatar.png',
      websiteUrl: process.env.NEXT_PUBLIC_INFLUENCER_WEBSITE_URL || '',
      socialMedia: {
        instagram: process.env.NEXT_PUBLIC_INFLUENCER_INSTAGRAM || '',
        twitter: process.env.NEXT_PUBLIC_INFLUENCER_TWITTER || '',
        tiktok: process.env.NEXT_PUBLIC_INFLUENCER_TIKTOK || '',
      },
    },
    branding: {
      primaryColor: process.env.NEXT_PUBLIC_PRIMARY_COLOR || '#e64162',
      secondaryColor: process.env.NEXT_PUBLIC_SECONDARY_COLOR || '#bc3012',
      accentColor: process.env.NEXT_PUBLIC_ACCENT_COLOR || '#81ddef',
      logoUrl: process.env.NEXT_PUBLIC_LOGO_URL || '/images/teste-logo.png',
      faviconUrl: process.env.NEXT_PUBLIC_FAVICON_URL || '/images/teste-favicon.ico',
    },
  };
}

// Export the client-safe configuration
export const clientConfig = loadClientConfig();

// Helper functions for client components
export const getClientInfluencerInfo = (): ClientInfluencerInfo => clientConfig.influencer;
export const getClientBranding = (): ClientBranding => clientConfig.branding;
