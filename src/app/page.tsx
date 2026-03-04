import Link from "next/link";
import { ArrowRight, KeyRound, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();
  const isSignedIn = Boolean(session?.user);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5]">
      <header className="sticky top-0 z-20 border-b border-[#2a2a2a] bg-[#0a0a0a]/80 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <p className="font-mono text-sm text-white">
            SecretTunnel
            <span className="animate-pulse">_</span>
          </p>
          <nav className="flex items-center gap-4">
            <Link
              className="font-mono text-xs uppercase tracking-widest text-[#666666] transition-colors hover:text-white"
              href={isSignedIn ? "/dashboard" : "/signin"}
            >
              {isSignedIn ? "Dashboard" : "Sign in"}
            </Link>
            {!isSignedIn ? (
              <Link
                className="font-mono text-xs uppercase tracking-widest text-[#666666] transition-colors hover:text-white"
                href="/signup"
              >
                Sign up
              </Link>
            ) : null}
          </nav>
        </div>
      </header>

      <section
        className="relative isolate flex min-h-screen flex-col overflow-hidden"
        style={{
          backgroundImage:
            "linear-gradient(#2a2a2a 1px, transparent 1px), linear-gradient(90deg, #2a2a2a 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.04)_0%,transparent_70%)]" />

        <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col px-6">
          <div className="flex min-h-[calc(100vh-73px)] flex-col items-center justify-center py-16 text-center">
            <div className="mb-8 inline-flex items-center gap-2 border border-[#2a2a2a] bg-[#111111] px-4 py-2 font-mono text-xs uppercase tracking-widest text-[#888888]">
              <Sparkles className="size-4 text-white" />
              Hardened access layer
            </div>

            <h1 className="max-w-5xl font-mono text-5xl uppercase tracking-tight text-white md:text-7xl">
              Ship local endpoints through a locked-down terminal-grade gateway.
            </h1>

            <p className="mx-auto mt-6 max-w-md font-sans text-sm leading-relaxed text-[#666666] md:text-base">
              Move from sign-up to protected dashboard in minutes with credentials and GitHub
              sign-in powered by your existing data layer.
            </p>

            <p className="mt-8 border border-[#2a2a2a] bg-[#111111] px-4 py-3 font-sans text-sm text-[#666666]">
              {isSignedIn
                ? `Signed in as ${session?.user?.email ?? "user"}.`
                : "You are currently signed out. Create an account or sign in to continue."}
            </p>

            <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row">
              {isSignedIn ? (
                <Button
                  asChild
                  className="w-full rounded-sm bg-white font-mono text-xs uppercase tracking-widest text-black hover:bg-gray-200"
                >
                  <Link href="/dashboard">Open dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button
                    asChild
                    className="w-full rounded-sm bg-white font-mono text-xs uppercase tracking-widest text-black hover:bg-gray-200"
                  >
                    <Link href="/signup">Create account</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full rounded-sm border border-[#2a2a2a] bg-transparent font-mono text-xs uppercase tracking-widest text-[#f5f5f5] hover:border-white/30 hover:bg-[#1a1a1a]"
                  >
                    <Link href="/signin">Sign in</Link>
                  </Button>
                </>
              )}
            </div>

            <div className="mt-12 grid w-full max-w-3xl gap-4 md:grid-cols-3">
              <article className="border border-[#2a2a2a] bg-[#111111] p-6 rounded-sm text-left">
                <p className="font-mono text-xs uppercase tracking-widest text-[#444444]">Session layer</p>
                <p className="mt-2 font-mono text-3xl text-white">JWT</p>
              </article>
              <article className="border border-[#2a2a2a] bg-[#111111] p-6 rounded-sm text-left">
                <p className="font-mono text-xs uppercase tracking-widest text-[#444444]">Providers</p>
                <p className="mt-2 font-mono text-3xl text-white">2</p>
              </article>
              <article className="border border-[#2a2a2a] bg-[#111111] p-6 rounded-sm text-left">
                <p className="font-mono text-xs uppercase tracking-widest text-[#444444]">Account state</p>
                <p className="mt-2 font-mono text-3xl text-white">DB</p>
              </article>
            </div>
          </div>

          <div className="pb-16">
            <p className="mb-2 font-mono text-xs uppercase tracking-widest text-[#666666]">Core features</p>
            <div className="mb-12 h-px bg-[#2a2a2a]" />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card className="rounded-sm border border-[#2a2a2a] bg-[#111111] p-6 shadow-none">
                <CardHeader className="space-y-4 p-0">
                  <KeyRound className="h-4 w-4 text-white" />
                  <div>
                    <CardTitle className="font-mono text-sm text-white">Credentials flow</CardTitle>
                    <CardDescription className="mt-2 font-sans text-xs leading-relaxed text-[#666666]">
                      Validated forms with clear feedback and smooth transitions.
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>

              <Card className="rounded-sm border border-[#2a2a2a] bg-[#111111] p-6 shadow-none">
                <CardHeader className="space-y-4 p-0">
                  <ShieldCheck className="h-4 w-4 text-white" />
                  <div>
                    <CardTitle className="font-mono text-sm text-white">GitHub OAuth</CardTitle>
                    <CardDescription className="mt-2 font-sans text-xs leading-relaxed text-[#666666]">
                      Accounts are linked and saved, so returning users are seamless.
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>

              <Card className="rounded-sm border border-[#2a2a2a] bg-[#111111] p-6 shadow-none">
                <CardHeader className="space-y-4 p-0">
                  <LockKeyhole className="h-4 w-4 text-white" />
                  <div>
                    <CardTitle className="font-mono text-sm text-white">Route protection</CardTitle>
                    <CardDescription className="mt-2 font-sans text-xs leading-relaxed text-[#666666]">
                      Public and private pages are clearly separated and guarded.
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </div>

            <Card className="mt-4 rounded-sm border border-[#2a2a2a] bg-[#111111] p-0 shadow-none">
              <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-mono text-xs uppercase tracking-widest text-[#888888]">Ready state</p>
                  <p className="mt-2 font-sans text-sm leading-relaxed text-[#666666]">
                    Practical defaults for authenticated access without changing your existing
                    auth flow.
                  </p>
                </div>
                <Button
                  asChild
                  variant="ghost"
                  className="w-full rounded-sm border border-[#2a2a2a] font-mono text-xs uppercase tracking-widest text-[#666666] hover:bg-[#1a1a1a] hover:text-white md:w-auto"
                >
                  <Link href={isSignedIn ? "/dashboard" : "/signin"}>
                    Explore flow
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </CardContent>
              <CardFooter className="hidden" />
            </Card>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#2a2a2a] bg-[#0a0a0a] py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 font-mono text-xs text-[#444444] sm:flex-row sm:items-center sm:justify-between">
          <p>SecretTunnel terminal interface</p>
          <p>{isSignedIn ? "Authenticated session detected" : "Awaiting authenticated session"}</p>
        </div>
      </footer>
    </main>
  );
}