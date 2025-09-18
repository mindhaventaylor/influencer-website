'use client';

import { getClientInfluencerInfo, getClientBranding } from '@/lib/clientConfig';

interface DynamicMetadataProps {
  children: React.ReactNode;
}

export function DynamicMetadata({ children }: DynamicMetadataProps) {
  const influencer = getClientInfluencerInfo();
  const branding = getClientBranding();

  return (
    <>
      {/* Dynamic meta tags */}
      <meta name="description" content={`Chat with ${influencer.displayName} - ${influencer.bio}`} />
      <meta name="keywords" content={`${influencer.displayName}, AI chat, influencer, conversation`} />
      <meta name="author" content={influencer.displayName} />
      
      {/* Open Graph */}
      <meta property="og:title" content={`${influencer.displayName} AI Chat`} />
      <meta property="og:description" content={influencer.bio} />
      <meta property="og:image" content={influencer.avatarUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={`${influencer.displayName} AI Chat`} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${influencer.displayName} AI Chat`} />
      <meta name="twitter:description" content={influencer.bio} />
      <meta name="twitter:image" content={influencer.avatarUrl} />
      
      {/* Favicon */}
      <link rel="icon" href={branding.faviconUrl} />
      <link rel="apple-touch-icon" href={branding.faviconUrl} />
      
      {/* Theme colors */}
      <meta name="theme-color" content={branding.primaryColor} />
      <meta name="msapplication-TileColor" content={branding.primaryColor} />
      
      {children}
    </>
  );
}