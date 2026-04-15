"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";
import type { Session } from "next-auth";
import { Lock, Settings, ShieldCheck, SquareActivity } from "lucide-react";

import { AuditTable } from "@/components/AuditTable";
import { SecretForm } from "@/components/SecretForm";
import { VersionedSecretsSection } from "@/components/VersionedSecretsSection";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type DashboardTab = "secrets" | "vaults" | "settings";

type DashboardClientProps = {
  user: Session["user"];
};

const tabs: Array<{
  id: DashboardTab;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  {
    id: "secrets",
    label: "Secrets",
    description: "Burn-after-read links and access logs",
    icon: ShieldCheck,
  },
  {
    id: "vaults",
    label: "Versioned Secret Groups",
    description: "Encrypted history and rotation",
    icon: SquareActivity,
  },
  {
    id: "settings",
    label: "Settings",
    description: "Your account and workspace details",
    icon: Settings,
  },
];

export function DashboardClient({ user }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>("secrets");
  const [isNewSecretOpen, setIsNewSecretOpen] = useState(false);
  const [auditRefreshKey, setAuditRefreshKey] = useState(0);

  useEffect(() => {
    const requestedTab = new URLSearchParams(window.location.search).get("tab");

    if (requestedTab === "secrets" || requestedTab === "vaults" || requestedTab === "settings") {
      setActiveTab(requestedTab);
    }
  }, []);

  const activeTabDetails = useMemo(
    () => tabs.find((tab) => tab.id === activeTab) ?? tabs[0]!,
    [activeTab]
  );

  const handleSheetOpenChange = (open: boolean) => {
    setIsNewSecretOpen(open);

    if (!open) {
      setAuditRefreshKey((current) => current + 1);
    }
  };

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8 pb-24 sm:py-10">
      <div className="mb-8 flex flex-col gap-6">
        <div>
          <div>
            <p className="mb-2 font-mono text-[12px] uppercase tracking-wider text-[#d4a84b]">
              Dashboard
            </p>
            <h1 className="font-sans text-[26px] font-medium tracking-tight text-[#f0ece4] sm:text-[32px]">
              Your encrypted workspace
            </h1>
            <p className="mt-2 max-w-2xl font-sans text-[14px] leading-6 text-[#8a8a8a]">
              Create one-time links, review access logs, and manage versioned secret groups without exposing plaintext to the server.
            </p>
          </div>
        </div>

        <div className="grid gap-2 rounded-md border border-[#2a2a2a] bg-[#0c0c0c] p-1 sm:grid-cols-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const selected = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex min-h-16 items-center gap-3 rounded-md px-3 py-3 text-left transition-colors ${
                  selected
                    ? "bg-[#1f1f1f] text-[#f0ece4]"
                    : "text-[#8a8a8a] hover:bg-[#161616] hover:text-[#f0ece4]"
                }`}
              >
                <Icon className={`size-4 shrink-0 ${selected ? "text-[#d4a84b]" : "text-[#4a4a4a]"}`} />
                <span className="min-w-0">
                  <span className="block font-sans text-[14px] font-medium">{tab.label}</span>
                  <span className="mt-0.5 block font-sans text-[12px] leading-5 text-[#8a8a8a]">
                    {tab.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {activeTab !== "vaults" ? (
        <div className="mb-6 flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h2 className="font-sans text-[20px] font-medium tracking-tight text-[#f0ece4]">
              {activeTabDetails.label}
            </h2>
            <p className="mt-1 font-sans text-[13px] text-[#8a8a8a]">
              {activeTabDetails.description}
            </p>
          </div>
          {activeTab === "secrets" ? (
            <button
              type="button"
              onClick={() => setIsNewSecretOpen(true)}
              className="inline-flex h-10 w-full shrink-0 items-center justify-center rounded-md bg-[#d4a84b] px-4 font-sans text-[14px] font-semibold text-[#0c0c0c] transition-colors hover:bg-[#e8bf6a] disabled:opacity-50 sm:w-auto"
            >
              + New Secret
            </button>
          ) : null}
        </div>
      ) : null}

      {activeTab === "secrets" ? (
        <AuditTable key={auditRefreshKey} onCreateSecret={() => setIsNewSecretOpen(true)} />
      ) : null}

      {activeTab === "vaults" ? <VersionedSecretsSection /> : null}

      {activeTab === "settings" ? <AccountSettings user={user} /> : null}

      <Sheet open={isNewSecretOpen} onOpenChange={handleSheetOpenChange}>
        <SheetContent
          side="right"
          className="w-full overflow-y-auto border-[#2a2a2a] bg-[#0c0c0c] p-0 text-[#f0ece4] sm:max-w-[680px]"
        >
          <SheetHeader className="border-b border-[#2a2a2a] px-6 py-5">
            <SheetTitle className="font-sans text-[18px] font-medium text-[#f0ece4]">
              New Secret
            </SheetTitle>
            <SheetDescription className="font-sans text-[13px] text-[#8a8a8a]">
              The key stays in the URL fragment. The server stores ciphertext only.
            </SheetDescription>
          </SheetHeader>

          <div className="px-6 py-6">
            <SecretForm />
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
}

function AccountSettings({ user }: DashboardClientProps) {
  const displayName = user.name ?? "SecretTunnel user";
  const displayEmail = user.email ?? "No email on file";

  return (
    <div id="account-settings" className="rounded-md border border-[#2a2a2a] bg-[#161616]">
      <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-[#2a2a2a] bg-[#0c0c0c] text-[#d4a84b]">
            <Lock className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-sans text-[16px] font-medium text-[#f0ece4]">
              {displayName}
            </p>
            <p className="truncate font-mono text-[13px] text-[#8a8a8a]">
              {displayEmail}
            </p>
          </div>
        </div>

        <div className="rounded-md border border-[#2a2a2a] bg-[#0c0c0c] px-3 py-2 font-mono text-[12px] text-[#8a8a8a]">
          Zero-knowledge workspace
        </div>
      </div>
      <div className="border-t border-[#2a2a2a] px-6 py-4">
        <p className="font-sans text-[13px] leading-6 text-[#8a8a8a]">
          Account settings are intentionally light here: your secrets are encrypted in the browser, and recovery depends on keeping your generated links safe.
        </p>
      </div>
    </div>
  );
}
