"use client";

import { ThemeProvider } from "@/lib/theme/theme-context";
import { LanguageProvider } from "@/lib/i18n/language-context";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Header />
        <main className="mx-auto min-h-[calc(100vh-8rem)] max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
          {children}
        </main>
        <Footer />
      </LanguageProvider>
    </ThemeProvider>
  );
}
