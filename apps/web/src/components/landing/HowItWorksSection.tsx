"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

const steps = [
  {
    number: "01",
    title: "You encrypt, locally",
    icon: "lock",
    description:
      "AES-256-GCM runs entirely in your browser using the Web Crypto API. The plaintext never leaves your device unencrypted.",
    visual: "code" as const,
  },
  {
    number: "02",
    title: "Key stays in URL fragment",
    icon: "link",
    description:
      'The decryption key is appended as a #fragment — which browsers never include in HTTP requests. The server receives zero key material.',
    visual: "url" as const,
  },
  {
    number: "03",
    title: "Server stores only ciphertext",
    icon: "database",
    description:
      "Redis holds { ciphertext, iv, ttl }. Nothing else. Even a full server breach leaks only encrypted bytes.",
    visual: "none" as const,
  },
  {
    number: "04",
    title: "Burn on read",
    icon: "local_fire_department",
    description:
      "The moment the recipient decrypts, the Redis key is atomically deleted. The link is dead. No replay, no second access.",
    visual: "none" as const,
  },
];

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeStep, setActiveStep] = useState(0);

  const setCardRef = useCallback((el: HTMLDivElement | null, index: number) => {
    cardRefs.current[index] = el;
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = cardRefs.current.indexOf(
              entry.target as HTMLDivElement
            );
            if (index !== -1) {
              setActiveStep(index);
            }
          }
        });
      },
      { threshold: 0.4, rootMargin: "-15% 0px -15% 0px" }
    );

    cardRefs.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);

  const progress = ((activeStep + 1) / steps.length) * 100;

  return (
    <section
      ref={sectionRef}
      className="py-16 bg-surface border-t border-white/[0.04]"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Mobile Section Header (Normal Flow) */}
        <div className="pb-12 lg:hidden">
          <p className="font-mono text-primary text-sm tracking-widest uppercase mb-4">
            {"// How it works"}
          </p>
          <h2 className="font-headline text-3xl sm:text-4xl font-bold text-on-surface tracking-tight">
            Four layers. Zero trust.
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 lg:gap-12">
          {/* Left — Sticky Progress (desktop only) */}
          <div className="hidden lg:block">
            <div className="sticky top-[calc(64px+2rem)]">
              {/* Heading — now sticky */}
              <div className="mb-8">
                <p className="font-mono text-primary text-sm tracking-widest uppercase mb-3">
                  {"// How it works"}
                </p>
                <h2 className="font-headline text-3xl font-bold text-on-surface tracking-tight">
                  Four layers.<br />Zero trust.
                </h2>
              </div>

              <div className="relative pl-8">
                {/* Progress track */}
                <div className="absolute left-[11px] top-4 bottom-4 w-px bg-white/[0.08]" />
                {/* Progress fill */}
                <div
                  className="absolute left-[11px] top-4 w-px bg-primary transition-all duration-500 ease-out"
                  style={{ height: `${progress * 0.85}%` }}
                />

                {steps.map((step, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex items-center gap-4 py-8 transition-all duration-300",
                      i === activeStep ? "opacity-100" : "opacity-40"
                    )}
                  >
                    <div
                      className={cn(
                        "relative z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-surface transition-all duration-300",
                        i <= activeStep
                          ? "border-primary"
                          : "border-white/[0.1]",
                        i < activeStep && "bg-primary"
                      )}
                    >
                      {i < activeStep && (
                        <svg
                          className="w-3 h-3 text-surface"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                      {i === activeStep && (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <span
                      className={cn(
                        "font-headline text-sm font-semibold transition-colors duration-300",
                        i === activeStep ? "text-on-surface" : "text-outline"
                      )}
                    >
                      {step.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Scrolling Cards */}
          <div className="space-y-8 lg:space-y-32">
            {steps.map((step, i) => (
              <div
                key={i}
                ref={(el) => setCardRef(el, i)}
                className="lg:min-h-[60vh] flex items-center"
              >
                <div
                  className={cn(
                    "w-full p-6 md:p-8 rounded-lg transition-all duration-500",
                    i === activeStep
                      ? "bg-[#201f20]/40"
                      : "bg-transparent opacity-60"
                  )}
                  style={{
                    maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(to bottom, black 60%, transparent 100%)"
                  }}
                >
                  {/* Mobile step number */}
                  <div className="lg:hidden flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <span className="text-primary font-mono text-xs font-bold">
                        {step.number}
                      </span>
                    </div>
                    <div className="h-px flex-1 bg-[#f6be39] opacity-30 w-full" />
                  </div>

                  <div className="flex items-start gap-3 mb-4">
                    <span className="material-symbols-outlined text-primary text-2xl mt-0.5">
                      {step.icon}
                    </span>
                    <h3 className="font-headline text-xl font-bold text-on-surface">
                      {step.title}
                    </h3>
                  </div>

                  <p className="text-on-surface-variant text-base leading-relaxed mb-6 max-w-xl">
                    {step.description}
                  </p>

                  {/* Step-specific visuals */}
                  {step.visual === "code" && (
                    <div className="bg-surface-container-lowest rounded border border-white/[0.06] p-4 font-mono text-sm overflow-x-auto">
                      <span className="text-outline">await</span>{" "}
                      <span className="text-primary">
                        crypto.subtle.encrypt
                      </span>
                      <span className="text-on-surface-variant">(</span>
                      <br />
                      <span className="text-on-surface-variant pl-4">
                        {"{"} name:{" "}
                      </span>
                      <span className="text-secondary">
                        &quot;AES-GCM&quot;
                      </span>
                      <span className="text-on-surface-variant">
                        , iv {"}"}, key, data
                      </span>
                      <br />
                      <span className="text-on-surface-variant">)</span>
                    </div>
                  )}

                  {step.visual === "url" && (
                    <div className="bg-surface-container-lowest rounded border border-white/[0.06] p-4 font-mono text-sm space-y-3 overflow-x-auto">
                      <div className="flex flex-wrap items-center">
                        <span className="text-on-surface">
                          https://secrettunnel.app/s/token
                        </span>
                        <span className="text-primary ml-1">
                          #key=aB3dK9...
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center text-xs">
                        <span className="text-outline">
                          [─── sent to server ───────────]
                        </span>
                        <span className="text-primary/60 ml-1">
                          [─ never sent ─]
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
