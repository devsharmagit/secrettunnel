"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  {
    title: "Getting Started",
    items: [
      { label: "Introduction", href: "/docs" },
    ],
  },
  {
    title: "CLI Reference",
    items: [
      { label: "Overview", href: "/docs/cli" },
      { label: "secrettnl push", href: "/docs/cli#push" },
      { label: "secrettnl pull", href: "/docs/cli#pull" },
      { label: "Configuration", href: "/docs/cli#configuration" },
      { label: "Error Handling", href: "/docs/cli#errors" },
    ],
  },
];

function DocsSidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "w-64 flex-shrink-0 py-10 pl-6 pr-6 border-r border-white/[0.06]",
        className
      )}
    >
      <div className="sticky top-20">
        <div className="mb-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors duration-200 text-sm font-mono mb-6"
          >
            ← Back to home
          </Link>
          <Link href="/" className="inline-block font-headline text-sm font-bold tracking-tight text-on-surface hover:opacity-80 transition-opacity">
            <span className="text-primary">{"//"}</span> SecretTunnel
          </Link>
          <p className="text-[11px] font-mono text-outline uppercase tracking-widest mt-1">
            Documentation
          </p>
        </div>

        {navItems.map((section) => (
          <div key={section.title} className="mb-6">
            <p className="font-mono text-[10px] uppercase tracking-widest text-outline mb-3">
              {section.title}
            </p>
            <ul className="space-y-1">
              {section.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "block px-3 py-1.5 text-sm rounded-md transition-all duration-150",
                      pathname === item.href
                        ? "bg-primary/10 text-primary font-medium border border-primary/20"
                        : "text-on-surface-variant hover:text-on-surface hover:bg-white/[0.04]"
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="mt-8 p-3 rounded-lg border border-primary/15 bg-primary/5">
          <p className="text-xs text-on-surface-variant leading-relaxed">
            <span className="text-primary font-mono">$ npx secrettnl</span>
            <br />
            Zero-knowledge secret sharing from your terminal.
          </p>
        </div>
      </div>
    </aside>
  );
}

export function DocsLayout({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {/* Top navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-white/[0.06] bg-surface/80 backdrop-blur-md flex items-center px-6">
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
          <Link
            href="/"
            className="font-headline text-lg font-bold tracking-tight text-on-surface"
          >
            <span className="text-primary">{"//"}</span> SecretTunnel
          </Link>

          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/docs"
                className="text-sm text-primary font-medium px-3 py-1.5 rounded-md bg-primary/10 border border-primary/20"
              >
                Docs
              </Link>
              <Link
                href="/share"
                className="text-sm text-on-surface-variant hover:text-on-surface transition-colors px-3 py-1.5"
              >
                Share a Secret
              </Link>
            </nav>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="md:hidden text-on-surface-variant p-1"
              aria-label="Toggle nav"
            >
              <span className="material-symbols-outlined text-xl">
                {mobileNavOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile slide-in nav */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 pt-14 bg-surface md:hidden">
          <div className="p-6">
            <DocsSidebar className="w-full border-none" />
          </div>
        </div>
      )}

      {/* Main layout */}
      <div className="max-w-7xl mx-auto flex pt-14">
        <DocsSidebar className="hidden md:flex" />
        <main className="flex-1 min-w-0 px-6 md:px-10 py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
