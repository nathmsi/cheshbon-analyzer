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
        <main className="app-main mx-auto min-h-[calc(100vh-7rem)] px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
        <Footer />
      </LanguageProvider>
    </ThemeProvider>
  );
}
