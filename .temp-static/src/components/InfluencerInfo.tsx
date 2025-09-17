'use client';

import { getInfluencerInfo, getBranding } from '@/lib/config';
import Image from 'next/image';

interface InfluencerInfoProps {
  showSocialMedia?: boolean;
  showBio?: boolean;
  className?: string;
}

export function InfluencerInfo({ 
  showSocialMedia = true, 
  showBio = true, 
  className = '' 
}: InfluencerInfoProps) {
  const influencer = getInfluencerInfo();
  const branding = getBranding();

  return (
    <div className={`influencer-info ${className}`}>
      {/* Avatar */}
      <div className="relative">
        <Image
          src={influencer.avatarUrl}
          alt={influencer.displayName}
          width={120}
          height={120}
          className="rounded-full border-4 influencer-border"
          style={{ borderColor: branding.primaryColor }}
        />
      </div>

      {/* Name and Handle */}
      <div className="text-center mt-4">
        <h1 className="text-2xl font-bold influencer-text-primary">
          {influencer.displayName}
        </h1>
        <p className="text-gray-400 text-sm">@{influencer.handle}</p>
      </div>

      {/* Bio */}
      {showBio && (
        <div className="text-center mt-3">
          <p className="text-gray-300 text-sm leading-relaxed">
            {influencer.bio}
          </p>
        </div>
      )}

      {/* Social Media Links */}
      {showSocialMedia && (
        <div className="flex justify-center space-x-4 mt-4">
          {influencer.socialMedia.instagram && (
            <a
              href={influencer.socialMedia.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-pink-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.621 5.367 11.988 11.988 11.988s11.987-5.367 11.987-11.988C24.004 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.596-3.205-1.529L3.205 16.988h-1.5V6.5h1.5v2.954c.757-.933 1.908-1.529 3.205-1.529 2.092 0 3.787 1.695 3.787 3.787s-1.695 3.787-3.787 3.787zm7.718 0c-2.092 0-3.787-1.695-3.787-3.787s1.695-3.787 3.787-3.787 3.787 1.695 3.787 3.787-1.695 3.787-3.787 3.787z"/>
              </svg>
            </a>
          )}
          
          {influencer.socialMedia.twitter && (
            <a
              href={influencer.socialMedia.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-400 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </a>
          )}
          
          {influencer.socialMedia.tiktok && (
            <a
              href={influencer.socialMedia.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-pink-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
              </svg>
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// Header component for pages
export function InfluencerHeader({ className = '' }: { className?: string }) {
  const influencer = getInfluencerInfo();
  
  return (
    <header className={`influencer-header ${className}`}>
      <div className="flex items-center space-x-3">
        <Image
          src={influencer.avatarUrl}
          alt={influencer.displayName}
          width={40}
          height={40}
          className="rounded-full"
        />
        <div>
          <h1 className="text-lg font-bold influencer-text-primary">
            {influencer.displayName}
          </h1>
          <p className="text-xs text-gray-400">AI Chat</p>
        </div>
      </div>
    </header>
  );
}

// Footer component
export function InfluencerFooter({ className = '' }: { className?: string }) {
  const influencer = getInfluencerInfo();
  
  return (
    <footer className={`influencer-footer ${className}`}>
      <div className="text-center text-sm text-gray-400">
        <p>© 2024 {influencer.displayName} AI Chat</p>
        <p className="mt-1">
          <a 
            href={influencer.websiteUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            Visit Official Website
          </a>
        </p>
      </div>
    </footer>
  );
}
