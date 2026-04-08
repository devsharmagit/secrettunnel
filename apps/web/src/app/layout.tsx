import type { Metadata } from "next";
import { Geist, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: "SecretTunnel",
  description: "Share a secret. End-to-end encrypted. Burned after reading.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${plexMono.variable} dark`}>
      <body className="min-h-screen bg-[#0c0c0c] text-[#f0ece4] font-sans antialiased selection:bg-[#d4a84b] selection:text-[#0c0c0c]">
        {children}
        <Analytics />
        <Toaster 
          theme="dark" 
          position="bottom-center" 
          toastOptions={{ 
            style: { 
              background: '#161616', 
              border: '1px solid #2a2a2a', 
              color: '#f0ece4', 
              borderRadius: '2px', // rounded-sm approx
              fontFamily: 'var(--font-geist)'
            } 
          }} 
        />
      </body>
    </html>
  );
}
