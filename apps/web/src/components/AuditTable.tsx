"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Check, Flame, Lock } from "lucide-react";
import Link from "next/link";
import axios from "axios";

interface Secret {
  id: string;
  token: string;
  createdAt: string | null;
  expiresAt: string | null;
  status: "ACTIVE" | "VIEWED" | "BURNED" | "EXPIRED";
  webhookStatus: "pending" | "enqueued" | "delivered" | "failed" | null;
  viewedAt: string | null;
  burnedAt: string | null;
  expired: boolean;
}

interface AuditApiEntry {
  token: string;
  expired: boolean;
  createdAt: string | null;
  expiresAt: string | null;
  viewedAt: string | null;
  burnedAt: string | null;
  webhookStatus: "pending" | "enqueued" | "delivered" | "failed" | null;
}

interface AuditApiResponse {
  success: boolean;
  data: AuditApiEntry[];
  message?: string;
}

function deriveStatus(entry: AuditApiEntry): Secret["status"] {
  if (entry.burnedAt) return "BURNED";
  if (entry.viewedAt) return "VIEWED";
  if (entry.expired) return "EXPIRED";
  if (entry.expiresAt && new Date(entry.expiresAt).getTime() < Date.now()) return "EXPIRED";
  return "ACTIVE";
}

function toSecret(entry: AuditApiEntry): Secret {
  return {
    id: entry.token,
    token: entry.token,
    createdAt: entry.createdAt,
    expiresAt: entry.expiresAt,
    webhookStatus: entry.webhookStatus,
    viewedAt: entry.viewedAt,
    burnedAt: entry.burnedAt,
    expired: entry.expired,
    status: deriveStatus(entry),
  };
}

const getRelativeTime = (isoString: string) => {
  const diffInSeconds = (new Date(isoString).getTime() - Date.now()) / 1000;
  const absDiff = Math.abs(diffInSeconds);

  let val = 0;
  let unit = "";

  if (absDiff < 60) {
    val = Math.floor(absDiff);
    unit = "second";
  } else if (absDiff < 3600) {
    val = Math.floor(absDiff / 60);
    unit = "minute";
  } else if (absDiff < 86400) {
    val = Math.floor(absDiff / 3600);
    unit = "hour";
  } else {
    val = Math.floor(absDiff / 86400);
    unit = "day";
  }

  const plural = val === 1 ? "" : "s";
  
  if (diffInSeconds < 0) {
    return `${val} ${unit}${plural} ago`;
  } else {
    return `in ${val} ${unit}${plural}`;
  }
};

const getStatusStyles = (status: Secret["status"]) => {
  switch (status) {
    case "ACTIVE":
      return "border-[#4a7c59] text-[#4a7c59]";
    case "VIEWED":
      return "border-[#8a8a8a] text-[#8a8a8a]";
    case "BURNED":
      return "border-[#b33a3a] text-[#b33a3a]";
    case "EXPIRED":
      return "border-[#4a4a4a] text-[#4a4a4a]";
    default:
      return "border-[#4a4a4a] text-[#4a4a4a]";
  }
};

const getWebhookStatusStyles = (status: NonNullable<Secret["webhookStatus"]>) => {
  switch (status) {
    case "pending":
      return "border-[#8a8a8a] text-[#8a8a8a]";
    case "enqueued":
      return "border-[#d4a84b] text-[#d4a84b]";
    case "delivered":
      return "border-[#4a7c59] text-[#4a7c59]";
    case "failed":
      return "border-[#b33a3a] text-[#b33a3a]";
    default:
      return "border-[#4a4a4a] text-[#4a4a4a]";
  }
};

type AuditTableProps = {
  onCreateSecret?: () => void;
};

export function AuditTable({ onCreateSecret }: AuditTableProps) {
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [burningId, setBurningId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadAudit() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const axiosResponse = await axios.get("/api/audit");
        const json = axiosResponse.data as AuditApiResponse;

        if (!json.success) {
          throw new Error(json.message ?? "Failed to fetch audit entries.");
        }

        if (cancelled) return;

        const rows = json.data
          .map(toSecret)
          .sort((a, b) => {
            const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bTime - aTime;
          });

        setSecrets(rows);
      } catch (error) {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : "Failed to fetch audit entries.";
        setLoadError(message);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadAudit();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleCopy = (id: string, token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleBurn = async (id: string) => {
    try {
      await axios.delete(`/api/secrets/${id}`);
      setSecrets((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                burnedAt: new Date().toISOString(),
                status: "BURNED",
              }
            : item
        )
      );
    } catch (error) {
      console.error("Failed to burn secret:", error);
    } finally {   
      setBurningId(null);
    }
  };

  const now = Date.now();
  const stats = useMemo(() => {
    const viewedSince = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const active = secrets.filter((secret) => secret.status === "ACTIVE").length;
    const viewedThisWeek = secrets.filter(
      (secret) => secret.viewedAt && new Date(secret.viewedAt).getTime() >= viewedSince
    ).length;
    const burned = secrets.filter((secret) => secret.status === "BURNED").length;

    return {
      active,
      viewedThisWeek,
      burned,
    };
  }, [secrets]);

  if (isLoading) {
    return (
      <div className="w-full border border-[#2a2a2a] rounded-sm bg-[#161616]">
        <div className="py-16 flex items-center justify-center">
          <p className="font-sans text-[13px] text-[#8a8a8a]">Loading secrets...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="w-full border border-[#2a2a2a] rounded-sm bg-[#161616]">
        <div className="py-16 flex flex-col items-center justify-center text-center gap-2 px-6">
          <p className="font-sans text-[13px] text-[#b33a3a]">{loadError}</p>
          <p className="font-sans text-[13px] text-[#8a8a8a]">Please refresh and try again.</p>
        </div>
      </div>
    );
  }

  if (secrets.length === 0) {
    return (
      <>
        <div className="flex items-center border border-[#2a2a2a] rounded-sm mb-8 overflow-hidden">
          <div className="flex-1 px-6 py-5 bg-[#0c0c0c] border-r border-[#2a2a2a]">
            <p className="font-mono text-[24px] text-[#f0ece4] leading-none mb-2">0</p>
            <p className="font-sans text-[11px] tracking-wider uppercase text-[#8a8a8a]">Active Secrets</p>
          </div>
          <div className="flex-1 px-6 py-5 bg-[#0c0c0c] border-r border-[#2a2a2a]">
            <p className="font-mono text-[24px] text-[#f0ece4] leading-none mb-2">0</p>
            <p className="font-sans text-[11px] tracking-wider uppercase text-[#8a8a8a]">Viewed This Week</p>
          </div>
          <div className="flex-1 px-6 py-5 bg-[#0c0c0c]">
            <p className="font-mono text-[24px] text-[#f0ece4] leading-none mb-2">0</p>
            <p className="font-sans text-[11px] tracking-wider uppercase text-[#8a8a8a]">Burned</p>
          </div>
        </div>

        <div className="w-full border border-[#2a2a2a] rounded-sm bg-[#161616]">
          <div className="py-16 flex flex-col items-center justify-center text-center">
          <Lock className="size-8 text-[#2a2a2a] mb-4" />
          <p className="font-sans text-[16px] text-[#8a8a8a] mb-1">No secrets yet.</p>
          <p className="font-sans text-[13px] text-[#4a4a4a] mb-4">Create your first encrypted secret link.</p>
          {onCreateSecret ? (
            <button
              type="button"
              onClick={onCreateSecret}
              className="font-sans text-[13px] text-[#d4a84b] transition-colors hover:text-[#e8bf6a]"
            >
              Get started →
            </button>
          ) : (
            <Link href="/" className="font-sans text-[13px] text-[#d4a84b] hover:text-[#e8bf6a] transition-colors">
              Get started →
            </Link>
          )}
        </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex items-center border border-[#2a2a2a] rounded-sm mb-8 overflow-hidden">
        <div className="flex-1 px-6 py-5 bg-[#0c0c0c] border-r border-[#2a2a2a]">
          <p className="font-mono text-[24px] text-[#f0ece4] leading-none mb-2">{stats.active}</p>
          <p className="font-sans text-[11px] tracking-wider uppercase text-[#8a8a8a]">Active Secrets</p>
        </div>
        <div className="flex-1 px-6 py-5 bg-[#0c0c0c] border-r border-[#2a2a2a]">
          <p className="font-mono text-[24px] text-[#f0ece4] leading-none mb-2">{stats.viewedThisWeek}</p>
          <p className="font-sans text-[11px] tracking-wider uppercase text-[#8a8a8a]">Viewed This Week</p>
        </div>
        <div className="flex-1 px-6 py-5 bg-[#0c0c0c]">
          <p className="font-mono text-[24px] text-[#f0ece4] leading-none mb-2">{stats.burned}</p>
          <p className="font-sans text-[11px] tracking-wider uppercase text-[#8a8a8a]">Burned</p>
        </div>
      </div>

      <div className="w-full border border-[#2a2a2a] rounded-sm bg-[#161616]">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
          <thead>
            <tr className="bg-[#1f1f1f] border-b border-[#2a2a2a]">
              <th className="font-sans text-[10px] tracking-wider uppercase text-[#8a8a8a] px-6 py-3 font-medium">Token</th>
              <th className="font-sans text-[10px] tracking-wider uppercase text-[#8a8a8a] px-6 py-3 font-medium">Created</th>
              <th className="font-sans text-[10px] tracking-wider uppercase text-[#8a8a8a] px-6 py-3 font-medium">Expires</th>
              <th className="font-sans text-[10px] tracking-wider uppercase text-[#8a8a8a] px-6 py-3 font-medium">Status</th>
              <th className="font-sans text-[10px] tracking-wider uppercase text-[#8a8a8a] px-6 py-3 font-medium">Webhook</th>
              <th className="font-sans text-[10px] tracking-wider uppercase text-[#8a8a8a] px-6 py-3 font-medium">Viewed At</th>
              <th className="font-sans text-[10px] tracking-wider uppercase text-[#8a8a8a] px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {secrets.map((secret, index) => {
              const isLast = index === secrets.length - 1;
              const isExpired =
                secret.expired || (secret.expiresAt ? new Date(secret.expiresAt).getTime() < now : false);
              const canBurn = secret.status === "ACTIVE" && !isExpired;

              return (
                <React.Fragment key={secret.id}>
                  <tr className={`h-13 bg-[#161616] hover:bg-[#1a1a1a] transition-colors ${!isLast || burningId === secret.id ? "border-b border-[#2a2a2a]" : ""}`}>
                    <td className="px-6">
                      <button 
                        onClick={() => handleCopy(secret.id, secret.token)}
                        className="font-mono text-[13px] text-[#f0ece4] hover:text-[#d4a84b] transition-colors outline-none inline-flex items-center min-w-25"
                        title="Copy token"
                      >
                        {copiedId === secret.id ? (
                          <Check className="size-3.5 text-[#4a7c59]" />
                        ) : (
                          `${secret.token.substring(0, 8)}…`
                        )}
                      </button>
                    </td>
                    <td className="px-6">
                      {secret.createdAt ? (
                        <span className="font-sans text-[13px] text-[#8a8a8a] cursor-default" title={new Date(secret.createdAt).toISOString()}>
                          {getRelativeTime(secret.createdAt)}
                        </span>
                      ) : (
                        <span className="font-sans text-[13px] text-[#4a4a4a]">—</span>
                      )}
                    </td>
                    <td className="px-6">
                      {isExpired ? (
                        <span className="font-mono text-[13px] text-[#b33a3a]">Expired</span>
                      ) : !secret.expiresAt ? (
                        <span className="font-sans text-[13px] text-[#4a4a4a]">—</span>
                      ) : (
                        <span className="font-mono text-[13px] text-[#8a8a8a]" title={new Date(secret.expiresAt).toISOString()}>
                          {getRelativeTime(secret.expiresAt)}
                        </span>
                      )}
                    </td>
                    <td className="px-6">
                      <span className={`inline-flex items-center h-5.5 px-2 rounded-sm border font-mono text-[11px] ${getStatusStyles(secret.status)}`}>
                        {secret.status}
                      </span>
                    </td>
                    <td className="px-6">
                      {secret.webhookStatus ? (
                        <span
                          className={`inline-flex items-center h-5.5 px-2 rounded-sm border font-mono text-[11px] ${getWebhookStatusStyles(secret.webhookStatus)}`}
                        >
                          {secret.webhookStatus}
                        </span>
                      ) : (
                        <span className="font-sans text-[13px] text-[#4a4a4a]">—</span>
                      )}
                    </td>
                    <td className="px-6">
                      {secret.viewedAt ? (
                        <span className="font-sans text-[13px] text-[#8a8a8a]" title={new Date(secret.viewedAt).toISOString()}>
                          {getRelativeTime(secret.viewedAt)}
                        </span>
                      ) : (
                        <span className="font-sans text-[13px] text-[#4a4a4a]">—</span>
                      )}
                    </td>
                    <td className="px-6 text-right">
                      {canBurn ? (
                        <button
                          onClick={() => setBurningId(burningId === secret.id ? null : secret.id)}
                          className="text-[#4a4a4a] hover:text-[#b33a3a] transition-colors outline-none"
                          title="Burn secret"
                        >
                          <Flame className="size-4" />
                        </button>
                      ) : (
                        <span className="text-[#4a4a4a] inline-flex items-center justify-center w-4">
                          —
                        </span>
                      )}
                    </td>
                  </tr>
                  
                  {/* Inline Burn Confirmation */}
                  {burningId === secret.id && (
                    <tr className={`bg-[#1a1a1a] ${!isLast ? "border-b border-[#2a2a2a]" : ""}`}>
                      <td colSpan={7} className="px-6 py-4">
                        <div className="flex items-center justify-end gap-4">
                          <span className="font-sans text-[13px] text-[#8a8a8a]">
                            Burn this secret? This cannot be undone.
                          </span>
                          <button
                            onClick={() => setBurningId(null)}
                            className="font-sans text-[13px] text-[#8a8a8a] hover:text-[#f0ece4] transition-colors outline-none px-2"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleBurn(secret.id)}
                            className="h-7 px-3 border border-[#b33a3a] rounded-sm font-sans font-medium text-[13px] text-[#b33a3a] hover:bg-[#b33a3a] hover:text-[#0c0c0c] transition-colors outline-none"
                          >
                            Burn
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-[#2a2a2a]">
          <span className="font-sans text-[13px] text-[#8a8a8a]">Showing {secrets.length} secret{secrets.length === 1 ? "" : "s"}</span>
        </div>
      </div>
    </>
  );
  }
