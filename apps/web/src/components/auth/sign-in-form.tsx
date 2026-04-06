"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Github, KeyRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type SignInFormValues = z.infer<typeof signInSchema>;

type SignInFormProps = {
  callbackUrl?: string;
};

export function SignInForm({ callbackUrl = "/dashboard" }: SignInFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: SignInFormValues) {
    setError(null);

    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
      callbackUrl,
    });

    if (!result || result.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push(result.url ?? callbackUrl);
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-800" htmlFor="email">
          Email
        </label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          {...register("email")}
          aria-invalid={Boolean(errors.email)}
          className="h-10 border-zinc-300/80 bg-white"
        />
        {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-800" htmlFor="password">
          Password
        </label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          {...register("password")}
          aria-invalid={Boolean(errors.password)}
          className="h-10 border-zinc-300/80 bg-white"
        />
        {errors.password ? (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        ) : null}
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button
        className="h-10 w-full bg-zinc-900 text-zinc-100 hover:bg-zinc-800"
        type="submit"
        disabled={isSubmitting}
      >
        <KeyRound className="mr-1 size-4" />
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>

      <Button
        className="h-10 w-full border-amber-800/20 text-zinc-900 hover:bg-amber-50"
        type="button"
        variant="outline"
        onClick={() => signIn("github", { callbackUrl })}
      >
        <Github className="mr-1 size-4" />
        Continue with GitHub
      </Button>

      <p className="text-sm text-muted-foreground">
        Need an account?{" "}
        <Link className="font-medium text-amber-900 underline underline-offset-2" href="/signup">
          Create one
        </Link>
      </p>
    </form>
  );
}