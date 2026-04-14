import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { CLISection } from "@/components/landing/CLISection";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { VersionedSecretsLanding } from "@/components/landing/VersionedSecretsLanding";
import { SecurityModel } from "@/components/landing/SecurityModel";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "SecretTunnel — Zero-Knowledge .env Secret Sharing",
  description:
    "Share secrets securely. Encrypted in your browser with AES-256-GCM, stored as ciphertext, destroyed on read. The server is provably blind.",
  openGraph: {
    title: "SecretTunnel — Zero-Knowledge .env Secret Sharing",
    description:
      "Encrypted in your browser. Stored as ciphertext. Destroyed on read.",
    type: "website",
  },
};

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="bg-surface">
        <HeroSection />
        <HowItWorksSection />
        <CLISection />
        <FeaturesGrid />
        <VersionedSecretsLanding />
        <SecurityModel />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
