import { Ban, ShieldCheck, ShieldOff, Trash2, UserCheck } from "lucide-react"
import { adjustCoinsAction, deleteUserAction, setUserRoleAction, toggleBanAction } from "@/app/actions/admin"
import { ActionButton, ActionForm } from "@/components/action-form"
import { Badge, Card, CardHeader, PageHeader } from "@/components/card"
import { Field, Input, Select, SubmitButton } from "@/components/ui"
import { requireAdmin } from "@/lib/auth"
import { readDb } from "@/lib/db"
import { formatCoin, formatDate } from "@/lib/form"

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const admin = await requireAdmin()
  const { q = "" } = await searchParams
  const db = await readDb()
  const query = q.trim().toLowerCase()
  const users = db.users.filter((u) => !query || u.username.toLowerCase().includes(query) || u.email.includes(query))

  return (
    <>
      <PageHeader title="Quản lý người dùng" description={`${db.users.length} tài khoản. Cộng/trừ coin, phân quyền, khóa tài khoản.`} />

      <Card>
        <CardHeader title="Cộng / trừ coin" description="Nhập số âm để trừ coin." />
        <div className="p-4 md:p-5">
          <ActionForm action={adjustCoinsAction} className="grid gap-3 md:grid-cols-[1fr_140px_1fr_auto] md:items-end">
            <Field label="Người dùng" htmlFor="userId">
              <Select id="userId" name="userId" required>
                {db.users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.username} ({formatCoin(u.coins)})
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Số coin" htmlFor="amount">
              <Input id="amount" name="amount" type="number" placeholder="100" required />
            </Field>
            <Field label="Ghi chú" htmlFor="note">
              <Input id="note" name="note" placeholder="Nạp thủ công" maxLength={100} />
            </Field>
            <SubmitButton>Xác nhận</SubmitButton>
          </ActionForm>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader
          title="Danh sách"
          action={
            <form className="w-48">
              <label htmlFor="q" className="sr-only">
                Tìm kiếm
              </label>
              <Input id="q" name="q" defaultValue={q} placeholder="Tìm tên / email" className="h-8" />
            </form>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-surface-2 text-left text-xs text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Tài khoản</th>
                <th className="px-4 py-3 font-medium">Vai trò</th>
                <th className="px-4 py-3 text-right font-medium">Coin</th>
                <th className="px-4 py-3 font-medium">Bot</th>
                <th className="px-4 py-3 font-medium">Ngày tạo</th>
                <th className="px-4 py-3 text-right font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => {
                const self = u.id === admin.id
                return (
                  <tr key={u.id}>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{u.username}</span>
                        <span className="text-xs text-muted">{u.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <Badge tone={u.role === "admin" ? "amber" : "muted"}>{u.role === "admin" ? "Admin" : "User"}</Badge>
                        {u.banned && <Badge tone="red">Bị khóa</Badge>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-coin">{formatCoin(u.coins)}</td>
                    <td className="px-4 py-3 text-muted">{db.bots.filter((b) => b.userId === u.id).length}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      {self ? (
                        <p className="text-right text-xs text-muted">Bạn</p>
                      ) : (
                        <div className="flex justify-end gap-1.5">
                          <ActionButton
                            action={setUserRoleAction.bind(null, u.id, u.role === "admin" ? "user" : "admin")}
                            label={u.role === "admin" ? "Gỡ quyền admin" : "Cấp quyền admin"}
                          >
                            {u.role === "admin" ? <ShieldOff className="size-3.5" /> : <ShieldCheck className="size-3.5" />}
                          </ActionButton>
                          <ActionButton action={toggleBanAction.bind(null, u.id)} label={u.banned ? "Mở khóa" : "Khóa tài khoản"}>
                            {u.banned ? <UserCheck className="size-3.5" /> : <Ban className="size-3.5" />}
                          </ActionButton>
                          <ActionButton
                            action={deleteUserAction.bind(null, u.id)}
                            variant="danger"
                            label="Xóa tài khoản"
                            confirmText={`Xóa tài khoản ${u.username} và toàn bộ bot?`}
                          >
                            <Trash2 className="size-3.5" />
                          </ActionButton>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}
