import { Coins, Clock, Repeat } from "lucide-react"
import { Card, EmptyState, PageHeader } from "@/components/card"
import { LinkTaskButton } from "@/components/link-task-button"
import { requireUser } from "@/lib/auth"
import { readDb } from "@/lib/db"

export default async function EarnPage({ searchParams }: { searchParams: Promise<{ status?: string; reward?: string }> }) {
  const user = await requireUser()
  const { status, reward } = await searchParams
  const db = await readDb()
  const tasks = db.linkTasks.filter((t) => t.active)
  const now = Date.now()

  const messages: Record<string, { tone: "ok" | "err"; text: string }> = {
    ok: { tone: "ok", text: `Vượt link thành công! Bạn nhận được ${reward ?? 0} coin.` },
    used: { tone: "err", text: "Link này đã được sử dụng." },
    invalid: { tone: "err", text: "Link không hợp lệ hoặc đã hết hạn." },
    fast: { tone: "err", text: "Bạn vượt link quá nhanh, vui lòng làm lại đúng quy trình." },
  }
  const msg = status ? messages[status] : undefined

  return (
    <>
      <PageHeader title="Vượt link kiếm coin" description="Bấm vượt link, hoàn thành trang rút gọn và quay về để nhận coin tự động." />

      {msg && (
        <p
          role="status"
          className={`rounded-lg border px-4 py-3 text-sm ${msg.tone === "ok" ? "border-primary/30 bg-primary/10 text-primary" : "border-danger/30 bg-danger/10 text-danger"}`}
        >
          {msg.text}
        </p>
      )}

      {tasks.length === 0 ? (
        <Card>
          <EmptyState title="Chưa có nhiệm vụ" description="Admin chưa thêm nhiệm vụ vượt link nào." />
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {tasks.map((t) => {
            const claims = db.linkClaims.filter((c) => c.userId === user.id && c.taskId === t.id && c.claimedAt)
            const today = claims.filter((c) => now - (c.claimedAt as number) < 86400_000).length
            return (
              <Card key={t.id} className="flex flex-col gap-4 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <h2 className="font-semibold text-foreground">{t.name}</h2>
                    <p className="flex items-center gap-1 font-mono text-lg font-semibold text-coin">
                      <Coins className="size-4" aria-hidden />+{t.reward}
                    </p>
                  </div>
                  <LinkTaskButton taskId={t.id} />
                </div>
                <div className="flex flex-wrap gap-4 border-t border-border pt-3 text-xs text-muted">
                  <span className="flex items-center gap-1.5">
                    <Repeat className="size-3.5" aria-hidden />
                    Hôm nay: {today}/{t.dailyLimit}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="size-3.5" aria-hidden />
                    Chờ {t.cooldownMinutes} phút giữa các lần
                  </span>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </>
  )
}
