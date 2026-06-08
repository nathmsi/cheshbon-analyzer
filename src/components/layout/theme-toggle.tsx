"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme/theme-context";
import { cn } from "@/lib/utils/cn";

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      data-testid="theme-toggle"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)]",
        "bg-[var(--surface)] text-[var(--muted)] shadow-sm transition-all",
        "hover:border-teal-500/40 hover:text-teal-600 dark:hover:text-teal-400",
      )}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
