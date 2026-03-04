import Link from "next/link";
import { redirect } from "next/navigation";
import { Github, ShieldCheck, Sparkles } from "lucide-react";

import { SignInForm } from "@/components/auth/sign-in-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";

export default async function SignInPage() {
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
                Login
              </div>
            </div>

            <div>
              <CardTitle className="font-mono text-xl tracking-tight text-white">Welcome back</CardTitle>
              <CardDescription className="mt-2 font-sans text-xs text-[#666666]">
                Continue with credentials or GitHub and jump into your protected workspace.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-5 p-0">
            <div className="space-y-3 border border-[#2a2a2a] bg-[#0a0a0a] p-4 rounded-sm">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-white" />
                <div>
                  <p className="font-mono text-xs uppercase tracking-widest text-[#888888]">Security first</p>
                  <p className="mt-1 font-sans text-xs leading-relaxed text-[#666666]">
                    Session-protected routes with server-side checks on every request.
                  </p>
                </div>
              </div>
              <div className="h-px bg-[#2a2a2a]" />
              <div className="flex items-start gap-3">
                <Github className="mt-0.5 size-4 shrink-0 text-white" />
                <div>
                  <p className="font-mono text-xs uppercase tracking-widest text-[#888888]">Provider support</p>
                  <p className="mt-1 font-sans text-xs leading-relaxed text-[#666666]">
                    Credentials and GitHub are both enabled and persisted in your database.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <SignInForm />

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