import { Power, Trash2 } from "lucide-react"
import { createGiftcodeAction, deleteGiftcodeAction, toggleGiftcodeAction } from "@/app/actions/admin"
import { ActionButton, ActionForm } from "@/components/action-form"
import { Badge, Card, CardHeader, EmptyState, PageHeader } from "@/components/card"
import { Field, Input, SubmitButton } from "@/components/ui"
import { requireAdmin } from "@/lib/auth"
import { readDb } from "@/lib/db"
import { formatCoin, formatDate } from "@/lib/form"

export default async function AdminGiftcodesPage() {
  await requireAdmin()
  const db = await readDb()
  const now = Date.now()

  return (
    <>
      <PageHeader title="Giftcode" description="Tạo mã quà tặng coin cho người dùng." />
      <Card>
        <CardHeader title="Tạo giftcode" description="Để trống mã để tạo ngẫu nhiên. Hạn dùng 0 = không giới hạn." />
        <div className="p-4 md:p-5">
          <ActionForm action={createGiftcodeAction} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_120px_120px_120px_auto] lg:items-end">
            <Field label="Mã" htmlFor="code">
              <Input id="code" name="code" placeholder="SUMMER2026" className="font-mono uppercase" />
            </Field>
            <Field label="Coin" htmlFor="reward">
              <Input id="reward" name="reward" type="number" min={1} defaultValue={50} required />
            </Field>
            <Field label="Lượt dùng" htmlFor="maxUses">
              <Input id="maxUses" name="maxUses" type="number" min={1} defaultValue={100} required />
            </Field>
            <Field label="Hạn (ngày)" htmlFor="days">
              <Input id="days" name="days" type="number" min={0} defaultValue={0} />
            </Field>
            <SubmitButton>Tạo mã</SubmitButton>
          </ActionForm>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {db.giftcodes.length === 0 ? (
          <EmptyState title="Chưa có giftcode" description="Tạo mã đầu tiên ở trên." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-surface-2 text-left text-xs text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Mã</th>
                  <th className="px-4 py-3 text-right font-medium">Coin</th>
                  <th className="px-4 py-3 font-medium">Đã dùng</th>
                  <th className="px-4 py-3 font-medium">Hết hạn</th>
                  <th className="px-4 py-3 font-medium">Trạng thái</th>
                  <th className="px-4 py-3 text-right font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {db.giftcodes.map((g) => {
                  const expired = g.expiresAt !== null && g.expiresAt < now
                  return (
                    <tr key={g.id}>
                      <td className="px-4 py-3 font-mono font-semibold text-foreground">{g.code}</td>
                      <td className="px-4 py-3 text-right font-mono text-coin">{formatCoin(g.reward)}</td>
                      <td className="px-4 py-3 text-muted">
                        {g.usedBy.length}/{g.maxUses}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted">{g.expiresAt ? formatDate(g.expiresAt) : "Không"}</td>
                      <td className="px-4 py-3">
                        {expired ? <Badge tone="red">Hết hạn</Badge> : g.active ? <Badge tone="green">Hoạt động</Badge> : <Badge>Tắt</Badge>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1.5">
                          <ActionButton action={toggleGiftcodeAction.bind(null, g.id)} label={g.active ? "Tắt" : "Bật"}>
                            <Power className="size-3.5" />
                          </ActionButton>
                          <ActionButton action={deleteGiftcodeAction.bind(null, g.id)} variant="danger" label="Xóa" confirmText={`Xóa giftcode ${g.code}?`}>
                            <Trash2 className="size-3.5" />
                          </ActionButton>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  )
}
