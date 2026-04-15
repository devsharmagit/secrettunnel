import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin?callbackUrl=/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#131314]">
      <AppHeader maxWidthClass="max-w-6xl" session={session} />
      <DashboardClient user={session.user} />
    </main>
  );
}
