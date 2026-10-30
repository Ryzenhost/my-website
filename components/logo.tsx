import { Bot } from "lucide-react"

export function Logo({ name = "AFK Bot Panel" }: { name?: string }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-[inset_0_-3px_0_rgb(0_0_0/0.25)]">
        <Bot className="size-4.5" aria-hidden />
      </span>
      <span className="font-semibold tracking-tight text-foreground">{name}</span>
    </span>
  )
}
