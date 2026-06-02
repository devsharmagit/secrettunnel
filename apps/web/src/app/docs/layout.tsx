import type { Metadata } from "next";
import { DocsLayout } from "@/components/docs/DocsLayout";

export const metadata: Metadata = {
  title: "SecretTunnel Docs",
  description:
    "Complete documentation for SecretTunnel CLI and web app — zero-knowledge secret sharing.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DocsLayout>{children}</DocsLayout>;
}
