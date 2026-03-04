import Link from "next/link";
import { redirect } from "next/navigation";
import { Activity, Mail, UserRound } from "lucide-react";

import { SignOutButton } from "@/components/auth/sign-out-button";
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

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5]">
      <div className="flex min-h-screen">
        <aside className="flex min-h-screen w-60 flex-col border-r border-[#2a2a2a] bg-[#0a0a0a]">
          <div className="border-b border-[#2a2a2a] p-6">
            <p className="font-mono text-sm text-white">
              SecretTunnel
              <span className="animate-pulse">_</span>
            </p>
          </div>

          <nav className="flex flex-1 flex-col p-4">
            <Link
              className="border-l-2 border-white bg-[#1a1a1a] px-3 py-3 font-mono text-xs uppercase tracking-wider text-white"
              href="/dashboard"
            >
              Dashboard
            </Link>
            <Link
              className="mt-1 px-3 py-3 font-mono text-xs uppercase tracking-wider text-[#666666] transition-colors hover:bg-[#111111] hover:text-white"
              href="/"
            >
              Landing page
            </Link>
          </nav>

          <div className="border-t border-[#2a2a2a] p-4">
            <div className="rounded-sm border border-[#2a2a2a] bg-[#111111] p-3">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-sm border border-[#2a2a2a] bg-[#0a0a0a]">
                  <UserRound className="size-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-mono text-xs text-white">{session.user.name ?? "No name set"}</p>
                  <p className="mt-1 truncate font-mono text-xs text-[#444444]">
                    {session.user.email ?? "No email set"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 **:data-[slot=button]:w-full **:data-[slot=button]:rounded-sm **:data-[slot=button]:border **:data-[slot=button]:border-[#2a2a2a] **:data-[slot=button]:bg-transparent **:data-[slot=button]:font-mono **:data-[slot=button]:text-xs **:data-[slot=button]:uppercase **:data-[slot=button]:tracking-widest **:data-[slot=button]:text-[#f5f5f5] **:data-[slot=button]:hover:border-white/30 **:data-[slot=button]:hover:bg-[#1a1a1a]">
              <SignOutButton />
            </div>
          </div>
        </aside>

        <section className="flex-1 overflow-y-auto bg-[#0a0a0a] p-8">
          <div className="mb-8 flex flex-col gap-3 border-b border-[#2a2a2a] pb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-[#666666]">Dashboard</p>
              <h1 className="mt-2 font-mono text-sm text-white">
                Welcome, {session.user.name ?? "No name set"}
              </h1>
            </div>
            <p className="font-mono text-xs text-[#444444]">Authenticated session summary</p>
          </div>

          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            <Card className="rounded-sm border border-[#2a2a2a] bg-[#111111] py-0 ring-0">
              <CardHeader className="gap-2 border-b border-[#2a2a2a] px-4 py-4 rounded-none">
                <CardDescription className="font-mono text-xs uppercase tracking-wider text-[#444444]">
                  Session
                </CardDescription>
                <CardTitle className="font-mono text-2xl text-white">01</CardTitle>
              </CardHeader>
              <CardContent className="px-4 py-4">
                <p className="font-mono text-xs text-green-400">Authenticated</p>
              </CardContent>
            </Card>

            <Card className="rounded-sm border border-[#2a2a2a] bg-[#111111] py-0 ring-0">
              <CardHeader className="gap-2 border-b border-[#2a2a2a] px-4 py-4 rounded-none">
                <CardDescription className="font-mono text-xs uppercase tracking-wider text-[#444444]">
                  Profile
                </CardDescription>
                <CardTitle className="font-mono text-xl text-white">{session.user.name ?? "No name set"}</CardTitle>
              </CardHeader>
              <CardContent className="px-4 py-4">
                <p className="font-mono text-xs text-yellow-400">Identity loaded</p>
              </CardContent>
            </Card>

            <Card className="rounded-sm border border-[#2a2a2a] bg-[#111111] py-0 ring-0">
              <CardHeader className="gap-2 border-b border-[#2a2a2a] px-4 py-4 rounded-none">
                <CardDescription className="font-mono text-xs uppercase tracking-wider text-[#444444]">
                  Email
                </CardDescription>
                <CardTitle className="font-mono text-sm text-white">{session.user.email ?? "No email set"}</CardTitle>
              </CardHeader>
              <CardContent className="px-4 py-4">
                <p className="font-mono text-xs text-green-400">Linked account</p>
              </CardContent>
            </Card>

            <Card className="rounded-sm border border-[#2a2a2a] bg-[#111111] py-0 ring-0">
              <CardHeader className="gap-2 border-b border-[#2a2a2a] px-4 py-4 rounded-none">
                <CardDescription className="font-mono text-xs uppercase tracking-wider text-[#444444]">
                  Access
                </CardDescription>
                <CardTitle className="font-mono text-2xl text-white">LIVE</CardTitle>
              </CardHeader>
              <CardContent className="px-4 py-4">
                <p className="font-mono text-xs text-green-400">Protected route enabled</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <section className="overflow-hidden rounded-sm border border-[#2a2a2a] bg-[#111111]">
              <div className="flex items-center justify-between border-b border-[#2a2a2a] bg-[#0a0a0a] px-4 py-3">
                <div>
                  <p className="font-mono text-xs uppercase tracking-wider text-[#444444]">Account matrix</p>
                  <p className="mt-1 font-mono text-xs text-white">Current authenticated details</p>
                </div>
                <Activity className="size-4 text-green-400" />
              </div>

              <div className="bg-[#0a0a0a] border-b border-[#2a2a2a]">
                <div className="grid grid-cols-[140px_1fr]">
                  <div className="px-4 py-3 font-mono text-xs uppercase tracking-wider text-[#444444]">Field</div>
                  <div className="px-4 py-3 font-mono text-xs uppercase tracking-wider text-[#444444]">Value</div>
                </div>
              </div>

              <div className="divide-y divide-[#1a1a1a]">
                <div className="grid grid-cols-[140px_1fr] border-b border-[#1a1a1a] transition-colors hover:bg-[#111111]">
                  <div className="px-4 py-3 font-mono text-xs text-[#f5f5f5]">Profile</div>
                  <div className="px-4 py-3 font-mono text-xs text-[#f5f5f5]">{session.user.name ?? "No name set"}</div>
                </div>
                <div className="grid grid-cols-[140px_1fr] border-b border-[#1a1a1a] transition-colors hover:bg-[#111111]">
                  <div className="px-4 py-3 font-mono text-xs text-[#f5f5f5]">Email</div>
                  <div className="px-4 py-3 font-mono text-xs text-[#f5f5f5]">{session.user.email ?? "No email set"}</div>
                </div>
                <div className="grid grid-cols-[140px_1fr] border-b border-[#1a1a1a] transition-colors hover:bg-[#111111]">
                  <div className="px-4 py-3 font-mono text-xs text-[#f5f5f5]">Status</div>
                  <div className="px-4 py-3 font-mono text-xs text-green-400">Authenticated and ready</div>
                </div>
                <div className="grid grid-cols-[140px_1fr] transition-colors hover:bg-[#111111]">
                  <div className="px-4 py-3 font-mono text-xs text-[#f5f5f5]">Routing</div>
                  <div className="px-4 py-3 font-mono text-xs text-[#f5f5f5]">Protected dashboard access granted</div>
                </div>
              </div>
            </section>

            <div className="space-y-6">
              <Card className="rounded-sm border border-[#2a2a2a] bg-[#111111] py-0 ring-0">
                <CardHeader className="gap-3 border-b border-[#2a2a2a] px-4 py-4 rounded-none">
                  <div className="flex items-center gap-2">
                    <Mail className="size-4 text-white" />
                    <CardTitle className="font-mono text-sm text-white">Session status</CardTitle>
                  </div>
                  <CardDescription className="font-sans text-xs leading-relaxed text-[#666666]">
                    Your session is active. You can now access protected features in SecretTunnel.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 px-4 py-4">
                  <div className="rounded-sm border border-green-400/40 px-3 py-2 font-mono text-xs text-green-400">
                    LIVE CONNECTION
                  </div>
                  <div className="rounded-sm border border-[#2a2a2a] bg-[#0a0a0a] p-3">
                    <p className="font-mono text-xs uppercase tracking-wider text-[#444444]">Current user</p>
                    <p className="mt-2 font-mono text-xs text-white">{session.user.email ?? "No email set"}</p>
                  </div>
                </CardContent>
                <CardFooter className="border-t border-[#2a2a2a] bg-[#111111] p-4">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full rounded-sm border border-[#2a2a2a] bg-transparent font-mono text-xs uppercase tracking-widest text-[#f5f5f5] hover:border-white/30 hover:bg-[#1a1a1a]"
                  >
                    <Link href="/">Go to landing page</Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card className="rounded-sm border border-[#2a2a2a] bg-[#111111] py-0 ring-0">
                <CardHeader className="gap-2 border-b border-[#2a2a2a] px-4 py-4 rounded-none">
                  <CardTitle className="font-mono text-sm text-white">System notes</CardTitle>
                  <CardDescription className="font-sans text-xs text-[#666666]">
                    Active session metadata rendered from the current authenticated user.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 px-4 py-4">
                  <div className="flex items-center justify-between rounded-sm border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-3">
                    <span className="font-mono text-xs uppercase tracking-wider text-[#888888]">Profile loaded</span>
                    <span className="font-mono text-xs text-green-400">YES</span>
                  </div>
                  <div className="flex items-center justify-between rounded-sm border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-3">
                    <span className="font-mono text-xs uppercase tracking-wider text-[#888888]">Email linked</span>
                    <span className="font-mono text-xs text-green-400">YES</span>
                  </div>
                  <div className="flex items-center justify-between rounded-sm border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-3">
                    <span className="font-mono text-xs uppercase tracking-wider text-[#888888]">Route guard</span>
                    <span className="font-mono text-xs text-green-400">ACTIVE</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}