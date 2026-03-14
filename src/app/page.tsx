import { SecretForm } from "@/components/SecretForm";
import { AppHeader } from "@/components/AppHeader";

export default function Home() {
  return (
    <main className="min-h-screen">
      <AppHeader />

      <section className="mx-auto w-full max-w-160 px-4 py-20 pb-32">
        <SecretForm />
      </section>
    </main>
  );
}