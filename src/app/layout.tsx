import type { Metadata } from "next";
import "./globals.css";
import ViewportHeightHandler from "@/components/ui/ViewportHeightHandler";
import { DynamicMetadata } from "@/components/DynamicMetadata";
import { getInfluencerInfo } from "@/lib/config";
import { Toaster } from "@/components/ui/sonner";

// Dynamic metadata based on influencer config
export async function generateMetadata(): Promise<Metadata> {
  const influencer = getInfluencerInfo();
  
  return {
    title: `${influencer.displayName} AI Chat`,
    description: `Chat with ${influencer.displayName} - ${influencer.bio}`,
    keywords: [influencer.displayName, "AI chat", "influencer", "conversation"],
    authors: [{ name: influencer.displayName }],
    openGraph: {
      title: `${influencer.displayName} AI Chat`,
      description: influencer.bio,
      images: [
        {
          url: influencer.avatarUrl,
          width: 1200,
          height: 630,
          alt: influencer.displayName,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${influencer.displayName} AI Chat`,
      description: influencer.bio,
      images: [influencer.avatarUrl],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200..800&display=swap" rel="stylesheet" />
        <DynamicMetadata />
      </head>
      <body className="antialiased">
        <ViewportHeightHandler />
        <div id="root" className="h-screen-mobile overflow-hidden influencer-branding">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
