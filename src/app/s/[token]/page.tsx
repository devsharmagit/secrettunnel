import Link from "next/link";
import { Github, Sparkles } from "lucide-react";
import { SecretViewer } from "@/components/SecretViewer";

export default async function SecretPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const resolvedParams = await params;
  
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] selection:bg-white/20">
      <header className="sticky top-0 z-20 border-b border-[#2a2a2a] bg-[#0a0a0a]/80 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="size-4 text-white" />
            <p className="font-mono text-sm font-semibold tracking-tight text-white hover:text-gray-300 transition-colors">
              SecretTunnel<span className="animate-pulse opacity-50">_</span>
            </p>
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#666666] transition-colors hover:text-white"
              href="https://github.com/devsharma"
              target="_blank"
            >
              <Github className="size-4" />
              <span className="hidden sm:inline">GitHub</span>
            </Link>
          </nav>
        </div>
      </header>

      <section
        className="relative isolate flex flex-col justify-center min-h-[calc(100vh-73px)] overflow-hidden"
        style={{
          backgroundImage:
            "linear-gradient(#2a2a2a 1px, transparent 1px), linear-gradient(90deg, #2a2a2a 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03)_0%,transparent_80%)]" />

        <div className="relative mx-auto flex w-full max-w-2xl flex-col px-6 py-12">
          
          <div className="mb-8 text-center">
            <h1 className="font-mono text-2xl uppercase tracking-tight text-white md:text-3xl mb-4">
              Viewing Secure Payload
            </h1>
            <div className="font-mono text-xs text-[#666666] flex items-center justify-center gap-2">
              <span>ID: {resolvedParams.token}</span>
            </div>
          </div>

          <div className="mx-auto w-full">
            <SecretViewer token={resolvedParams.token} />
          </div>
          
        </div>
      </section>
    </main>
  );
}
