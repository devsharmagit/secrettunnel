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
  const verified = toSingleParam(resolvedSearchParams.verified);
  const verificationStatus =
    verified === "success" || verified === "invalid" || verified === "missing"
      ? verified
      : undefined;

  return (
    
        <SignInForm callbackUrl={callbackUrl} verificationStatus={verificationStatus} />
    
  );
}
