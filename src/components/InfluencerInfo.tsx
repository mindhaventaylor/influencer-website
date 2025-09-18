'use client';

import { getClientInfluencerInfo, getClientBranding } from '@/lib/clientConfig';
import Image from 'next/image';

interface InfluencerInfoProps {
  showSocialMedia?: boolean;
  showBio?: boolean;
  className?: string;
}

export default function InfluencerInfo({ 
  showSocialMedia = true, 
  showBio = true, 
  className = '' 
}: InfluencerInfoProps) {
  const influencer = getClientInfluencerInfo();
  const branding = getClientBranding();

  return (
    <div className={`text-center ${className}`}>
      <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
        <Image
          src={influencer.avatarUrl}
          alt={influencer.displayName}
          width={96}
          height={96}
          className="w-full h-full object-cover"
        />
      </div>
      
      <h1 className="text-2xl font-bold text-white mb-2">{influencer.displayName}</h1>
      
      {showBio && influencer.bio && (
        <p className="text-gray-400 mb-4 max-w-md mx-auto">{influencer.bio}</p>
      )}
      
      {showSocialMedia && (
        <div className="flex justify-center space-x-4">
          {influencer.socialMedia.instagram && (
            <a
              href={`https://instagram.com/${influencer.socialMedia.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <span className="sr-only">Instagram</span>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.83-9.281c-.49 0-.875-.385-.875-.875s.385-.875.875-.875.875.385.875.875-.385.875-.875.875z"/>
              </svg>
            </a>
          )}
          
          {influencer.socialMedia.twitter && (
            <a
              href={`https://twitter.com/${influencer.socialMedia.twitter}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <span className="sr-only">Twitter</span>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </a>
          )}
          
          {influencer.socialMedia.tiktok && (
            <a
              href={`https://tiktok.com/@${influencer.socialMedia.tiktok}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <span className="sr-only">TikTok</span>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05 2.83-.14 4.24-.22v4.13c-1.44.08-2.8.17-4.24.22v4.03c-1.54-.17-3.12-.68-4.24-1.79-1.12-1.08-1.67-2.64-1.75-4.17-1.3.01-2.6.02-3.91.02V.02zm0 8.04c-1.3.01-2.6-.01-3.91-.02v4.13c1.31.01 2.61.02 3.91.02v-4.13zm0 8.04c-1.3-.01-2.6.01-3.91.02v4.13c1.31-.01 2.61-.02 3.91-.02v-4.13z"/>
              </svg>
            </a>
          )}
        </div>
      )}
      
      {influencer.websiteUrl && (
        <div className="mt-4">
          <a
            href={influencer.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
          >
            Visit Website
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
}