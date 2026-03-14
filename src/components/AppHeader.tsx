import { Github } from "lucide-react";
import type { Session } from "next-auth";
import Link from "next/link";

import { auth } from "@/lib/auth";

import { SignOutButton } from "./auth/sign-out-button";

type AppHeaderProps = {
  maxWidthClass?: string;
  session?: Session | null;
};

export async function AppHeader({ maxWidthClass = "max-w-[640px]", session }: AppHeaderProps) {
  const resolvedSession = session ?? (await auth());
  const user = resolvedSession?.user;

  return (
    <header className="flex h-13 items-center border-b border-[#2a2a2a] bg-[#0c0c0c]">
      <div className={`mx-auto w-full ${maxWidthClass} px-4 flex items-center justify-between`}>
        <Link
          href="/"
          className="font-sans font-semibold text-[15px] tracking-tight text-[#f0ece4] flex items-center gap-1.5 hover:opacity-80 transition-opacity"
        >
          <span className="text-[#d4a84b]">{"//"}</span> SecretTunnel
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            className="text-[#8a8a8a] transition-colors hover:text-[#d4a84b]"
            href="https://github.com/devsharma"
            target="_blank"
          >
            <Github className="size-4.5" />
          </Link>

          {user ? (
            <>
              <Link
                className="font-sans text-[13px] text-[#8a8a8a] transition-colors hover:text-[#d4a84b]"
                href="/dashboard"
              >
                Dashboard
              </Link>
              <span className="hidden sm:block font-sans text-[13px] text-[#8a8a8a]">
                {user.name ?? user.email ?? "User"}
              </span>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link
                className="font-sans text-[13px] text-[#8a8a8a] transition-colors hover:text-[#d4a84b]"
                href="/signin"
              >
                Sign in
              </Link>
              <Link
                className="font-sans text-[13px] text-[#8a8a8a] transition-colors hover:text-[#d4a84b]"
                href="/signup"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}