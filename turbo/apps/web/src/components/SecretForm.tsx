"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { generateKey, generateSalt, applyPasswordLayer, encrypt, exportKey } from "@/lib/crypto";

export function SecretForm() {
  const [content, setContent] = useState("");
  const [ttl, setTtl] = useState("86400"); // Default 24h (1 day = 86400s)
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error("Secret content cannot be empty.");
      return;
    }

    setIsSubmitting(true);
    setShareUrl(null);

    try {
      const baseKey = await generateKey();
      let keyToUse = baseKey;
      let saltForServer: string | undefined = undefined;

      if (password) {
        const salt = generateSalt();
        keyToUse = await applyPasswordLayer(baseKey, password, salt);
        saltForServer = salt;
      }

      const { ciphertext, iv } = await encrypt(content, keyToUse);
      const exportedKeyBase64 = await exportKey(baseKey);

      const res = await fetch("/api/secrets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ciphertext,
          iv,
          ttl: parseInt(ttl, 10),
          passwordHash: saltForServer,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to create secret");
      }

      const token = data.token;
      const url = `${window.location.origin}/s/${token}#key=${encodeURIComponent(exportedKeyBase64)}`;
      setShareUrl(url);
      setContent("");
      setPassword("");
      setShowPassword(false);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Copied to clipboard");
    }
  };

  if (shareUrl) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <div>
          <h1 className="text-[28px] font-medium tracking-tight text-[#f0ece4] mb-2">Share a secret.</h1>
          <p className="font-mono text-[13px] text-[#8a8a8a]">
            End-to-end encrypted. Burned after reading. The server never sees your plaintext.
          </p>
        </div>

        <div className="bg-[#161616] border border-[#2a2a2a] rounded-sm p-5 w-full">
          <p className="font-sans text-[11px] font-semibold tracking-wider text-[#8a8a8a] uppercase mb-4">
            YOUR SECRET LINK
          </p>
          
          <div className="flex items-start justify-between gap-4 mb-5">
            <p className="font-mono text-[13px] text-[#f0ece4] break-all leading-relaxed">
              {shareUrl}
            </p>
            <button 
              onClick={copyToClipboard}
              className="text-[#8a8a8a] hover:text-[#d4a84b] transition-colors shrink-0 outline-none"
              aria-label="Copy to clipboard"
            >
              <Copy className="size-[18px]" />
            </button>
          </div>

          <div className="bg-[#1f1f1f] border-l-[3px] border-[#b33a3a] px-4 py-3">
            <p className="font-sans text-[13px] text-[#8a8a8a] leading-relaxed">
              This link works once. After it&apos;s opened, the secret is permanently destroyed.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShareUrl(null)}
          className="text-[13px] text-[#8a8a8a] hover:text-[#f0ece4] transition-colors self-start outline-none"
        >
          ← Create another secret
        </button>
      </div>
    );
  }

  const ttlOptions = [
    { label: "1h", value: "3600" },
    { label: "24h", value: "86400" },
    { label: "7d", value: "604800" },
    { label: "30d", value: "2592000" },
  ];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 w-full">
      <div>
        <h1 className="text-[28px] font-medium tracking-tight text-[#f0ece4] mb-2">Share a secret.</h1>
        <p className="font-mono text-[13px] text-[#8a8a8a]">
          End-to-end encrypted. Burned after reading. The server never sees your plaintext.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <textarea
          placeholder="Paste your secret here — API keys, passwords, .env files…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full min-h-[180px] bg-[#161616] border border-[#2a2a2a] rounded-sm p-4 font-mono text-[14px] text-[#f0ece4] placeholder:text-[#4a4a4a] outline-none focus:border-[#4a4a4a] transition-colors resize-y"
          required
        />
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
          <div className="flex items-center gap-2">
            {ttlOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTtl(opt.value)}
                className={`font-sans text-[13px] px-3 py-1.5 rounded-[999px] border transition-colors outline-none ${
                  ttl === opt.value
                    ? "bg-[#161616] border-[#d4a84b] text-[#d4a84b]"
                    : "border-[#2a2a2a] text-[#8a8a8a] hover:text-[#f0ece4]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {!showPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(true)}
              className="font-sans text-[13px] text-[#8a8a8a] hover:text-[#f0ece4] transition-colors outline-none"
            >
              + Add password protection
            </button>
          )}
        </div>

        {showPassword && (
          <div className="mt-2 flex flex-col gap-2 relative">
            <input
              type="password"
              placeholder="Encryption password (optional)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#161616] border border-[#2a2a2a] rounded-sm px-4 py-3 font-mono text-[14px] text-[#f0ece4] placeholder:text-[#4a4a4a] outline-none focus:border-[#4a4a4a] transition-colors"
            />
            <button
              type="button"
              onClick={() => {
                setShowPassword(false);
                setPassword("");
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a4a4a] hover:text-[#8a8a8a] font-mono text-[12px] outline-none"
            >
              [clear]
            </button>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-[48px] bg-[#d4a84b] text-[#0c0c0c] font-sans font-semibold text-[15px] rounded-sm hover:bg-[#e8bf6a] transition-colors outline-none disabled:opacity-50 disabled:cursor-not-allowed mt-2"
      >
        {isSubmitting ? "Encrypting..." : "Encrypt & Generate Link"}
      </button>
    </form>
  );
}
