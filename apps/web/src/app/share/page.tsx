import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { SecretForm } from "@/components/SecretForm";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Share a Secret | SecretTunnel",
  description: "End-to-end encrypted secret sharing. The server never sees your plaintext.",
};

export default async function SharePage() {
  const session = await auth();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar isLoggedIn={Boolean(session?.user)} />
      <main className="flex-grow flex items-center justify-center bg-surface pt-32 pb-24 px-6 relative">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(246,190,57,0.04)_0%,transparent_60%)]"></div>
        </div>
        
        <div className="w-full max-w-2xl relative z-10">
          <SecretForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}
