"use client"

import clsx from "clsx"
import { useFormStatus } from "react-dom"
import { Loader2 } from "lucide-react"
import type { FormState } from "@/lib/form"

export const cn = clsx

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger"
  size?: "sm" | "md"
}

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" ? "h-8 px-3 text-xs" : "h-10 px-4 text-sm",
        variant === "primary" && "bg-primary text-primary-foreground hover:bg-primary/90",
        variant === "secondary" && "border border-border bg-surface-2 text-foreground hover:bg-border",
        variant === "ghost" && "text-muted hover:bg-surface-2 hover:text-foreground",
        variant === "danger" && "border border-danger/30 bg-danger/10 text-danger hover:bg-danger/20",
        className,
      )}
      {...props}
    />
  )
}

export function SubmitButton({ children, ...props }: ButtonProps) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending || props.disabled} {...props}>
      {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </Button>
  )
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
        className,
      )}
      {...props}
    />
  )
}

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
        className,
      )}
      {...props}
    />
  )
}

export function Field({ label, htmlFor, hint, children }: { label: string; htmlFor: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  )
}

export function FormMessage({ state }: { state: FormState }) {
  if (!state?.error && !state?.success) return null
  return (
    <p
      role={state.error ? "alert" : "status"}
      className={cn(
        "rounded-lg border px-3 py-2 text-sm",
        state.error ? "border-danger/30 bg-danger/10 text-danger" : "border-primary/30 bg-primary/10 text-primary",
      )}
    >
      {state.error ?? state.success}
    </p>
  )
}
