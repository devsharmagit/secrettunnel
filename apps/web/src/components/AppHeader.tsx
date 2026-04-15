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
  const displayName = user?.name ?? "SecretTunnel user";
  const displayEmail = user?.email ?? "No email on file";
  const initials = getInitials(user?.name, user?.email);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center border-b border-[#2a2a2a] bg-[#0c0c0c]/95 backdrop-blur">
      <div className={`mx-auto flex w-full ${maxWidthClass} items-center justify-between px-4`}>
        <Link
          href="/"
          className="flex items-center gap-1.5 font-sans text-[15px] font-semibold tracking-tight text-[#f0ece4] transition-opacity hover:opacity-80"
        >
          <span className="text-[#d4a84b]">{"//"}</span> SecretTunnel
        </Link>
        <nav className="flex items-center gap-3">
          <Link
            className="text-[#8a8a8a] transition-colors hover:text-[#d4a84b]"
            href="https://github.com/devsharmagit"
            target="_blank"
            aria-label="SecretTunnel on GitHub"
          >
            <Github className="size-4.5" />
          </Link>

          {user ? (
            <div className="group relative">
              <button
                type="button"
                className="flex size-9 items-center justify-center overflow-hidden rounded-full border border-[#2a2a2a] bg-[#161616] font-mono text-[13px] font-semibold text-[#d4a84b] outline-none transition-colors hover:border-[#d4a84b] focus-visible:border-[#d4a84b]"
                aria-label="Open account menu"
              >
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.image}
                    alt=""
                    className="size-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  initials
                )}
              </button>

              <div className="invisible absolute right-0 top-full w-72 translate-y-1 pt-2 opacity-0 transition-all duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                <div className="rounded-md border border-[#2a2a2a] bg-[#0f0f10] p-4 shadow-2xl shadow-black/40">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#2a2a2a] bg-[#161616] font-mono text-[13px] font-semibold text-[#d4a84b]">
                      {user.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={user.image}
                          alt=""
                          className="size-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        initials
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-sans text-[14px] font-medium text-[#f0ece4]">
                        {displayName}
                      </p>
                      <p className="truncate font-mono text-[12px] text-[#8a8a8a]">
                        {displayEmail}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href="/dashboard?tab=settings"
                      className="inline-flex h-8 flex-1 items-center justify-center rounded-md border border-[#2a2a2a] bg-[#161616] px-3 font-sans text-[13px] font-medium text-[#f0ece4] transition-colors hover:border-[#d4a84b] hover:text-[#d4a84b]"
                    >
                      Account settings
                    </Link>
                    <SignOutButton className="h-8 rounded-md" />
                  </div>
                </div>
              </div>
            </div>
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

function getInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || "U";
  const parts = source.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}
