"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Copy, Trash2, Plus, X, Lock, ExternalLink, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { generateKey, encrypt, exportKey } from "@repo/encryption";

interface SecretGroupItem {
  id: string;
  name: string;
  latestVersion: number;
  createdAt: string;
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

export function VersionedSecretsSection() {
  const [groups, setGroups] = useState<SecretGroupItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Create modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createContent, setCreateContent] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Master link modal state
  const [masterLink, setMasterLink] = useState<string | null>(null);
  const [showMasterLinkModal, setShowMasterLinkModal] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const res = await fetch("/api/versioned-secrets/groups", {
        method: "GET",
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch groups");
      }

      const json = (await res.json()) as { groups: SecretGroupItem[] };
      setGroups(json.groups);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch groups.";
      setLoadError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim() || !createContent.trim()) return;

    setIsCreating(true);

    try {
      // 1. Generate key in browser
      const key = await generateKey();

      // 2. Encrypt content
      const { ciphertext, iv } = await encrypt(createContent, key);

      // 3. POST to server
      const res = await fetch("/api/versioned-secrets/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: createName.trim(), ciphertext, iv }),
      });

      if (!res.ok) {
        const json = (await res.json()) as { message?: string };
        throw new Error(json.message ?? "Failed to create group");
      }

      const json = (await res.json()) as { groupId: string };

      // 4. Export key and construct master link
      const exportedKey = await exportKey(key);
      const link = `${window.location.origin}/vs/${json.groupId}#key=${encodeURIComponent(exportedKey)}`;

      setMasterLink(link);
      setShowCreateModal(false);
      setShowMasterLinkModal(true);
      setCreateName("");
      setCreateContent("");

      // Refresh the list
      await fetchGroups();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create group",
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (groupId: string) => {
    try {
      const res = await fetch(`/api/versioned-secrets/groups/${groupId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete group");
      }

      setGroups((prev) => prev.filter((g) => g.id !== groupId));
      toast.success("Secret group deleted");
    } catch {
      toast.error("Failed to delete group");
    } finally {
      setDeletingId(null);
    }
  };

  const copyMasterLink = () => {
    if (masterLink) {
      navigator.clipboard.writeText(masterLink);
      toast.success("Master link copied to clipboard");
    }
  };

  // Loading
  if (isLoading) {
    return (
      <div className="w-full border border-[#2a2a2a] rounded-sm bg-[#161616]">
        <div className="py-12 flex items-center justify-center">
          <p className="font-sans text-[13px] text-[#8a8a8a]">
            Loading versioned secrets...
          </p>
        </div>
      </div>
    );
  }

  // Error
  if (loadError) {
    return (
      <div className="w-full border border-[#2a2a2a] rounded-sm bg-[#161616]">
        <div className="py-12 flex flex-col items-center justify-center text-center gap-2 px-6">
          <p className="font-sans text-[13px] text-[#b33a3a]">{loadError}</p>
          <p className="font-sans text-[13px] text-[#8a8a8a]">
            Please refresh and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 mt-16">
        <div>
          <h2 className="font-sans font-medium text-[20px] text-[#f0ece4] mb-1 tracking-tight">
            Versioned Secret Groups
          </h2>
          <p className="font-sans text-[13px] text-[#8a8a8a]">
            Persistent, versioned secrets with full history. You need the master
            link to decrypt.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-sm border border-[#d4a84b] px-4 font-sans text-[13px] font-medium text-[#d4a84b] transition-colors outline-none hover:bg-[#d4a84b] hover:text-[#0c0c0c]"
        >
          <Plus className="size-3.5" />
          New Group
        </button>
      </div>

      {/* Empty state */}
      {groups.length === 0 ? (
        <div className="w-full border border-[#2a2a2a] rounded-sm bg-[#161616]">
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <Lock className="size-8 text-[#2a2a2a] mb-4" />
            <p className="font-sans text-[16px] text-[#8a8a8a] mb-1">
              No versioned secrets yet.
            </p>
            <p className="font-sans text-[13px] text-[#4a4a4a] mb-4">
              Create your first versioned secret group.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="font-sans text-[13px] text-[#d4a84b] hover:text-[#e8bf6a] transition-colors"
            >
              Get started →
            </button>
          </div>
        </div>
      ) : (
        /* Groups Table */
        <div className="w-full border border-[#2a2a2a] rounded-sm bg-[#161616]">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="bg-[#1f1f1f] border-b border-[#2a2a2a]">
                  <th className="font-sans text-[10px] tracking-wider uppercase text-[#8a8a8a] px-6 py-3 font-medium">
                    Name
                  </th>
                  <th className="font-sans text-[10px] tracking-wider uppercase text-[#8a8a8a] px-6 py-3 font-medium">
                    Versions
                  </th>
                  <th className="font-sans text-[10px] tracking-wider uppercase text-[#8a8a8a] px-6 py-3 font-medium">
                    Created
                  </th>
                  <th className="font-sans text-[10px] tracking-wider uppercase text-[#8a8a8a] px-6 py-3 font-medium text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group, index) => {
                  const isLast = index === groups.length - 1;

                  return (
                    <tr
                      key={group.id}
                      className={`h-13 bg-[#161616] hover:bg-[#1a1a1a] transition-colors ${!isLast ? "border-b border-[#2a2a2a]" : ""}`}
                    >
                      <td className="px-6">
                        <span className="font-sans text-[13px] text-[#f0ece4]">
                          {group.name}
                        </span>
                      </td>
                      <td className="px-6">
                        <span className="inline-flex items-center h-5.5 px-2 rounded-sm border border-[#4a7c59] font-mono text-[11px] text-[#4a7c59]">
                          v{group.latestVersion}
                        </span>
                      </td>
                      <td className="px-6">
                        <span
                          className="font-sans text-[13px] text-[#8a8a8a] cursor-default"
                          title={new Date(group.createdAt).toISOString()}
                        >
                          {getRelativeTime(group.createdAt)}
                        </span>
                      </td>
                      <td className="px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/vs/${group.id}`}
                            className="inline-flex items-center gap-1 text-[#8a8a8a] hover:text-[#d4a84b] transition-colors outline-none font-sans text-[13px]"
                            title="Open (you'll need your master link)"
                          >
                            <ExternalLink className="size-3.5" />
                            Open
                          </Link>
                          {deletingId === group.id ? (
                            <div className="flex items-center gap-2 ml-2">
                              <button
                                onClick={() => setDeletingId(null)}
                                className="font-sans text-[12px] text-[#8a8a8a] hover:text-[#f0ece4] transition-colors outline-none"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleDelete(group.id)}
                                className="font-sans text-[12px] text-[#b33a3a] hover:text-[#d45a5a] transition-colors outline-none font-medium"
                              >
                                Confirm
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeletingId(group.id)}
                              className="text-[#4a4a4a] hover:text-[#b33a3a] transition-colors outline-none ml-2"
                              title="Delete group"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#2a2a2a]">
            <span className="font-sans text-[13px] text-[#8a8a8a]">
              Showing {groups.length} group{groups.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0c0c0c] border border-[#2a2a2a] rounded-sm w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a]">
              <h3 className="font-sans font-medium text-[16px] text-[#f0ece4]">
                Create Versioned Secret Group
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateName("");
                  setCreateContent("");
                }}
                className="text-[#4a4a4a] hover:text-[#8a8a8a] transition-colors outline-none"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block font-sans text-[11px] tracking-wider uppercase text-[#8a8a8a] mb-2 font-medium">
                  Group Name
                </label>
                <input
                  type="text"
                  placeholder='e.g. "my-saas .env"'
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  className="w-full bg-[#161616] border border-[#2a2a2a] rounded-sm px-4 py-3 font-sans text-[14px] text-[#f0ece4] placeholder:text-[#4a4a4a] outline-none focus:border-[#4a4a4a] transition-colors"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block font-sans text-[11px] tracking-wider uppercase text-[#8a8a8a] mb-2 font-medium">
                  Initial .env Content
                </label>
                <textarea
                  placeholder={`DB_HOST=localhost\nDB_PASSWORD=secret123\nAPI_KEY=sk_live_...`}
                  value={createContent}
                  onChange={(e) => setCreateContent(e.target.value)}
                  className="w-full min-h-[160px] bg-[#161616] border border-[#2a2a2a] rounded-sm p-4 font-mono text-[14px] text-[#f0ece4] placeholder:text-[#4a4a4a] outline-none focus:border-[#4a4a4a] transition-colors resize-y"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={
                  isCreating || !createName.trim() || !createContent.trim()
                }
                className="w-full h-[48px] bg-[#d4a84b] text-[#0c0c0c] font-sans font-semibold text-[15px] rounded-sm hover:bg-[#e8bf6a] transition-colors outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? "Encrypting..." : "Encrypt & Create Group"}
              </button>

              <p className="font-sans text-[12px] text-[#4a4a4a] text-center">
                Encryption happens in your browser. The server never sees your
                plaintext.
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Master Link Modal */}
      {showMasterLinkModal && masterLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0c0c0c] border border-[#2a2a2a] rounded-sm w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a]">
              <h3 className="font-sans font-medium text-[16px] text-[#f0ece4]">
                Master Link Created
              </h3>
              <button
                onClick={() => {
                  setShowMasterLinkModal(false);
                  setMasterLink(null);
                }}
                className="text-[#4a4a4a] hover:text-[#8a8a8a] transition-colors outline-none"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-5">
              {/* Warning */}
              <div className="bg-[#1f1f1f] border-l-[3px] border-[#d4a84b] px-4 py-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="size-4 text-[#d4a84b] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-sans text-[14px] font-semibold text-[#d4a84b] mb-1">
                      Save this link now.
                    </p>
                    <p className="font-sans text-[13px] text-[#8a8a8a] leading-relaxed">
                      It contains your decryption key. We cannot recover it.
                      Without this link, your secrets are permanently
                      inaccessible.
                    </p>
                  </div>
                </div>
              </div>

              {/* Link display */}
              <div className="bg-[#161616] border border-[#2a2a2a] rounded-sm p-4">
                <p className="font-mono text-[12px] text-[#f0ece4] break-all leading-relaxed select-all">
                  {masterLink}
                </p>
              </div>

              {/* Copy button */}
              <button
                onClick={copyMasterLink}
                className="w-full h-[48px] bg-[#d4a84b] text-[#0c0c0c] font-sans font-semibold text-[15px] rounded-sm hover:bg-[#e8bf6a] transition-colors outline-none inline-flex items-center justify-center gap-2"
              >
                <Copy className="size-4" />
                Copy Master Link
              </button>

              <button
                onClick={() => {
                  setShowMasterLinkModal(false);
                  setMasterLink(null);
                }}
                className="text-[13px] text-[#8a8a8a] hover:text-[#f0ece4] transition-colors self-center outline-none"
              >
                I&apos;ve saved it — close this
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
