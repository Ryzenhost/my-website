import { changePasswordAction } from "@/app/actions/user"
import { ActionForm } from "@/components/action-form"
import { Badge, Card, CardHeader, PageHeader } from "@/components/card"
import { Field, Input, SubmitButton } from "@/components/ui"
import { requireUser } from "@/lib/auth"
import { formatCoin, formatDate } from "@/lib/form"

export default async function AccountPage() {
  const user = await requireUser()
  return (
    <>
      <PageHeader title="Tài khoản" description="Thông tin và bảo mật tài khoản." />
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Thông tin" />
          <dl className="divide-y divide-border text-sm">
            <Row label="Tên đăng nhập" value={user.username} />
            <Row label="Email" value={user.email} />
            <Row label="Vai trò" value={<Badge tone={user.role === "admin" ? "amber" : "muted"}>{user.role === "admin" ? "Admin" : "Thành viên"}</Badge>} />
            <Row label="Số dư" value={<span className="font-mono text-coin">{formatCoin(user.coins)} coin</span>} />
            <Row label="Ngày tham gia" value={formatDate(user.createdAt)} />
          </dl>
        </Card>
        <Card>
          <CardHeader title="Đổi mật khẩu" />
          <div className="p-4 md:p-5">
            <ActionForm action={changePasswordAction}>
              <Field label="Mật khẩu hiện tại" htmlFor="current">
                <Input id="current" name="current" type="password" autoComplete="current-password" required />
              </Field>
              <Field label="Mật khẩu mới" htmlFor="next">
                <Input id="next" name="next" type="password" autoComplete="new-password" minLength={6} required />
              </Field>
              <SubmitButton>Cập nhật</SubmitButton>
            </ActionForm>
          </div>
        </Card>
      </div>
    </>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-5">
      <dt className="text-muted">{label}</dt>
      <dd className="truncate text-right text-foreground">{value}</dd>
    </div>
  )
}
