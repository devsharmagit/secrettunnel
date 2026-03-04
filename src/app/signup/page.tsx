import Link from "next/link";
import { redirect } from "next/navigation";
import { KeyRound, Sparkles, UserRoundPlus } from "lucide-react";

import { SignUpForm } from "@/components/auth/sign-up-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";

export default async function SignUpPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-6 py-10 text-[#f5f5f5]"
      style={{
        backgroundImage:
          "linear-gradient(#2a2a2a 1px, transparent 1px), linear-gradient(90deg, #2a2a2a 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    >
      <section className="w-full max-w-sm">
        <Card className="space-y-6 rounded-sm border border-[#2a2a2a] bg-[#111111] p-8 shadow-none">
          <CardHeader className="space-y-4 p-0">
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-sm text-white">
                SecretTunnel
                <span className="animate-pulse">_</span>
              </p>
              <div className="inline-flex items-center gap-2 border border-[#2a2a2a] px-2 py-1 font-mono text-xs uppercase tracking-widest text-[#888888]">
                <Sparkles className="size-3.5 text-white" />
                Signup
              </div>
            </div>

            <div>
              <CardTitle className="font-mono text-xl tracking-tight text-white">Create your account</CardTitle>
              <CardDescription className="mt-2 font-sans text-xs text-[#666666]">
                Start secure tunneling with a modern authentication flow backed by your database.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-5 p-0">
            <div className="space-y-3 border border-[#2a2a2a] bg-[#0a0a0a] p-4 rounded-sm">
              <div className="flex items-start gap-3">
                <UserRoundPlus className="mt-0.5 size-4 shrink-0 text-white" />
                <div>
                  <p className="font-mono text-xs uppercase tracking-widest text-[#888888]">Quick onboarding</p>
                  <p className="mt-1 font-sans text-xs leading-relaxed text-[#666666]">
                    Create your identity in under a minute and enter the protected dashboard.
                  </p>
                </div>
              </div>
              <div className="h-px bg-[#2a2a2a]" />
              <div className="flex items-start gap-3">
                <KeyRound className="mt-0.5 size-4 shrink-0 text-white" />
                <div>
                  <p className="font-mono text-xs uppercase tracking-widest text-[#888888]">Strong validation</p>
                  <p className="mt-1 font-sans text-xs leading-relaxed text-[#666666]">
                    Zod and React Hook Form enforce clean, reliable form inputs.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <SignUpForm />
              <Link
                className="block text-center font-mono text-xs text-[#444444] transition-colors hover:text-white"
                href="/"
              >
                Back to landing page
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}