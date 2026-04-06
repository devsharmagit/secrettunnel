import { SignInForm } from "@/components/auth/sign-in-form";

type SearchParamValue = string | string[] | undefined;

type SignInPageProps = {
  searchParams?: Promise<Record<string, SearchParamValue>>;
};

function toSingleParam(value: SearchParamValue): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export default async function Page({ searchParams }: SignInPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const callbackUrl = toSingleParam(resolvedSearchParams.callbackUrl) ?? "/dashboard";

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-xl font-semibold text-zinc-900">Welcome back</h1>
        <p className="mb-6 text-sm text-zinc-600">Sign in to continue to your dashboard.</p>
        <SignInForm callbackUrl={callbackUrl} />
      </div>
    </main>
  );
}
