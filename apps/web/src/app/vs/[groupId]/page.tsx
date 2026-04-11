"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { diffLines, type Change } from "diff";
import { Copy, Trash2, ChevronDown, Plus, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { importKey, encrypt, decrypt } from "@repo/encryption";

interface VersionData {
  id: string;
  versionNumber: number;
  ciphertext: string;
  iv: string;
  createdAt: string;
}

export default function VersionedSecretPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const router = useRouter();
  const [groupId, setGroupId] = useState<string>("");
  const [keyBase64, setKeyBase64] = useState<string | null>(null);
  const [cryptoKey, setCryptoKey] = useState<CryptoKey | null>(null);
  const [versions, setVersions] = useState<VersionData[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<number>(0);
  const [decryptedCurrent, setDecryptedCurrent] = useState<string>("");
  const [decryptedPrevious, setDecryptedPrevious] = useState<string | null>(null);
  const [diffChanges, setDiffChanges] = useState<Change[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVersionDropdown, setShowVersionDropdown] = useState(false);

  // Resolve params
  useEffect(() => {
    params.then((p) => setGroupId(p.groupId));
  }, [params]);

  // Extract key from URL fragment
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || !hash.includes("key=")) {
      setError(
        "No decryption key found in URL. Make sure you are using the full master link.",
      );
      setIsLoading(false);
      return;
    }

    const key = new URLSearchParams(hash.substring(1)).get("key");
    if (!key) {
      setError(
        "No decryption key found in URL. Make sure you are using the full master link.",
      );
      setIsLoading(false);
      return;
    }

    setKeyBase64(key);
  }, []);

  // Import the crypto key once we have the base64 key
  useEffect(() => {
    if (!keyBase64) return;

    importKey(keyBase64)
      .then(setCryptoKey)
      .catch(() => {
        setError("Failed to import decryption key. The key may be corrupted.");
        setIsLoading(false);
      });
  }, [keyBase64]);

  // Fetch versions once we have groupId
  const fetchVersions = useCallback(async () => {
    if (!groupId) return;

    try {
      const response = await axios.get(
        `/api/versioned-secrets/groups/${groupId}/versions`,
      );

      const json = response.data as { versions: VersionData[] };
      setVersions(json.versions);

      // Default to latest version
      if (json.versions.length > 0) {
        const latest = json.versions[json.versions.length - 1]!;
        setSelectedVersion(latest.versionNumber);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setError("You must be signed in to view versioned secrets.");
        } else if (error.response?.status === 403) {
          setError("You do not have access to this secret group.");
        } else if (error.response?.status === 404) {
          setError("Secret group not found.");
        } else {
          setError("Failed to load versions. Please try again.");
        }
      } else {
        setError("Failed to load versions. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    if (groupId && cryptoKey) {
      fetchVersions();
    }
  }, [groupId, cryptoKey, fetchVersions]);

  // Decrypt selected version and compute diff
  useEffect(() => {
    if (!cryptoKey || versions.length === 0 || selectedVersion === 0) return;

    const decryptVersion = async () => {
      setIsDecrypting(true);

      try {
        const current = versions.find(
          (v) => v.versionNumber === selectedVersion,
        );
        if (!current) return;

        const currentPlaintext = await decrypt(
          current.ciphertext,
          current.iv,
          cryptoKey,
        );
        setDecryptedCurrent(currentPlaintext);

        // Find previous version for diff
        const previous = versions.find(
          (v) => v.versionNumber === selectedVersion - 1,
        );

        if (previous) {
          const previousPlaintext = await decrypt(
            previous.ciphertext,
            previous.iv,
            cryptoKey,
          );
          setDecryptedPrevious(previousPlaintext);

          const changes = diffLines(previousPlaintext, currentPlaintext);
          setDiffChanges(changes);
        } else {
          // v1 — show all as additions
          setDecryptedPrevious(null);
          const changes = diffLines("", currentPlaintext);
          setDiffChanges(changes);
        }
      } catch {
        toast.error("Decryption failed. The key might be incorrect.");
      } finally {
        setIsDecrypting(false);
      }
    };

    decryptVersion();
  }, [cryptoKey, versions, selectedVersion]);

  const handleAddVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cryptoKey || !groupId || !newContent.trim()) return;

    setIsSubmitting(true);

    try {
      const { ciphertext, iv } = await encrypt(newContent, cryptoKey);

      const response = await axios.post(
        `/api/versioned-secrets/groups/${groupId}/versions`,
        { ciphertext, iv },
      );

      const json = response.data as { versionNumber: number };
      toast.success(`Version ${json.versionNumber} created`);
      setNewContent("");

      // Re-fetch and select the new version
      setIsLoading(true);
      await fetchVersions();
      setSelectedVersion(json.versionNumber);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to add version",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!groupId) return;

    setIsDeleting(true);

    try {
      await axios.delete(`/api/versioned-secrets/groups/${groupId}`);

      toast.success("Secret group deleted");
      router.push("/dashboard");
    } catch {
      toast.error("Failed to delete group");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Error state
  if (error) {
    return (
      <main className="min-h-screen">
        <header className="flex h-13 items-center border-b border-[#2a2a2a] bg-[#0c0c0c]">
          <div className="mx-auto w-full max-w-[960px] px-4 flex items-center justify-between">
            <Link
              href="/"
              className="font-sans font-semibold text-[15px] tracking-tight text-[#f0ece4] flex items-center gap-1.5 hover:opacity-80 transition-opacity"
            >
              <span className="text-[#d4a84b]">{"//"}</span> SecretTunnel
            </Link>
          </div>
        </header>
        <section className="mx-auto w-full max-w-[960px] px-4 py-20 flex flex-col items-center justify-center min-h-[calc(100vh-172px)]">
          <div className="text-[#d4a84b] font-mono text-[48px] leading-none mb-6">
            !
          </div>
          <h2 className="font-sans text-[20px] text-[#f0ece4] tracking-tight mb-2">
            Access Error
          </h2>
          <p className="font-sans text-[13px] text-[#8a8a8a] max-w-[400px] text-center mb-8">
            {error}
          </p>
          <Link
            href="/dashboard"
            className="font-sans font-medium text-[14px] text-[#d4a84b] hover:text-[#e8bf6a] transition-colors"
          >
            Go to Dashboard →
          </Link>
        </section>
      </main>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <main className="min-h-screen">
        <header className="flex h-13 items-center border-b border-[#2a2a2a] bg-[#0c0c0c]">
          <div className="mx-auto w-full max-w-[960px] px-4 flex items-center justify-between">
            <Link
              href="/"
              className="font-sans font-semibold text-[15px] tracking-tight text-[#f0ece4] flex items-center gap-1.5 hover:opacity-80 transition-opacity"
            >
              <span className="text-[#d4a84b]">{"//"}</span> SecretTunnel
            </Link>
          </div>
        </header>
        <section className="mx-auto w-full max-w-[960px] px-4 py-20 flex items-center justify-center min-h-[calc(100vh-172px)]">
          <span className="font-mono text-sm text-[#4a4a4a] animate-pulse">
            Loading versions...
          </span>
        </section>
      </main>
    );
  }

  const currentVersion = versions.find(
    (v) => v.versionNumber === selectedVersion,
  );

  return (
    <main className="min-h-screen">
      <header className="flex h-13 items-center border-b border-[#2a2a2a] bg-[#0c0c0c]">
        <div className="mx-auto w-full max-w-[960px] px-4 flex items-center justify-between">
          <Link
            href="/"
            className="font-sans font-semibold text-[15px] tracking-tight text-[#f0ece4] flex items-center gap-1.5 hover:opacity-80 transition-opacity"
          >
            <span className="text-[#d4a84b]">{"//"}</span> SecretTunnel
          </Link>
          <Link
            href="/dashboard"
            className="font-sans text-[13px] text-[#8a8a8a] hover:text-[#d4a84b] transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto w-full max-w-[960px] px-4 pt-12 pb-32">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="font-sans font-medium text-[20px] text-[#f0ece4] mb-1 tracking-tight">
              Versioned Secret
            </h1>
            <p className="font-sans text-[13px] text-[#8a8a8a]">
              {versions.length} version{versions.length !== 1 ? "s" : ""} ·
              Decrypted in your browser
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Version selector */}
            <div className="relative">
              <button
                onClick={() => setShowVersionDropdown(!showVersionDropdown)}
                className="inline-flex items-center gap-2 h-9 px-4 border border-[#2a2a2a] rounded-sm bg-[#161616] font-mono text-[13px] text-[#f0ece4] hover:border-[#4a4a4a] transition-colors outline-none"
              >
                v{selectedVersion}
                <ChevronDown className="size-3.5 text-[#8a8a8a]" />
              </button>

              {showVersionDropdown && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-[#161616] border border-[#2a2a2a] rounded-sm shadow-xl z-50 max-h-60 overflow-y-auto">
                  {[...versions].reverse().map((v) => (
                    <button
                      key={v.id}
                      onClick={() => {
                        setSelectedVersion(v.versionNumber);
                        setShowVersionDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 font-mono text-[13px] transition-colors outline-none ${
                        v.versionNumber === selectedVersion
                          ? "text-[#d4a84b] bg-[#1f1f1f]"
                          : "text-[#8a8a8a] hover:text-[#f0ece4] hover:bg-[#1a1a1a]"
                      }`}
                    >
                      <span>v{v.versionNumber}</span>
                      <span className="text-[#4a4a4a] ml-2 text-[11px]">
                        {new Date(v.createdAt).toLocaleDateString()}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Delete button */}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center justify-center h-9 w-9 border border-[#2a2a2a] rounded-sm text-[#4a4a4a] hover:text-[#b33a3a] hover:border-[#b33a3a] transition-colors outline-none"
              title="Delete group"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>

        {/* Delete confirmation */}
        {showDeleteConfirm && (
          <div className="mb-6 bg-[#1a1a1a] border border-[#2a2a2a] rounded-sm p-5">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="size-5 text-[#b33a3a] shrink-0 mt-0.5" />
              <div>
                <p className="font-sans text-[14px] text-[#f0ece4] mb-1">
                  Delete this secret group?
                </p>
                <p className="font-sans text-[13px] text-[#8a8a8a]">
                  All versions will be permanently destroyed. This cannot be
                  undone.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="font-sans text-[13px] text-[#8a8a8a] hover:text-[#f0ece4] transition-colors outline-none px-3 py-1.5"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteGroup}
                disabled={isDeleting}
                className="h-8 px-4 border border-[#b33a3a] rounded-sm font-sans font-medium text-[13px] text-[#b33a3a] hover:bg-[#b33a3a] hover:text-[#0c0c0c] transition-colors outline-none disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Forever"}
              </button>
            </div>
          </div>
        )}

        {/* Diff view */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <p className="font-mono text-[11px] font-semibold tracking-wider text-[#8a8a8a] uppercase">
              {decryptedPrevious !== null
                ? `Changes from v${selectedVersion - 1} → v${selectedVersion}`
                : `Version ${selectedVersion} (initial)`}
            </p>
            {currentVersion && (
              <p className="font-sans text-[11px] text-[#4a4a4a]">
                {new Date(currentVersion.createdAt).toLocaleString()}
              </p>
            )}
          </div>

          <div className="bg-[#161616] border border-[#2a2a2a] rounded-sm overflow-hidden">
            {isDecrypting ? (
              <div className="p-8 flex items-center justify-center">
                <span className="font-mono text-sm text-[#4a4a4a] animate-pulse">
                  Decrypting...
                </span>
              </div>
            ) : (
              <pre className="text-[13px] font-mono leading-relaxed overflow-x-auto">
                {diffChanges.map((change, i) => {
                  const lines = change.value.split("\n");
                  // Remove trailing empty string from split
                  if (lines[lines.length - 1] === "") lines.pop();

                  return lines.map((line, j) => {
                    let bgColor = "bg-transparent";
                    let textColor = "text-[#8a8a8a]";
                    let prefix = "  ";

                    if (change.added) {
                      bgColor = "bg-[#1a2e1a]";
                      textColor = "text-[#4a7c59]";
                      prefix = "+ ";
                    } else if (change.removed) {
                      bgColor = "bg-[#2e1a1a]";
                      textColor = "text-[#b33a3a]";
                      prefix = "- ";
                    }

                    return (
                      <div
                        key={`${i}-${j}`}
                        className={`px-4 py-0.5 ${bgColor} ${textColor} border-l-2 ${
                          change.added
                            ? "border-[#4a7c59]"
                            : change.removed
                              ? "border-[#b33a3a]"
                              : "border-transparent"
                        }`}
                      >
                        <span className="select-none opacity-50 mr-2">
                          {prefix}
                        </span>
                        {line}
                      </div>
                    );
                  });
                })}
              </pre>
            )}
          </div>
        </div>

        {/* Full decrypted content */}
        <div className="mb-8">
          <p className="font-mono text-[11px] font-semibold tracking-wider text-[#8a8a8a] uppercase mb-3">
            Full Content — v{selectedVersion}
          </p>
          <div className="relative">
            <pre className="bg-[#161616] border border-[#2a2a2a] rounded-sm p-5 text-[13px] font-mono text-[#f0ece4] leading-relaxed whitespace-pre-wrap break-words min-h-[100px] select-text">
              {isDecrypting ? "Decrypting..." : decryptedCurrent}
            </pre>
            <button
              onClick={() => {
                navigator.clipboard.writeText(decryptedCurrent);
                toast.success("Copied to clipboard");
              }}
              className="absolute top-3 right-3 text-[#4a4a4a] hover:text-[#d4a84b] transition-colors outline-none"
              title="Copy content"
            >
              <Copy className="size-4" />
            </button>
          </div>
        </div>

        {/* Add new version */}
        <div>
          <p className="font-mono text-[11px] font-semibold tracking-wider text-[#8a8a8a] uppercase mb-3">
            Add New Version
          </p>
          <form onSubmit={handleAddVersion} className="flex flex-col gap-4">
            <textarea
              placeholder="Paste updated .env content here..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="w-full min-h-[140px] bg-[#161616] border border-[#2a2a2a] rounded-sm p-4 font-mono text-[14px] text-[#f0ece4] placeholder:text-[#4a4a4a] outline-none focus:border-[#4a4a4a] transition-colors resize-y"
            />
            <button
              type="submit"
              disabled={isSubmitting || !newContent.trim()}
              className="self-start inline-flex items-center gap-2 h-10 px-5 bg-[#d4a84b] text-[#0c0c0c] font-sans font-semibold text-[14px] rounded-sm hover:bg-[#e8bf6a] transition-colors outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="size-4" />
              {isSubmitting ? "Encrypting..." : "Encrypt & Save Version"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
