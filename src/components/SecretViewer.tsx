"use client";

import { useState, useEffect } from "react";
import { Lock, FileWarning, ShieldAlert, CheckCircle2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { importKey, applyPasswordLayer, decrypt } from "@/lib/crypto";
import Link from "next/link";

interface SecretViewerProps {
  token: string;
}

export function SecretViewer({ token }: SecretViewerProps) {
  const [status, setStatus] = useState<"loading" | "password-prompt" | "decrypted" | "error" | "not-found">("loading");
  const [encryptedData, setEncryptedData] = useState<{ ciphertext: string; iv: string; passwordHash?: string } | null>(null);
  const [plaintext, setPlaintext] = useState<string>("");
  const [password, setPassword] = useState("");
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [keyBase64, setKeyBase64] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("This secret has already been viewed or has expired.");

  useEffect(() => {
    // Read the key from the URL fragment (hash) - this is intentionally client-side only
    const hash = window.location.hash;
    if (!hash || !hash.includes("key=")) {
      setStatus("error");
      setErrorMessage("Invalid link. The decryption key is missing from the URL.");
      return;
    }

    const key = new URLSearchParams(hash.substring(1)).get("key");
    if (!key) {
      setStatus("error");
      setErrorMessage("Invalid link. The decryption key is missing from the URL.");
      return;
    }

    setKeyBase64(key);

    // Fetch the encrypted payload from the server
    const fetchSecret = async () => {
      try {
        const res = await fetch(`/api/secrets/${token}`);
        if (res.status === 404) {
          setStatus("not-found");
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to fetch secret.");
        }

        const json = await res.json();
        const data = json.data;
        
        setEncryptedData(data);

        // If the secret requires a password, show the prompt
        if (data.passwordHash) {
          setStatus("password-prompt");
        } else {
          // If no password is required, decrypt immediately
          await performDecryption(data, key);
        }
      } catch (err) {
        console.error(err);
        setStatus("error");
        setErrorMessage("An error occurred while fetching the secret.");
      }
    };

    fetchSecret();
    
    // Clean up empty hash from URL to hide the base key quickly after reading it?
    // We shouldn't remove it right away or a refresh might break it. 
    // It's a single-view secret anyway, so after decrypt it's burned.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const performDecryption = async (data: { ciphertext: string; iv: string; passwordHash?: string }, keyStr: string | null = keyBase64, pwd?: string) => {
    if (!keyStr) return;
    setIsDecrypting(true);

    try {
      const baseKey = await importKey(keyStr);
      let keyToUse = baseKey;

      if (data.passwordHash && pwd) {
        keyToUse = await applyPasswordLayer(baseKey, pwd, data.passwordHash);
      }

      const decodedText = await decrypt(data.ciphertext, data.iv, keyToUse);
      setPlaintext(decodedText);
      setStatus("decrypted");
      toast.success("Secret decrypted successfully.");
      
      // We can optionally rewrite the URL hash here to remove the key, but it doesn't matter much 
      // since the secret is already burned on the server.
      window.history.replaceState(null, "", window.location.pathname);
    } catch (err) {
      console.error(err);
      if (pwd) {
        toast.error("Incorrect password.");
      } else {
        setStatus("error");
        setErrorMessage("Decryption failed. The link or key might be corrupted.");
      }
    } finally {
      setIsDecrypting(false);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!encryptedData) return;
    performDecryption(encryptedData, keyBase64, password);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(plaintext);
    toast.success("Secret copied to clipboard.");
  };

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-[#888888]">
        <span className="font-mono text-sm animate-pulse">Initializing decryption environment...</span>
      </div>
    );
  }

  if (status === "not-found") {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-[#1a0f0f] border border-red-900/50 rounded-sm">
        <ShieldAlert className="size-10 text-red-500 mb-4" />
        <h2 className="font-mono text-xl text-white mb-2 uppercase tracking-tight">Secret not found</h2>
        <p className="font-sans text-sm text-[#888888] max-w-sm mb-6">
          This secret has already been viewed, has expired, or never existed. 
          For security reasons, secrets are destroyed permanently after their first view.
        </p>
        <Button asChild variant="outline" className="rounded-sm border-[#2a2a2a] text-[#f5f5f5] hover:bg-[#111111]">
          <Link href="/">Create a new secret</Link>
        </Button>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-[#111111] border border-[#2a2a2a] rounded-sm">
        <FileWarning className="size-10 text-yellow-500 mb-4" />
        <h2 className="font-mono text-xl text-white mb-2 uppercase tracking-tight">Access Error</h2>
        <p className="font-sans text-sm text-[#888888] max-w-sm">
          {errorMessage}
        </p>
      </div>
    );
  }

  if (status === "password-prompt") {
    return (
      <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-6 rounded-sm border border-[#2a2a2a] bg-[#111111] p-6">
        <div className="flex flex-col items-center text-center space-y-2 mb-2">
          <div className="p-3 bg-black rounded-full border border-[#2a2a2a]">
            <Lock className="size-6 text-white" />
          </div>
          <h2 className="font-mono text-lg text-white mt-2">Password Protected</h2>
          <p className="font-sans text-xs text-[#888888]">
            This secret requires an additional password to decrypt.
          </p>
        </div>

        <div className="space-y-4">
          <Input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-[#0a0a0a] border-[#2a2a2a] text-center font-mono focus-visible:ring-1 focus-visible:ring-[#444]"
            autoFocus
          />
          <Button
            type="submit"
            disabled={isDecrypting || !password}
            className="w-full rounded-sm bg-white font-mono text-xs uppercase tracking-widest text-black hover:bg-gray-200"
          >
            {isDecrypting ? "Decrypting..." : "Decrypt"}
          </Button>
        </div>
      </form>
    );
  }

  if (status === "decrypted") {
    return (
      <div className="flex flex-col gap-6 rounded-sm border border-[#2a2a2a] bg-[#111111] p-6">
        <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-4">
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle2 className="size-4" />
            <span className="font-mono text-xs uppercase tracking-widest">Secret Decrypted</span>
          </div>
          <div className="flex items-center gap-2 text-red-400 font-mono text-[10px] uppercase tracking-widest bg-red-400/10 px-2 py-1 rounded-sm">
            <ShieldAlert className="size-3" />
            Burned from server
          </div>
        </div>

        <div className="relative">
          <Textarea
            readOnly
            value={plaintext}
            className="min-h-[200px] resize-y bg-[#0a0a0a] border-[#2a2a2a] font-mono text-sm text-[#f5f5f5] focus-visible:ring-0 selection:bg-white/20"
          />
        </div>

        <div className="flex gap-4">
          <Button 
            onClick={copyToClipboard}
            className="w-full rounded-sm bg-white font-mono text-xs uppercase tracking-widest text-black hover:bg-gray-200"
          >
            <Copy className="mr-2 size-4" />
            Copy Secret
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full rounded-sm border border-[#2a2a2a] bg-transparent font-mono text-xs uppercase tracking-widest text-[#f5f5f5] hover:border-white/30 hover:bg-[#1a1a1a]"
          >
            <Link href="/">Create Reply</Link>
          </Button>
        </div>

        <p className="text-center font-sans text-xs text-[#666666]">
          This text is not saved in your browser history. If you close this tab, the secret is gone forever.
        </p>
      </div>
    );
  }

  return null;
}
