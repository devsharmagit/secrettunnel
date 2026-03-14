import Link from "next/link";
import { redirect } from "next/navigation";

import { AuditTable } from "@/components/AuditTable";
import { AppHeader } from "@/components/AppHeader";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin?callbackUrl=/dashboard");
  }

  return (
    <main className="min-h-screen">
      <AppHeader maxWidthClass="max-w-[960px]" session={session} />

      <section className="mx-auto w-full max-w-240 px-4 pt-12 pb-32">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="font-sans font-medium text-[20px] text-[#f0ece4] mb-1 tracking-tight">
              Your Secrets
            </h1>
            <p className="font-sans text-[13px] text-[#8a8a8a]">
              Secrets are end-to-end encrypted. Only you can see what you shared.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex h-9 shrink-0 items-center justify-center rounded-sm border border-[#d4a84b] px-4 font-sans text-[13px] font-medium text-[#d4a84b] transition-colors outline-none hover:bg-[#d4a84b] hover:text-[#0c0c0c]"
          >
            + New Secret
          </Link>
        </div>

        <div className="flex items-center border border-[#2a2a2a] rounded-sm mb-8 overflow-hidden">
          <div className="flex-1 px-6 py-5 bg-[#0c0c0c] border-r border-[#2a2a2a]">
            <p className="font-mono text-[24px] text-[#f0ece4] leading-none mb-2">34</p>
            <p className="font-sans text-[11px] tracking-wider uppercase text-[#8a8a8a]">Active Secrets</p>
          </div>
          <div className="flex-1 px-6 py-5 bg-[#0c0c0c] border-r border-[#2a2a2a]">
            <p className="font-mono text-[24px] text-[#f0ece4] leading-none mb-2">12</p>
            <p className="font-sans text-[11px] tracking-wider uppercase text-[#8a8a8a]">Viewed This Week</p>
          </div>
          <div className="flex-1 px-6 py-5 bg-[#0c0c0c]">
            <p className="font-mono text-[24px] text-[#f0ece4] leading-none mb-2">8</p>
            <p className="font-sans text-[11px] tracking-wider uppercase text-[#8a8a8a]">Burned</p>
          </div>
        </div>

        <AuditTable />
      </section>
    </main>
  );
}