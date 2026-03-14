"use client";

import React, { useState } from "react";
import { Check, Flame, Lock } from "lucide-react";
import Link from "next/link";

interface Secret {
  id: string;
  token: string;
  createdAt: string;
  expiresAt: string;
  status: "ACTIVE" | "VIEWED" | "BURNED" | "EXPIRED";
  viewedAt?: string;
}

const mockSecrets: Secret[] = [
  {
    id: "1",
    token: "ab82f9x1jklmnopqrst",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 22).toISOString(),
    status: "ACTIVE",
  },
  {
    id: "2",
    token: "x9yz88q2qwertyuiop",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    expiresAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    status: "EXPIRED",
  },
  {
    id: "3",
    token: "mp4l00z5asdfghjkl",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 23.5).toISOString(),
    status: "VIEWED",
    viewedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: "4",
    token: "c7vbnm12zxcvbnm",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4).toISOString(),
    status: "BURNED",
  },
];

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

export function AuditTable() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [burningId, setBurningId] = useState<string | null>(null);

  const handleCopy = (id: string, token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleBurn = (id: string) => {
    setBurningId(null);
    console.log("Burn secret", id);
    // In a real app, send API request to burn, then update state.
  };

  const [now] = useState(() => Date.now());

  if (mockSecrets.length === 0) {
    return (
      <div className="w-full border border-[#2a2a2a] rounded-sm bg-[#161616]">
        <div className="py-[64px] flex flex-col items-center justify-center text-center">
          <Lock className="size-[32px] text-[#2a2a2a] mb-4" />
          <p className="font-sans text-[16px] text-[#8a8a8a] mb-1">No secrets yet.</p>
          <p className="font-sans text-[13px] text-[#4a4a4a] mb-4">Create your first encrypted secret link.</p>
          <Link href="/" className="font-sans text-[13px] text-[#d4a84b] hover:text-[#e8bf6a] transition-colors">
            Get started →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full border border-[#2a2a2a] rounded-sm bg-[#161616]">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead>
            <tr className="bg-[#1f1f1f] border-b border-[#2a2a2a]">
              <th className="font-sans text-[10px] tracking-wider uppercase text-[#8a8a8a] px-6 py-3 font-medium">Token</th>
              <th className="font-sans text-[10px] tracking-wider uppercase text-[#8a8a8a] px-6 py-3 font-medium">Created</th>
              <th className="font-sans text-[10px] tracking-wider uppercase text-[#8a8a8a] px-6 py-3 font-medium">Expires</th>
              <th className="font-sans text-[10px] tracking-wider uppercase text-[#8a8a8a] px-6 py-3 font-medium">Status</th>
              <th className="font-sans text-[10px] tracking-wider uppercase text-[#8a8a8a] px-6 py-3 font-medium">Viewed At</th>
              <th className="font-sans text-[10px] tracking-wider uppercase text-[#8a8a8a] px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockSecrets.map((secret, index) => {
              const isLast = index === mockSecrets.length - 1;
              const isExpired = new Date(secret.expiresAt).getTime() < now;
              const canBurn = secret.status === "ACTIVE" && !isExpired;

              return (
                <React.Fragment key={secret.id}>
                  <tr className={`h-[52px] bg-[#161616] hover:bg-[#1a1a1a] transition-colors ${!isLast || burningId === secret.id ? "border-b border-[#2a2a2a]" : ""}`}>
                    <td className="px-6">
                      <button 
                        onClick={() => handleCopy(secret.id, secret.token)}
                        className="font-mono text-[13px] text-[#f0ece4] hover:text-[#d4a84b] transition-colors outline-none inline-flex items-center min-w-[100px]"
                        title="Copy token"
                      >
                        {copiedId === secret.id ? (
                          <Check className="size-[14px] text-[#4a7c59]" />
                        ) : (
                          `${secret.token.substring(0, 8)}…`
                        )}
                      </button>
                    </td>
                    <td className="px-6">
                      <span className="font-sans text-[13px] text-[#8a8a8a] cursor-default" title={new Date(secret.createdAt).toISOString()}>
                        {getRelativeTime(secret.createdAt)}
                      </span>
                    </td>
                    <td className="px-6">
                      {isExpired ? (
                        <span className="font-mono text-[13px] text-[#b33a3a]">Expired</span>
                      ) : (
                        <span className="font-mono text-[13px] text-[#8a8a8a]" title={new Date(secret.expiresAt).toISOString()}>
                          {getRelativeTime(secret.expiresAt)}
                        </span>
                      )}
                    </td>
                    <td className="px-6">
                      <span className={`inline-flex items-center h-[22px] px-2 rounded-sm border font-mono text-[11px] ${getStatusStyles(secret.status)}`}>
                        {secret.status}
                      </span>
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
                          <Flame className="size-[16px]" />
                        </button>
                      ) : (
                        <span className="text-[#4a4a4a] inline-flex items-center justify-center w-[16px]">
                          —
                        </span>
                      )}
                    </td>
                  </tr>
                  
                  {/* Inline Burn Confirmation */}
                  {burningId === secret.id && (
                    <tr className={`bg-[#1a1a1a] ${!isLast ? "border-b border-[#2a2a2a]" : ""}`}>
                      <td colSpan={6} className="px-6 py-4">
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
                            className="h-[28px] px-3 border border-[#b33a3a] rounded-sm font-sans font-medium text-[13px] text-[#b33a3a] hover:bg-[#b33a3a] hover:text-[#0c0c0c] transition-colors outline-none"
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
        <span className="font-sans text-[13px] text-[#8a8a8a]">
          Showing 1–4 of 4
        </span>
        <div className="flex items-center gap-4">
          <button className="font-sans text-[13px] text-[#4a4a4a] cursor-not-allowed outline-none">
            ← Previous
          </button>
          <button className="font-sans text-[13px] text-[#8a8a8a] hover:text-[#d4a84b] transition-colors outline-none">
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
