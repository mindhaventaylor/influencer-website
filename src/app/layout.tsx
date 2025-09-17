import type { Metadata } from "next";
import "./globals.css";
import ViewportHeightHandler from "@/components/ui/ViewportHeightHandler";

export const metadata: Metadata = {
  title: "Influencer Chat App",
  description: "Chat with AI influencers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#000000" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200..800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <ViewportHeightHandler />
        <div id="root" className="h-screen-mobile overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
