import Link from "next/link"
import { Bot, Coins, Gift, Link2, Megaphone, Activity } from "lucide-react"
import { Card, CardHeader, EmptyState, PageHeader, StatCard } from "@/components/card"
import { BotStatus, remaining } from "@/components/bot-status"
import { requireUser } from "@/lib/auth"
import { isBotActive, readDb } from "@/lib/db"
import { formatCoin, formatDate } from "@/lib/form"

export default async function DashboardPage() {
  const user = await requireUser()
  const db = await readDb()
  const bots = db.bots.filter((b) => b.userId === user.id)
  const running = bots.filter((b) => isBotActive(b)).length
  const txs = db.transactions.filter((t) => t.userId === user.id).slice(0, 6)
  const spent = db.transactions.filter((t) => t.userId === user.id && t.type === "bot").reduce((s, t) => s - t.amount, 0)

  return (
    <>
      <PageHeader title={`Xin chào, ${user.username}`} description="Tổng quan tài khoản và bot của bạn." />

      {db.settings.announcement && (
        <div className="flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
          <Megaphone className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
          <p className="text-sm text-foreground text-pretty">{db.settings.announcement}</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Số dư" value={formatCoin(user.coins)} icon={<Coins className="size-5" />} tone="coin" />
        <StatCard label="Bot đang chạy" value={`${running}/${bots.length}`} icon={<Activity className="size-5" />} tone="green" />
        <StatCard label="Coin đã dùng" value={formatCoin(spent)} icon={<Bot className="size-5" />} />
        <StatCard label="Nhiệm vụ link" value={db.linkTasks.filter((t) => t.active).length} icon={<Link2 className="size-5" />} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <QuickLink href="/bots" icon={<Bot className="size-5" />} title="Tạo bot AFK" text="Thêm bot mới vào server của bạn" />
        <QuickLink href="/earn" icon={<Link2 className="size-5" />} title="Vượt link" text="Kiếm coin miễn phí" />
        <QuickLink href="/giftcode" icon={<Gift className="size-5" />} title="Nhập giftcode" text="Nhận coin từ sự kiện" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Bot của bạn" action={<Link href="/bots" className="text-sm text-primary hover:underline">Xem tất cả</Link>} />
          {bots.length === 0 ? (
            <EmptyState title="Chưa có bot" description="Tạo bot đầu tiên để bắt đầu AFK." />
          ) : (
            <ul className="divide-y divide-border">
              {bots.slice(0, 5).map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-3 px-4 py-3 md:px-5">
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium text-foreground">{b.name}</span>
                    <span className="truncate font-mono text-xs text-muted">
                      {b.host}:{b.port} - còn {remaining(b.expiresAt)}
                    </span>
                  </div>
                  <BotStatus bot={b} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title="Giao dịch gần đây" action={<Link href="/history" className="text-sm text-primary hover:underline">Lịch sử</Link>} />
          {txs.length === 0 ? (
            <EmptyState title="Chưa có giao dịch" description="Các thay đổi coin sẽ hiển thị ở đây." />
          ) : (
            <ul className="divide-y divide-border">
              {txs.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 px-4 py-3 md:px-5">
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm text-foreground">{t.note}</span>
                    <span className="text-xs text-muted">{formatDate(t.createdAt)}</span>
                  </div>
                  <span className={`font-mono text-sm font-semibold ${t.amount >= 0 ? "text-primary" : "text-danger"}`}>
                    {t.amount >= 0 ? "+" : ""}
                    {formatCoin(t.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  )
}

function QuickLink({ href, icon, title, text }: { href: string; icon: React.ReactNode; title: string; text: string }) {
  return (
    <Link href={href} className="group flex items-center gap-4 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary/50">
      <span className="flex size-10 items-center justify-center rounded-lg bg-surface-2 text-primary group-hover:bg-primary group-hover:text-primary-foreground">
        {icon}
      </span>
      <span className="flex flex-col">
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <span className="text-xs text-muted">{text}</span>
      </span>
    </Link>
  )
}
