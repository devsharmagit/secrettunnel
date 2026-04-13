import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "SecretTunnel | Terminal Vault Security",
  description: "Share a secret. End-to-end encrypted. Burned after reading.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${jetBrainsMono.variable} dark`}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-background text-on-background font-body antialiased selection:bg-primary selection:text-on-primary">
        {children}
        <Analytics />
        <Toaster 
          theme="dark" 
          position="bottom-center" 
          toastOptions={{ 
            style: { 
              background: '#131314', 
              border: '1px solid rgba(246, 190, 57, 0.2)', 
              color: '#e5e2e3', 
              borderRadius: '2px',
              fontFamily: 'var(--font-inter)'
            } 
          }} 
        />
      </body>
    </html>
  );
}
