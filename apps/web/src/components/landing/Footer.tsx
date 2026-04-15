"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Footer() {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  return (
    <footer className="w-full py-10 bg-surface-container-lowest border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-10">
          {/* Logo column (spans 2 on large) */}
          <div className="space-y-5 lg:col-span-2 pr-8">
            <div className="font-headline text-lg font-bold tracking-tight text-on-surface">
              <span className="text-primary">{"//"}</span> SecretTunnel
            </div>
            <p className="text-outline text-sm leading-relaxed max-w-sm">
              Zero-knowledge secret sharing for developers. Encrypted in the
              browser. Destroyed on read. The server never sees your plaintext.
            </p>
            {/* Social Icons */}
            <div className="pt-2">
              <p className="text-xs text-[#9b8f7a] uppercase tracking-widest mb-2">
                Follow
              </p>
              <div className="flex gap-3 items-center text-[#9b8f7a]">
                <Link
                  href="https://github.com/devsharmagit/secrettunnel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#f6be39] transition-colors duration-200"
                >
                  <span className="sr-only">GitHub</span>
                  <svg
                    className="w-5 h-5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
                <Link
                  href="https://x.com/devsharmatwt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#f6be39] transition-colors duration-200"
                >
                  <span className="sr-only">X</span>
                  <svg
                    className="w-5 h-5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </Link>
              </div>
            </div>
            
          </div>

          {/* Product links */}
          <div className="border-t border-white/[0.04] md:border-transparent pt-4 md:pt-0">
            <button
              onClick={() => toggleSection("product")}
              className="w-full flex items-center justify-between md:cursor-auto"
            >
              <h4 className="uppercase text-xs tracking-widest text-[#9b8f7a] mb-0 md:mb-4">
                Product
              </h4>
              <span className="md:hidden text-[#9b8f7a] font-mono transition-colors group-hover:text-[#f6be39]">
                 {openSection === "product" ? "−" : "+"}
              </span>
            </button>
            <div
              className={cn(
                "overflow-hidden transition-all duration-300 md:max-h-none",
                openSection === "product" ? "max-h-40 mt-4" : "max-h-0 md:mt-0"
              )}
            >
              <ul className="space-y-2.5">
                <li>
                  <Link
                    href="#features"
                    className="text-sm font-medium text-[#d3c5ae] hover:text-[#f6be39] transition-colors duration-200"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#security"
                    className="text-sm font-medium text-[#d3c5ae] hover:text-[#f6be39] transition-colors duration-200"
                  >
                    Security
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm font-medium text-[#d3c5ae] hover:text-[#f6be39] transition-colors duration-200"
                  >
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Resources links */}
          <div className="border-t border-white/[0.04] md:border-transparent pt-4 md:pt-0">
            <button
              onClick={() => toggleSection("resources")}
              className="w-full flex items-center justify-between md:cursor-auto"
            >
              <h4 className="uppercase text-xs tracking-widest text-[#9b8f7a] mb-0 md:mb-4">
                Resources
              </h4>
               <span className="md:hidden text-[#9b8f7a] font-mono transition-colors group-hover:text-[#f6be39]">
                 {openSection === "resources" ? "−" : "+"}
              </span>
            </button>
            <div
              className={cn(
                "overflow-hidden transition-all duration-300 md:max-h-none",
                openSection === "resources" ? "max-h-40 mt-4" : "max-h-0 md:mt-0"
              )}
            >
              <ul className="space-y-2.5">
                <li>
                  <Link
                    href="/docs"
                    className="text-sm font-medium text-[#d3c5ae] hover:text-[#f6be39] transition-colors duration-200"
                  >
                    Docs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/docs/cli"
                    className="text-sm font-medium text-[#d3c5ae] hover:text-[#f6be39] transition-colors duration-200"
                  >
                    CLI Reference
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm font-medium text-[#d3c5ae] hover:text-[#f6be39] transition-colors duration-200"
                  >
                    Support
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-6 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-mono text-xs uppercase tracking-widest text-[#9b8f7a]">
            © {new Date().getFullYear()} SecretTunnel
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#9b8f7a] font-mono border border-white/10 px-2 py-0.5 rounded">
              MIT License
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
