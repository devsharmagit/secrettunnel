import Link from "next/link";
import { Github } from "lucide-react";
import { AuditTable } from "@/components/AuditTable";

export default function DashboardPage() {
  return (
    <main className="min-h-screen">
      <header className="h-[52px] border-b border-[#2a2a2a] bg-[#0c0c0c] flex items-center">
        <div className="mx-auto w-full max-w-[960px] px-4 flex items-center justify-between">
          <Link href="/" className="font-sans font-semibold text-[15px] tracking-tight text-[#f0ece4] flex items-center gap-1.5 hover:opacity-80 transition-opacity">
            <span className="text-[#d4a84b]">{"//"}</span> SecretTunnel
          </Link>
          <nav className="flex items-center gap-5">
            <Link
              className="text-[#8a8a8a] transition-colors hover:text-[#d4a84b]"
              href="https://github.com/devsharma"
              target="_blank"
            >
              <Github className="size-[18px]" />
            </Link>
            <div className="font-sans text-[13px] text-[#8a8a8a]">
              devsharma
            </div>
          </nav>
        </div>
      </header>

      <section className="mx-auto w-full max-w-[960px] px-4 pt-12 pb-32">
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
            className="inline-flex items-center justify-center h-[36px] px-4 border border-[#d4a84b] text-[#d4a84b] rounded-sm font-sans font-medium text-[13px] hover:bg-[#d4a84b] hover:text-[#0c0c0c] transition-colors outline-none shrink-0"
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