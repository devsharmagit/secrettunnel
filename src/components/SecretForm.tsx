"use client";

import { useState } from "react";
import { Copy, Plus, Lock, Globe, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { generateKey, generateSalt, applyPasswordLayer, encrypt, exportKey } from "@/lib/crypto";

export function SecretForm() {
  const [content, setContent] = useState("");
  const [ttl, setTtl] = useState("86400"); // Default 1 day
  const [password, setPassword] = useState("");
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
        saltForServer = salt; // we store the salt in the passwordHash field on the server
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
      // create URL: /s/[token]#key=[exportedKey]
      const url = `${window.location.origin}/s/${token}#key=${encodeURIComponent(exportedKeyBase64)}`;
      setShareUrl(url);
      setContent("");
      setPassword("");
      toast.success("Secret created successfully.");
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
      toast.success("Copied to clipboard!");
    }
  };

  if (shareUrl) {
    return (
      <div className="flex flex-col gap-6 rounded-sm border border-[#2a2a2a] bg-[#111111] p-6 shadow-none">
        <div className="flex items-center gap-2 font-mono text-sm text-green-400">
          <Sparkles className="size-4" />
          <span>Secure link generated</span>
        </div>
        <p className="font-sans text-sm text-[#888888]">
          This link will only work once. Save it now, it will be permanently destroyed after being viewed.
        </p>
        
        <div className="flex gap-2">
          <Input 
            readOnly 
            value={shareUrl} 
            className="font-mono text-xs bg-[#0a0a0a] border-[#2a2a2a] text-white focus-visible:ring-1 focus-visible:ring-[#444]" 
          />
          <Button 
            onClick={copyToClipboard}
            className="shrink-0 rounded-sm bg-white font-mono text-xs uppercase tracking-widest text-black hover:bg-gray-200"
          >
            <Copy className="mr-2 size-4" />
            Copy
          </Button>
        </div>

        <Button
          variant="outline"
          onClick={() => setShareUrl(null)}
          className="w-full rounded-sm border border-[#2a2a2a] bg-transparent font-mono text-xs uppercase tracking-widest text-[#f5f5f5] hover:border-white/30 hover:bg-[#1a1a1a]"
        >
          <Plus className="mr-2 size-4" />
          Create another
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 rounded-sm border border-[#2a2a2a] bg-[#111111] p-6 shadow-none">
      <div className="space-y-2">
        <Label htmlFor="content" className="font-mono text-xs uppercase tracking-widest text-[#888888]">
          Secret Content
        </Label>
        <Textarea
          id="content"
          placeholder="Paste your sensitive data here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[150px] resize-y bg-[#0a0a0a] border-[#2a2a2a] font-mono text-sm text-[#f5f5f5] focus-visible:ring-1 focus-visible:ring-[#444]"
          required
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="ttl" className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#888888]">
            <Clock className="size-3" />
            Expiration (TTL)
          </Label>
          <Select value={ttl} onValueChange={setTtl}>
            <SelectTrigger id="ttl" className="bg-[#0a0a0a] border-[#2a2a2a] font-mono text-sm text-[#f5f5f5] focus:ring-1 focus:ring-[#444]">
              <SelectValue placeholder="Select TTL" />
            </SelectTrigger>
            <SelectContent className="bg-[#111111] border-[#2a2a2a] text-[#f5f5f5]">
              <SelectItem value="3600">1 Hour</SelectItem>
              <SelectItem value="86400">1 Day</SelectItem>
              <SelectItem value="604800">7 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#888888]">
            <Lock className="size-3" />
            Encryption Password (Optional)
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Add an extra layer..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-[#0a0a0a] border-[#2a2a2a] font-mono text-sm text-[#f5f5f5] focus-visible:ring-1 focus-visible:ring-[#444]"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-sm bg-white font-mono text-xs uppercase tracking-widest text-black hover:bg-gray-200 disabled:opacity-50"
      >
        {isSubmitting ? (
          <span className="animate-pulse">Encrypting...</span>
        ) : (
          <span className="flex items-center gap-2">
            <Globe className="size-4" />
            Generate Secure Link
          </span>
        )}
      </Button>
    </form>
  );
}
