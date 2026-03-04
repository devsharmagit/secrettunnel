import Link from "next/link";
import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
          <CardDescription>This page is only available to signed-in users.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="font-medium">Name:</span> {session.user.name ?? "No name set"}
          </p>
          <p>
            <span className="font-medium">Email:</span> {session.user.email ?? "No email set"}
          </p>
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button asChild variant="outline">
            <Link href="/">Go to landing page</Link>
          </Button>
          <SignOutButton />
        </CardFooter>
      </Card>
    </main>
  );
}