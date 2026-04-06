import { SignUpPage } from "@/components/auth/sign-up-form";

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
    
        <SignUpPage callbackUrl={callbackUrl} />
    
  );
}
