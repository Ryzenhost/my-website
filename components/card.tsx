import clsx from "clsx"

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={clsx("rounded-xl border border-border bg-surface", className)}>{children}</section>
}

export function CardHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border p-4 md:p-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {description && <p className="text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <header className="flex flex-col gap-1">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">{title}</h1>
      {description && <p className="text-sm text-muted text-pretty">{description}</p>}
    </header>
  )
}

export function Badge({ tone = "muted", children }: { tone?: "muted" | "green" | "amber" | "red"; children: React.ReactNode }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium",
        tone === "muted" && "border-border bg-surface-2 text-muted",
        tone === "green" && "border-primary/30 bg-primary/10 text-primary",
        tone === "amber" && "border-coin/30 bg-coin/10 text-coin",
        tone === "red" && "border-danger/30 bg-danger/10 text-danger",
      )}
    >
      {children}
    </span>
  )
}

export function StatCard({ label, value, icon, tone = "default" }: { label: string; value: React.ReactNode; icon: React.ReactNode; tone?: "default" | "coin" | "green" }) {
  return (
    <Card className="flex items-center gap-4 p-4">
      <div
        className={clsx(
          "flex size-11 shrink-0 items-center justify-center rounded-lg",
          tone === "coin" ? "bg-coin/10 text-coin" : tone === "green" ? "bg-primary/10 text-primary" : "bg-surface-2 text-foreground",
        )}
      >
        {icon}
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="text-xs text-muted">{label}</span>
        <span className="truncate font-mono text-xl font-semibold text-foreground">{value}</span>
      </div>
    </Card>
  )
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center gap-1 px-4 py-10 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="text-sm text-muted">{description}</p>
    </div>
  )
}
