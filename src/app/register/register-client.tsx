"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useLanguage } from "@/lib/i18n/language-context";
import { GoogleAuthSection } from "@/components/auth/google-auth-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function RegisterClient({ googleEnabled }: { googleEnabled: boolean }) {
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirm) {
      setError(t.auth.passwordMismatch);
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      if (res.status === 409) {
        setError(t.auth.emailTaken);
      } else if (data.error?.includes("8")) {
        setError(t.auth.passwordTooShort);
      } else {
        setError(t.auth.registerError);
      }
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email: form.email.trim().toLowerCase(),
      password: form.password,
      callbackUrl: "/cases",
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(t.auth.registerSuccessLoginFailed);
      return;
    }

    window.location.href = result?.url ?? "/cases";
  };

  return (
    <div className="animate-in mx-auto flex max-w-md flex-col items-center justify-center py-12">
      <Card className="w-full">
        <CardContent className="space-y-6 p-8">
          <div className="text-center">
            <p className="section-label mb-2">{t.auth.label}</p>
            <h1 className="text-2xl font-bold text-heading">{t.auth.registerTitle}</h1>
            <p className="mt-2 text-sm text-muted">{t.auth.registerSubtitle}</p>
          </div>

          {error && (
            <div className="error-panel rounded-lg p-3 text-center text-sm">{error}</div>
          )}

          <GoogleAuthSection googleEnabled={googleEnabled} callbackUrl="/cases" />

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-[var(--border)]" />
            <span className="text-xs text-muted">{t.auth.or}</span>
            <div className="h-px flex-1 bg-[var(--border)]" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="mb-1 block text-start text-sm font-semibold text-heading">
                {t.auth.name}
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-heading outline-none focus:border-[var(--brand)]"
                placeholder={t.auth.namePlaceholder}
                data-testid="register-name"
              />
            </div>
            <div>
              <label className="mb-1 block text-start text-sm font-semibold text-heading">
                {t.auth.email}
              </label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-heading outline-none focus:border-[var(--brand)]"
                data-testid="register-email"
              />
            </div>
            <div>
              <label className="mb-1 block text-start text-sm font-semibold text-heading">
                {t.auth.password}
              </label>
              <input
                required
                type="password"
                minLength={8}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-heading outline-none focus:border-[var(--brand)]"
                data-testid="register-password"
              />
            </div>
            <div>
              <label className="mb-1 block text-start text-sm font-semibold text-heading">
                {t.auth.confirmPassword}
              </label>
              <input
                required
                type="password"
                minLength={8}
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-heading outline-none focus:border-[var(--brand)]"
                data-testid="register-confirm"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "..." : t.auth.createAccount}
            </Button>
          </form>

          <p className="text-center text-sm text-muted">
            {t.auth.hasAccount}{" "}
            <Link href="/login" className="font-semibold text-[var(--brand)] hover:underline">
              {t.auth.signIn}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
