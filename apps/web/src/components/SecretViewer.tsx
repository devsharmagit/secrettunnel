"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import axios from "axios";
import { importKey, applyPasswordLayer, decrypt } from "@repo/encryption";
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

    const fetchSecret = async () => {
      try {
        const response = await axios.get(`/api/secrets/${token}`);
        const json = response.data;
        const data = json.data;

        setEncryptedData(data);

        if (data.passwordHash) {
          setStatus("password-prompt");
        } else {
          await performDecryption(data, key);
        }
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setStatus("not-found");
          return;
        }
        console.error(err);
        setStatus("error");
        setErrorMessage("An error occurred while fetching the secret.");
      }
    };

    fetchSecret();
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

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-[#4a4a4a] w-full text-center">
        <span className="font-mono text-sm animate-pulse">Decrypting...</span>
      </div>
    );
  }

  if (status === "not-found") {
    return (
      <div className="flex flex-col items-center justify-center text-center w-full">
        <div className="text-[#b33a3a] font-mono text-[48px] leading-none mb-6">×</div>
        <h2 className="font-sans text-[20px] text-[#f0ece4] tracking-tight mb-2">Secret not found.</h2>
        <p className="font-sans text-[13px] text-[#8a8a8a] max-w-[320px] mb-8">
          This secret has already been viewed, has expired, or never existed.
        </p>
        <Link href="/" className="font-sans font-medium text-[14px] text-[#d4a84b] hover:text-[#e8bf6a] transition-colors">
          Create a new secret →
        </Link>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center text-center w-full">
        <div className="text-[#d4a84b] font-mono text-[48px] leading-none mb-6">!</div>
        <h2 className="font-sans text-[20px] text-[#f0ece4] tracking-tight mb-2">Access Error</h2>
        <p className="font-sans text-[13px] text-[#8a8a8a] max-w-[320px] mb-8">
          {errorMessage}
        </p>
        <Link href="/" className="font-sans font-medium text-[14px] text-[#d4a84b] hover:text-[#e8bf6a] transition-colors">
          Create a new secret →
        </Link>
      </div>
    );
  }

  if (status === "password-prompt") {
    return (
      <form onSubmit={handlePasswordSubmit} className="flex flex-col w-full max-w-[400px]">
        <h2 className="font-sans text-[20px] text-[#f0ece4] tracking-tight mb-2 text-center">Password Protected</h2>
        <p className="font-sans text-[13px] text-[#8a8a8a] mb-6 text-center">
          This secret requires an additional password to decrypt.
        </p>

        <div className="flex flex-col gap-3">
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#161616] border border-[#2a2a2a] rounded-sm px-4 py-3 font-mono text-[14px] text-[#f0ece4] placeholder:text-[#4a4a4a] outline-none focus:border-[#4a4a4a] text-center transition-colors"
            autoFocus
          />
          <button
            type="submit"
            disabled={isDecrypting || !password}
            className="w-full h-[48px] bg-[#d4a84b] text-[#0c0c0c] font-sans font-semibold text-[15px] rounded-sm hover:bg-[#e8bf6a] transition-colors outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDecrypting ? "Decrypting..." : "Decrypt"}
          </button>
        </div>
      </form>
    );
  }

  if (status === "decrypted") {
    return (
      <div className="flex flex-col w-full text-left">
        <p className="font-mono text-[11px] font-semibold tracking-wider text-[#d4a84b] uppercase mb-4">
          ENCRYPTED SECRET
        </p>

        <div className="max-w-full">
          <pre className="bg-[#161616] border border-[#2a2a2a] text-[#f0ece4] text-[14px] font-mono p-6 rounded-sm whitespace-pre-wrap break-all mb-4 select-text w-full min-h-[140px] overflow-hidden">
            {plaintext}
          </pre>
          <button
            onClick={() => {
              navigator.clipboard.writeText(plaintext);
              toast.success("Copied to clipboard");
            }}
            className="mb-8 w-full sm:w-auto h-[40px] px-4 bg-[#2a2a2a] text-[#f0ece4] font-sans font-medium text-[13px] rounded-sm hover:bg-[#3a3a3a] transition-colors flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            Copy to clipboard
          </button>
        </div>

        <div className="flex flex-col gap-3 mt-2">
          <p className="font-sans text-[13px] text-[#8a8a8a]">
            This secret has been permanently destroyed. It cannot be accessed again.
          </p>
          <Link
            href="/share"
            className="font-sans font-medium text-[13px] text-[#d4a84b] hover:text-[#e8bf6a] transition-colors w-fit"
          >
            Share a new secret
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
