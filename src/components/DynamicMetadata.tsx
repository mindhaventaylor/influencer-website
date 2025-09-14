'use client';

import { getInfluencerInfo, getBranding } from '@/lib/config';

interface DynamicMetadataProps {
  children: React.ReactNode;
}

export function DynamicMetadata({ children }: DynamicMetadataProps) {
  const influencer = getInfluencerInfo();
  const branding = getBranding();

  return (
    <>
      {/* Dynamic favicon */}
      <link rel="icon" href={influencer.avatarUrl || '/favicon.ico'} />
      
      {/* Dynamic theme color */}
      <meta name="theme-color" content={branding.primaryColor} />
      
      {/* Dynamic Open Graph */}
      <meta property="og:title" content={`${influencer.displayName} AI Chat`} />
      <meta property="og:description" content={influencer.bio} />
      <meta property="og:image" content={influencer.avatarUrl} />
      <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : ''} />
      
      {/* Dynamic Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${influencer.displayName} AI Chat`} />
      <meta name="twitter:description" content={influencer.bio} />
      <meta name="twitter:image" content={influencer.avatarUrl} />
      
      {/* Dynamic CSS variables */}
      <style jsx global>{`
        :root {
          --influencer-primary: ${branding.primaryColor};
          --influencer-secondary: ${branding.secondaryColor};
          --influencer-accent: ${branding.accentColor};
          --influencer-name: "${influencer.displayName}";
          --influencer-handle: "${influencer.handle}";
        }
        
        .influencer-gradient {
          background: linear-gradient(135deg, var(--influencer-primary), var(--influencer-secondary));
        }
        
        .influencer-text-primary {
          color: var(--influencer-primary);
        }
        
        .influencer-branding {
          --primary: var(--influencer-primary);
          --secondary: var(--influencer-secondary);
          --accent: var(--influencer-accent);
        }
        
        ${branding.customCss}
      `}</style>
      
      {children}
    </>
  );
}
