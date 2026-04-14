"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

function HeroTerminal() {
  const command = "npx secrettnl push .env --ttl 24h";
  const [typedText, setTypedText] = useState("");
  const [showOutput, setShowOutput] = useState(false);
  const [visibleLines, setVisibleLines] = useState(0);
  const terminalRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setTypedText(command);
      setShowOutput(true);
      setVisibleLines(6);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          startTyping();
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (terminalRef.current) observer.observe(terminalRef.current);
    return () => observer.disconnect();
  }, []);

  function startTyping() {
    let i = 0;
    const timer = setInterval(() => {
      if (i < command.length) {
        setTypedText(command.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
        setTimeout(() => {
          setShowOutput(true);
          // Reveal output lines one by one
          let line = 0;
          const lineTimer = setInterval(() => {
            line++;
            setVisibleLines(line);
            if (line >= 6) clearInterval(lineTimer);
          }, 300);
        }, 400);
      }
    }, 45);
  }

  const outputLines = [
    { text: "Encrypting locally...", className: "text-outline", dot: true },
    { text: "✓ Secret created", className: "text-[#34d399]", dot: false },
    { text: "", className: "", dot: false }, // spacer
    { text: "Share URL:", className: "text-outline", dot: false },
    {
      text: "url",
      className: "",
      dot: false,
    },
    {
      text: "⚑ Burn-after-read · Expires in 24h",
      className: "text-outline text-xs",
      dot: false,
    },
  ];

  return (
    <div ref={terminalRef} className="w-full max-w-2xl mx-auto relative group">
      <div className="absolute -inset-1 bg-primary/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="relative bg-surface-container-lowest border border-white/[0.08] rounded-lg overflow-hidden terminal-shadow">
        {/* Terminal title bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-surface-container-lowest">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-primary/30" />
            <div className="w-3 h-3 rounded-full bg-primary/20" />
            <div className="w-3 h-3 rounded-full bg-primary/10" />
          </div>
          <span className="font-mono text-[11px] text-outline uppercase tracking-widest mx-auto pr-8">
            terminal
          </span>
        </div>

        {/* Terminal body */}
        <div className="p-6 font-mono text-sm leading-relaxed text-left min-h-[240px]">
          {/* Command line with typing effect */}
          <div className="flex items-center">
            <span className="text-outline mr-2">$</span>
            <span className="text-on-surface">
              {typedText}
              {typedText.length < command.length && (
                <span className="inline-block w-[2px] h-4 bg-primary ml-0.5 animate-pulse align-middle" />
              )}
            </span>
          </div>

          {/* Output */}
          {showOutput && (
            <div className="mt-4 space-y-1.5">
              {outputLines.map((line, i) => (
                <div
                  key={i}
                  className={cn(
                    "transition-all duration-300",
                    i < visibleLines
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-2"
                  )}
                >
                  {line.text === "" ? (
                    <div className="h-3" />
                  ) : line.text === "url" ? (
                    <div className="pl-2">
                      <span className="text-primary">
                        https://secrettunnel.app/s/x9k2m
                      </span>
                      <span className="text-outline/50">#key=aB3dK9...</span>
                    </div>
                  ) : (
                    <div className={cn("pl-2 flex items-center gap-2", line.className)}>
                      {line.text}
                      {line.dot && (
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-screen pt-24 pb-20 overflow-hidden px-6">
      {/* Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 hero-glow" />
      </div>

      <div className="relative z-10 max-w-4xl w-full flex flex-col items-center text-center">
        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-10 font-mono text-[13px] text-primary">
          🔐&nbsp; Zero-knowledge · AES-256-GCM · Burn after read
        </div>

        {/* Headline */}
        <h1 className="font-headline text-5xl sm:text-6xl md:text-7xl lg:text-[80px] font-bold tracking-tight leading-[1.0] text-on-surface mb-6">
          Share secrets.
          <br />
          Not exposure.
        </h1>

        {/* Subheadline */}
        <p className="text-lg text-outline max-w-[520px] mx-auto mb-14 leading-relaxed">
          Encrypted in your browser. Stored as ciphertext. Destroyed on read.
          <br />
          <span className="text-on-surface-variant">
            The server is provably blind.
          </span>
        </p>

        {/* Hero Terminal */}
        <HeroTerminal />

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12 w-full">
          <Link
            href="/dashboard"
            className="cta-glow text-surface font-semibold px-8 py-3.5 rounded-md text-[15px] transition-all duration-200 sm:w-auto w-full max-w-[260px] text-center"
          >
            Share a Secret →
          </Link>
          <Link
            href="https://github.com/devsharmagit/secrettunnel"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-transparent border border-white/[0.12] text-on-surface font-semibold px-8 py-3.5 rounded-md hover:bg-white/5 transition-all duration-200 text-[15px] flex items-center justify-center gap-2 sm:w-auto w-full max-w-[260px]"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
            View on GitHub
          </Link>
        </div>
      </div>
    </section>
  );
}
