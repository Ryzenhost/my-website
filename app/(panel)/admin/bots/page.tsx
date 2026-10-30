import { Square, Trash2 } from "lucide-react"
import { adminDeleteBotAction, adminStopBotAction } from "@/app/actions/admin"
import { ActionButton } from "@/components/action-form"
import { Card, EmptyState, PageHeader } from "@/components/card"
import { BotStatus, remaining } from "@/components/bot-status"
import { requireAdmin } from "@/lib/auth"
import { readDb } from "@/lib/db"

export default async function AdminBotsPage() {
  await requireAdmin()
  const db = await readDb()
  const userName = new Map(db.users.map((u) => [u.id, u.username]))
  const planName = new Map(db.plans.map((p) => [p.id, p.name]))

  return (
    <>
      <PageHeader title="Tất cả bot" description={`${db.bots.length} bot trên toàn hệ thống.`} />
      <Card className="overflow-hidden">
        {db.bots.length === 0 ? (
          <EmptyState title="Chưa có bot" description="Bot người dùng tạo sẽ hiển thị ở đây." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-surface-2 text-left text-xs text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Bot</th>
                  <th className="px-4 py-3 font-medium">Chủ</th>
                  <th className="px-4 py-3 font-medium">Server</th>
                  <th className="px-4 py-3 font-medium">Gói</th>
                  <th className="px-4 py-3 font-medium">Trạng thái</th>
                  <th className="px-4 py-3 font-medium">Còn lại</th>
                  <th className="px-4 py-3 text-right font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {db.bots.map((b) => (
                  <tr key={b.id}>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{b.name}</span>
                        <span className="font-mono text-xs text-muted">{b.username}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-foreground">{userName.get(b.userId) ?? "-"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted">
                      {b.host}:{b.port}
                    </td>
                    <td className="px-4 py-3 text-muted">{planName.get(b.planId) ?? "-"}</td>
                    <td className="px-4 py-3">
                      <BotStatus bot={b} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-foreground">{remaining(b.expiresAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <ActionButton action={adminStopBotAction.bind(null, b.id)} label="Dừng bot">
                          <Square className="size-3.5" />
                        </ActionButton>
                        <ActionButton action={adminDeleteBotAction.bind(null, b.id)} variant="danger" label="Xóa bot" confirmText="Xóa bot này?">
                          <Trash2 className="size-3.5" />
                        </ActionButton>
                      </div>
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
