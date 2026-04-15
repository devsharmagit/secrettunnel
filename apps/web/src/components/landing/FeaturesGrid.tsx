"use client";

import { cn } from "@/lib/utils";
import { useInView } from "@/hooks/useInView";

const features = [
  {
    icon: "password",
    title: "Password Protection",
    description:
      "Add a PBKDF2-derived second encryption layer. Even with the link, wrong password = no access.",
  },
  {
    icon: "timer",
    title: "Configurable TTL",
    description:
      "Set expiry from 30s to 7d. Redis auto-deletes. 1h, 24h, 7d or raw seconds.",
  },
  {
    icon: "webhook",
    title: "Webhook on View",
    description:
      "Attach a webhook URL. Get an HTTP POST the moment your secret is accessed. Powered by QStash.",
  },
  {
    icon: "history",
    title: "Versioned Secrets",
    description:
      "Group secrets into named vaults with version history. Diff any two versions.",
  },
  {
    icon: "shield_person",
    title: "Audit Trail",
    description:
      "View timestamp and viewer IP logged per access. Stored in Redis, separated from the secret.",
  },
  {
    icon: "passkey",
    title: "GitHub OAuth",
    description:
      "Sign in to manage your secret history, audit logs, and versioned vaults from the dashboard.",
  },
];

export function FeaturesGrid() {
  const { ref, isInView } = useInView();

  return (
    <section className="py-24 md:py-32 bg-surface border-t border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div
          ref={ref}
          className={cn(
            "mb-16 md:mb-20 transition-all duration-700",
            isInView
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-6"
          )}
        >
          <p className="font-mono text-primary text-sm tracking-widest uppercase mb-4">
            {"// Features"}
          </p>
          <h2 className="font-headline text-3xl sm:text-4xl md:text-5xl font-bold text-on-surface tracking-tight">
            Everything you need.
            <br />
            <span className="text-outline">Nothing you don&apos;t.</span>
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <FeatureCard key={i} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[0];
  index: number;
}) {
  const { ref, isInView } = useInView();

  return (
    <div
      ref={ref}
      className={cn(
        "feature-card bg-surface-container border border-white/[0.06] rounded-lg p-6 transition-all duration-500",
        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      )}
      style={{ transitionDelay: isInView ? `${index * 80}ms` : "0ms" }}
    >
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 border border-primary/15">
        <span className="material-symbols-outlined text-primary text-xl">
          {feature.icon}
        </span>
      </div>
      <h3 className="font-headline text-base font-semibold text-on-surface mb-2">
        {feature.title}
      </h3>
      <p className="text-on-surface-variant text-sm leading-relaxed">
        {feature.description}
      </p>
    </div>
  );
}
