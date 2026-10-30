import { RefreshCw } from "lucide-react"
import { rotateWorkerKeyAction, saveSettingsAction } from "@/app/actions/admin"
import { ActionButton, ActionForm } from "@/components/action-form"
import { Card, CardHeader, PageHeader } from "@/components/card"
import { Field, Input, SubmitButton } from "@/components/ui"
import { requireAdmin } from "@/lib/auth"
import { readDb } from "@/lib/db"

export default async function AdminSettingsPage() {
  await requireAdmin()
  const { settings } = await readDb()
  const workerKey = process.env.WORKER_KEY ?? settings.workerKey

  return (
    <>
      <PageHeader title="Cài đặt web" description="Tên web, thông báo, thưởng đăng ký và kết nối worker bot." />
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Chung" />
          <div className="p-4 md:p-5">
            <ActionForm action={saveSettingsAction} resetOnSuccess={false}>
              <Field label="Tên website" htmlFor="siteName">
                <Input id="siteName" name="siteName" defaultValue={settings.siteName} maxLength={40} required />
              </Field>
              <Field label="Thông báo bảng điều khiển" htmlFor="announcement">
                <textarea
                  id="announcement"
                  name="announcement"
                  defaultValue={settings.announcement}
                  maxLength={300}
                  rows={3}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Coin thưởng đăng ký" htmlFor="registerBonus">
                  <Input id="registerBonus" name="registerBonus" type="number" min={0} defaultValue={settings.registerBonus} />
                </Field>
                <Field label="Thời gian vượt link tối thiểu (giây)" htmlFor="minClaimSeconds">
                  <Input id="minClaimSeconds" name="minClaimSeconds" type="number" min={0} defaultValue={settings.minClaimSeconds} />
                </Field>
              </div>
              <SubmitButton>Lưu cài đặt</SubmitButton>
            </ActionForm>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Worker bot"
            description="Bot Minecraft chạy trên VPS/máy riêng (thư mục worker/). Vercel không giữ được kết nối TCP lâu dài."
            action={
              !process.env.WORKER_KEY && (
                <ActionButton action={rotateWorkerKeyAction} label="Tạo key mới" confirmText="Tạo key mới? Worker cũ sẽ mất kết nối.">
                  <RefreshCw className="size-3.5" />
                </ActionButton>
              )
            }
          />
          <div className="flex flex-col gap-4 p-4 md:p-5">
            <Field label="WORKER_KEY" htmlFor="workerKey">
              <Input id="workerKey" readOnly value={workerKey} className="font-mono text-xs" />
            </Field>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-foreground">Chạy worker</p>
              <pre className="overflow-x-auto rounded-lg border border-border bg-background p-3 font-mono text-xs leading-relaxed text-muted">
                {`cd worker
npm install
PANEL_URL=https://ten-web.vercel.app \\
WORKER_KEY=${workerKey} \\
node index.js`}
              </pre>
            </div>
          </div>
        </Card>
      </div>
    </>
  )
}
