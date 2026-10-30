import { Badge, Card, EmptyState, PageHeader } from "@/components/card"
import { requireUser } from "@/lib/auth"
import { readDb } from "@/lib/db"
import { formatCoin, formatDate } from "@/lib/form"
import { TX_LABEL } from "@/lib/tx"

export default async function HistoryPage() {
  const user = await requireUser()
  const db = await readDb()
  const txs = db.transactions.filter((t) => t.userId === user.id).slice(0, 200)

  return (
    <>
      <PageHeader title="Lịch sử coin" description="200 giao dịch gần nhất của bạn." />
      <Card className="overflow-hidden">
        {txs.length === 0 ? (
          <EmptyState title="Chưa có giao dịch" description="Hãy nhập giftcode hoặc vượt link để nhận coin." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-surface-2 text-left text-xs text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Thời gian</th>
                  <th className="px-4 py-3 font-medium">Loại</th>
                  <th className="px-4 py-3 font-medium">Nội dung</th>
                  <th className="px-4 py-3 text-right font-medium">Coin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {txs.map((t) => (
                  <tr key={t.id}>
                    <td className="whitespace-nowrap px-4 py-3 text-muted">{formatDate(t.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Badge tone={TX_LABEL[t.type].tone}>{TX_LABEL[t.type].label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-foreground">{t.note}</td>
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
