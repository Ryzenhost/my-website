import { Activity, Bot, Coins, Gift, Link2, Users } from "lucide-react"
import { Badge, Card, CardHeader, EmptyState, PageHeader, StatCard } from "@/components/card"
import { requireAdmin } from "@/lib/auth"
import { isBotActive, readDb } from "@/lib/db"
import { formatCoin, formatDate } from "@/lib/form"
import { TX_LABEL } from "@/lib/tx"

export default async function AdminPage() {
  await requireAdmin()
  const db = await readDb()
  const now = Date.now()
  const day = now - 86400_000
  const running = db.bots.filter((b) => isBotActive(b, now)).length
  const totalCoins = db.users.reduce((s, u) => s + u.coins, 0)
  const spent24h = db.transactions.filter((t) => t.type === "bot" && t.createdAt > day).reduce((s, t) => s - t.amount, 0)
  const links24h = db.transactions.filter((t) => t.type === "link" && t.createdAt > day).length
  const gifts24h = db.transactions.filter((t) => t.type === "giftcode" && t.createdAt > day).length
  const userName = new Map(db.users.map((u) => [u.id, u.username]))

  return (
    <>
      <PageHeader title="Thống kê hệ thống" description="Tổng quan toàn bộ website." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Người dùng" value={db.users.length} icon={<Users className="size-5" />} />
        <StatCard label="Bot đang chạy" value={`${running}/${db.bots.length}`} icon={<Activity className="size-5" />} tone="green" />
        <StatCard label="Tổng coin người dùng" value={formatCoin(totalCoins)} icon={<Coins className="size-5" />} tone="coin" />
        <StatCard label="Coin tiêu cho bot (24h)" value={formatCoin(spent24h)} icon={<Bot className="size-5" />} />
        <StatCard label="Lượt vượt link (24h)" value={links24h} icon={<Link2 className="size-5" />} />
        <StatCard label="Lượt nhập giftcode (24h)" value={gifts24h} icon={<Gift className="size-5" />} />
      </div>

      <Card className="overflow-hidden">
        <CardHeader title="Giao dịch mới nhất" />
        {db.transactions.length === 0 ? (
          <EmptyState title="Chưa có giao dịch" description="Hoạt động sẽ xuất hiện ở đây." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-surface-2 text-left text-xs text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Thời gian</th>
                  <th className="px-4 py-3 font-medium">Người dùng</th>
                  <th className="px-4 py-3 font-medium">Loại</th>
                  <th className="px-4 py-3 font-medium">Nội dung</th>
                  <th className="px-4 py-3 text-right font-medium">Coin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {db.transactions.slice(0, 30).map((t) => (
                  <tr key={t.id}>
                    <td className="whitespace-nowrap px-4 py-3 text-muted">{formatDate(t.createdAt)}</td>
                    <td className="px-4 py-3 text-foreground">{userName.get(t.userId) ?? "(đã xóa)"}</td>
                    <td className="px-4 py-3">
                      <Badge tone={TX_LABEL[t.type].tone}>{TX_LABEL[t.type].label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted">{t.note}</td>
                    <td className={`whitespace-nowrap px-4 py-3 text-right font-mono font-semibold ${t.amount >= 0 ? "text-primary" : "text-danger"}`}>
                      {t.amount >= 0 ? "+" : ""}
                      {formatCoin(t.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  )
}
