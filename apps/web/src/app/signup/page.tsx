import { SignUpForm } from "@/components/auth/sign-up-form";

type SearchParamValue = string | string[] | undefined;

type SignUpPageProps = {
  searchParams?: Promise<Record<string, SearchParamValue>>;
};

function toSingleParam(value: SearchParamValue): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export default async function Page({ searchParams }: SignUpPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const callbackUrl = toSingleParam(resolvedSearchParams.callbackUrl) ?? "/dashboard";

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-xl font-semibold text-zinc-900">Create account</h1>
        <p className="mb-6 text-sm text-zinc-600">Create an account to manage and share secrets.</p>
        <SignUpForm callbackUrl={callbackUrl} />
      </div>
    </main>
  );
}
