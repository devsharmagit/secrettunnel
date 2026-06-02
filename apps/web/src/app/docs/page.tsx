import type { Metadata } from "next";
import { DocsHomePage } from "@/components/docs/DocsHomePage";

export const metadata: Metadata = {
  title: "Documentation — SecretTunnel",
  description:
    "Get started with SecretTunnel. Learn how to use the CLI to push and pull encrypted secrets in seconds.",
};

export default function DocsPage() {
  return <DocsHomePage />;
}
