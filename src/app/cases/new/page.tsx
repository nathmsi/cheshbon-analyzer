"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/language-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NewCasePage() {
  const { t, isRtl } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    clientName: "",
    clientIdNum: "",
    taxYear: new Date().getFullYear() - 1,
    notes: "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(form),
      });
      if (res.status === 401) {
        router.push("/login?callbackUrl=/cases/new");
        return;
      }
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      router.push(`/cases/${data.id}`);
    } catch {
      alert(t.cases.createError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in mx-auto max-w-lg space-y-6">
      <div>
        <Link href="/cases" className="text-sm text-muted hover:text-[var(--brand)]">
          ← {t.cases.back}
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-heading">{t.cases.newCase}</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-heading">
                {t.cases.clientName} *
              </label>
              <input
                required
                value={form.clientName}
                onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-heading outline-none focus:border-[var(--brand)]"
                placeholder={isRtl ? "יוסי כהן" : "John Cohen"}
                data-testid="client-name-input"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-heading">
                {t.fields.employeeId}
              </label>
              <input
                value={form.clientIdNum}
                onChange={(e) => setForm({ ...form, clientIdNum: e.target.value })}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-heading outline-none focus:border-[var(--brand)]"
                placeholder="123456782"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-heading">
                {t.cases.taxYear} *
              </label>
              <input
                required
                type="number"
                min={2020}
                max={2030}
                value={form.taxYear}
                onChange={(e) => setForm({ ...form, taxYear: Number(e.target.value) })}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-heading outline-none focus:border-[var(--brand)]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-heading">
                {t.cases.notes}
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-heading outline-none focus:border-[var(--brand)]"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "..." : t.cases.create}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
