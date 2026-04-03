"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Github } from "lucide-react";
import { useState } from "react";

export default function SignUpPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length > 0) score += 1;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    return score;
  };

  const strength = calculateStrength(password);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const pwd = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirm-password") ?? "");

    if (pwd !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password: pwd,
      }),
    });

    const data = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(data.error ?? "Unable to create account.");
      setIsSubmitting(false);
      return;
    }

    const result = await signIn("credentials", {
      email,
      password: pwd,
      redirect: false,
      callbackUrl: "/dashboard",
    });

    if (!result || result.error) {
      setError("Account created, but automatic sign in failed.");
      setIsSubmitting(false);
      return;
    }

    router.push(result.url ?? "/dashboard");
    router.refresh();
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-100 bg-[#161616] border border-[#2a2a2a] rounded-sm p-8 shadow-none my-auto">
        <div className="flex flex-col items-center mb-8">
          <h1 className="font-sans font-semibold text-[18px] text-[#f0ece4] mb-2 flex items-center gap-1.5">
            <span className="text-[#d4a84b]">{"//"}</span> SecretTunnel
          </h1>
          <p className="font-sans text-[13px] text-[#8a8a8a] text-center">
            Create an account to track and manage your secrets.
          </p>
        </div>

        <button
          type="button"
          onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
          className="w-full h-11 flex items-center justify-center gap-2 bg-[#1f1f1f] border border-[#2a2a2a] rounded-sm hover:border-[#d4a84b] transition-colors outline-none mb-6"
        >
          <Github className="size-4 text-[#f0ece4]" />
          <span className="font-sans font-medium text-[14px] text-[#f0ece4]">Continue with GitHub</span>
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-[#2a2a2a]" />
          <span className="font-sans text-[11px] text-[#4a4a4a]">or</span>
          <div className="flex-1 h-px bg-[#2a2a2a]" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="font-sans text-[10px] tracking-wider uppercase text-[#8a8a8a]">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Jane Doe"
              className="w-full h-10 bg-[#0c0c0c] border border-[#2a2a2a] rounded-sm px-3 font-sans text-[14px] text-[#f0ece4] placeholder:text-[#4a4a4a] outline-none focus:border-[#4a4a4a] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="font-sans text-[10px] tracking-wider uppercase text-[#8a8a8a]">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="name@example.com"
              className="w-full h-10 bg-[#0c0c0c] border border-[#2a2a2a] rounded-sm px-3 font-sans text-[14px] text-[#f0ece4] placeholder:text-[#4a4a4a] outline-none focus:border-[#4a4a4a] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="font-sans text-[10px] tracking-wider uppercase text-[#8a8a8a]">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 bg-[#0c0c0c] border border-[#2a2a2a] rounded-sm px-3 pr-10 font-sans text-[14px] text-[#f0ece4] placeholder:text-[#4a4a4a] outline-none focus:border-[#4a4a4a] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a4a4a] hover:text-[#8a8a8a] transition-colors outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </button>
            </div>

            {password.length > 0 && (
              <div className="flex gap-1 mt-1">
                {[1, 2, 3, 4].map((level) => {
                  let bgColor = "bg-[#2a2a2a]";
                  if (strength >= level) {
                    if (strength === 1) bgColor = "bg-[#b33a3a]";
                    else if (strength === 2) bgColor = "bg-[#8a6a2a]";
                    else if (strength === 3) bgColor = "bg-[#d4a84b]";
                    else if (strength === 4) bgColor = "bg-[#4a7c59]";
                  }
                  return (
                    <div
                      key={level}
                      className={`flex-1 h-0.75 rounded-full transition-colors ${bgColor}`}
                    />
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="confirm-password" className="font-sans text-[10px] tracking-wider uppercase text-[#8a8a8a]">
              Confirm password
            </label>
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              className="w-full h-10 bg-[#0c0c0c] border border-[#2a2a2a] rounded-sm px-3 font-sans text-[14px] text-[#f0ece4] placeholder:text-[#4a4a4a] outline-none focus:border-[#4a4a4a] transition-colors"
            />
          </div>

          {error ? <p className="font-sans text-[12px] text-[#b33a3a]">{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 bg-[#d4a84b] text-[#0c0c0c] font-sans font-semibold text-[14px] rounded-sm hover:bg-[#e8bf6a] transition-colors outline-none disabled:opacity-50 flex items-center justify-center mt-2"
          >
            {isSubmitting ? <span className="font-mono animate-pulse">Creating...</span> : "Create Account"}
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-3">
          <p className="font-sans text-[13px] text-[#8a8a8a]">
            Already have an account?{" "}
            <Link href="/signin" className="text-[#d4a84b] hover:text-[#e8bf6a] outline-none transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
