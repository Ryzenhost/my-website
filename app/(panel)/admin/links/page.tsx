import { Power, Trash2 } from "lucide-react"
import { createLinkTaskAction, deleteLinkTaskAction, toggleLinkTaskAction } from "@/app/actions/admin"
import { ActionButton, ActionForm } from "@/components/action-form"
import { Badge, Card, CardHeader, EmptyState, PageHeader } from "@/components/card"
import { Field, Input, SubmitButton } from "@/components/ui"
import { requireAdmin } from "@/lib/auth"
import { readDb } from "@/lib/db"

export default async function AdminLinksPage() {
  await requireAdmin()
  const db = await readDb()

  return (
    <>
      <PageHeader title="Nhiệm vụ vượt link" description="Kết nối API rút gọn link (link4m, yeumoney, linkvertise...) để người dùng kiếm coin." />
      <Card>
        <CardHeader
          title="Thêm nhiệm vụ"
          description="API URL phải chứa {url}, ví dụ: https://link4m.co/api-shorten/v2?api=TOKEN&url={url}. Để trống để dùng link trực tiếp (chỉ để thử)."
        />
        <div className="p-4 md:p-5">
          <ActionForm action={createLinkTaskAction} className="grid gap-3 md:grid-cols-2">
            <Field label="Tên nhiệm vụ" htmlFor="name">
              <Input id="name" name="name" placeholder="Link4m" required />
            </Field>
            <Field label="API rút gọn" htmlFor="apiTemplate">
              <Input id="apiTemplate" name="apiTemplate" placeholder="https://.../api?token=XXX&url={url}" className="font-mono text-xs" />
            </Field>
            <div className="grid grid-cols-3 gap-3 md:col-span-2">
              <Field label="Coin thưởng" htmlFor="reward">
                <Input id="reward" name="reward" type="number" min={1} defaultValue={10} required />
              </Field>
              <Field label="Chờ (phút)" htmlFor="cooldownMinutes">
                <Input id="cooldownMinutes" name="cooldownMinutes" type="number" min={0} defaultValue={30} />
              </Field>
              <Field label="Giới hạn/ngày" htmlFor="dailyLimit">
                <Input id="dailyLimit" name="dailyLimit" type="number" min={1} defaultValue={10} />
              </Field>
            </div>
            <SubmitButton className="md:col-span-2 md:justify-self-start">Thêm nhiệm vụ</SubmitButton>
          </ActionForm>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {db.linkTasks.length === 0 ? (
          <EmptyState title="Chưa có nhiệm vụ" description="Thêm nhiệm vụ đầu tiên ở trên." />
        ) : (
          <ul className="divide-y divide-border">
            {db.linkTasks.map((t) => {
              const total = db.linkClaims.filter((c) => c.taskId === t.id && c.claimedAt).length
              return (
                <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-5">
                  <div className="flex min-w-0 flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{t.name}</span>
                      {t.active ? <Badge tone="green">Bật</Badge> : <Badge>Tắt</Badge>}
                      {!t.apiTemplate && <Badge tone="amber">Không có API</Badge>}
                    </div>
                    <span className="text-xs text-muted">
                      +{t.reward} coin - chờ {t.cooldownMinutes}p - {t.dailyLimit} lần/ngày - {total} lượt hoàn thành
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <ActionButton action={toggleLinkTaskAction.bind(null, t.id)} label={t.active ? "Tắt" : "Bật"}>
                      <Power className="size-3.5" />
                    </ActionButton>
                    <ActionButton action={deleteLinkTaskAction.bind(null, t.id)} variant="danger" label="Xóa" confirmText="Xóa nhiệm vụ này?">
                      <Trash2 className="size-3.5" />
                    </ActionButton>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Card>
    </>
  )
}
