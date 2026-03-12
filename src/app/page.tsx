import Link from "next/link";
import { Github } from "lucide-react";
import { SecretForm } from "@/components/SecretForm";

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="h-[52px] border-b border-[#2a2a2a] bg-[#0c0c0c] flex items-center">
        <div className="mx-auto w-full max-w-[640px] px-4 flex items-center justify-between">
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
            <Link
              className="font-sans text-[13px] text-[#8a8a8a] transition-colors hover:text-[#d4a84b]"
              href="/signin"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto w-full max-w-[640px] px-4 py-20 pb-32">
        <SecretForm />
      </section>
    </main>
  );
}