import type { Metadata } from "next";
import { CLIDocsPage } from "@/components/docs/CLIDocsPage";

export const metadata: Metadata = {
  title: "CLI Reference — SecretTunnel Docs",
  description:
    "Full CLI reference for secrettnl: push, pull commands with all flags, examples, error handling, and configuration.",
};

export default function CLIPage() {
  return <CLIDocsPage />;
}
