"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type NavbarProps = {
  isLoggedIn?: boolean;
};

export function Navbar({ isLoggedIn = false }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        scrolled
          ? "bg-[#131314]/80 backdrop-blur-md border-b border-white/[0.05]"
          : "bg-transparent border-b border-white/0"
      )}
    >
      <nav className="flex justify-between items-center max-w-7xl mx-auto px-6 h-16">
        <div className="font-headline text-xl font-bold tracking-tight text-on-surface">
          <span className="text-primary">{"//"}</span> SecretTunnel
        </div>
        <div className="flex items-center gap-4">
          {!isLoggedIn ? (
            <Link
              href="/signin"
              className="text-sm text-on-surface-variant hover:text-on-surface transition-colors duration-200"
            >
              Sign In
            </Link>
          ) : null}
          <Link
            href={isLoggedIn ? "/dashboard" : "/share"}
            className="hidden md:flex cta-glow text-surface font-semibold px-5 py-2 text-sm rounded-md transition-all duration-200"
          >
            {isLoggedIn ? "Dashboard" : "Share a Secret"}
          </Link>
        </div>
      </nav>
    </header>
  );
}
