import { cn } from "@/lib/utils/cn";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 disabled:pointer-events-none disabled:opacity-50",
        {
          "bg-teal-600 text-white shadow-sm hover:bg-teal-700 active:scale-[0.98]":
            variant === "primary",
          "bg-slate-100 text-slate-700 hover:bg-slate-200": variant === "secondary",
          "text-slate-600 hover:bg-slate-100": variant === "ghost",
          "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50":
            variant === "outline",
        },
        {
          "px-3 py-1.5 text-sm": size === "sm",
          "px-5 py-2.5 text-sm": size === "md",
          "px-6 py-3 text-base": size === "lg",
        },
        className,
      )}
      {...props}
    />
  );
}
