import Link from "next/link";
import { redirect } from "next/navigation";

import { SignUpForm } from "@/components/auth/sign-up-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";

export default async function SignUpPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign up</CardTitle>
          <CardDescription>Create a basic account to verify auth is working.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SignUpForm />
          <Link className="text-sm underline" href="/">
            Back to landing page
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}