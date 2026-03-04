import Link from "next/link";

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

export default async function Home() {
  const session = await auth();
  const isSignedIn = Boolean(session?.user);

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>SecretTunnel</CardTitle>
          <CardDescription>
            Basic landing page to verify signup, signin, and dashboard access.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {isSignedIn
              ? `Signed in as ${session?.user?.email ?? "user"}.`
              : "You are not signed in."}
          </p>
        </CardContent>
        <CardFooter className="flex gap-3">
          {isSignedIn ? (
            <Button asChild>
              <Link href="/dashboard">Go to dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild>
                <Link href="/signup">Sign up</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/signin">Sign in</Link>
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </main>
  );
}