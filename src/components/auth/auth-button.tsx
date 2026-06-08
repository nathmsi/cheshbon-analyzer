"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { LogIn, LogOut, User } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { Button } from "@/components/ui/button";

export function AuthButton() {
  const { t, isRtl } = useLanguage();
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <span className="hidden text-xs text-muted sm:inline">
        {isRtl ? "..." : "..."}
      </span>
    );
  }

  if (!session?.user) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => signIn("google", { callbackUrl: "/cases" })}
        data-testid="sign-in-btn"
        className="hidden sm:inline-flex"
      >
        <LogIn className="h-4 w-4" />
        {t.auth.signIn}
      </Button>
    );
  }

  const label = session.user.name ?? session.user.email ?? t.auth.account;

  return (
    <div className="flex items-center gap-2">
      <span
        className="hidden max-w-[140px] truncate text-xs font-medium text-muted lg:inline"
        title={label}
      >
        <User className="me-1 inline h-3.5 w-3.5" />
        {label}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => signOut({ callbackUrl: "/" })}
        data-testid="sign-out-btn"
        title={t.auth.signOut}
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">{t.auth.signOut}</span>
      </Button>
    </div>
  );
}
