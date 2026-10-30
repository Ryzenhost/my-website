"use client"

import { useActionState, useEffect, useRef } from "react"
import { useFormStatus } from "react-dom"
import { Loader2 } from "lucide-react"
import type { FormState } from "@/lib/form"
import { cn, FormMessage } from "./ui"

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>
  children: React.ReactNode
  className?: string
  resetOnSuccess?: boolean
}

export function ActionForm({ action, children, className, resetOnSuccess = true }: Props) {
  const [state, formAction] = useActionState(action, undefined)
  const ref = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.success && resetOnSuccess) ref.current?.reset()
  }, [state, resetOnSuccess])

  return (
    <form ref={ref} action={formAction} className={cn("flex flex-col gap-4", className)}>
      {children}
      <FormMessage state={state} />
    </form>
  )
}

type ActionButtonProps = {
  action: () => Promise<void>
  children: React.ReactNode
  confirmText?: string
  variant?: "secondary" | "danger" | "ghost" | "primary"
  label?: string
}

export function ActionButton({ action, children, confirmText, variant = "secondary", label }: ActionButtonProps) {
  return (
    <form action={action}>
      <InnerButton confirmText={confirmText} variant={variant} label={label}>
        {children}
      </InnerButton>
    </form>
  )
}

function InnerButton({
  children,
  confirmText,
  variant,
  label,
}: {
  children: React.ReactNode
  confirmText?: string
  variant: "secondary" | "danger" | "ghost" | "primary"
  label?: string
}) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      aria-label={label}
      title={label}
      disabled={pending}
      onClick={(e) => {
        if (confirmText && !window.confirm(confirmText)) e.preventDefault()
      }}
      className={cn(
        "inline-flex h-8 items-center justify-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors disabled:opacity-50",
        variant === "primary" && "bg-primary text-primary-foreground hover:bg-primary/90",
        variant === "secondary" && "border border-border bg-surface-2 text-foreground hover:bg-border",
        variant === "danger" && "border border-danger/30 bg-danger/10 text-danger hover:bg-danger/20",
        variant === "ghost" && "text-muted hover:bg-surface-2 hover:text-foreground",
      )}
    >
      {pending ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : children}
    </button>
  )
}
