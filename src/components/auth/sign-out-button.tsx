"use client";

import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SignOutButtonProps = {
  className?: string;
};

export function SignOutButton({ className }: SignOutButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn(
        "h-7.5 border-[#2a2a2a] bg-[#161616] px-2.5 text-[12px] text-[#8a8a8a] hover:border-[#d4a84b] hover:bg-[#1f1f1f] hover:text-[#d4a84b]",
        className
      )}
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      Logout
    </Button>
  );
}