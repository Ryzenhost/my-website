import { Power } from "lucide-react"
import { savePlanAction, togglePlanAction } from "@/app/actions/admin"
import { ActionButton, ActionForm } from "@/components/action-form"
import { Badge, Card, CardHeader, PageHeader } from "@/components/card"
import { Field, Input, SubmitButton } from "@/components/ui"
import { requireAdmin } from "@/lib/auth"
import { readDb, type Plan } from "@/lib/db"

export default async function AdminPlansPage() {
  await requireAdmin()
  const db = await readDb()

  return (
    <>
      <PageHeader title="Gói giá" description="Giá coin trừ mỗi giờ duy trì bot." />
      <div className="grid gap-4 lg:grid-cols-2">
        {db.plans.map((p) => (
          <Card key={p.id}>
            <CardHeader
              title={p.name}
              action={
                <div className="flex items-center gap-2">
                  {p.active ? <Badge tone="green">Đang bán</Badge> : <Badge>Ẩn</Badge>}
                  <ActionButton action={togglePlanAction.bind(null, p.id)} label={p.active ? "Ẩn gói" : "Hiện gói"}>
                    <Power className="size-3.5" />
                  </ActionButton>
                </div>
              }
            />
            <div className="p-4 md:p-5">
              <PlanForm plan={p} />
            </div>
          </Card>
        ))}
        <Card>
          <CardHeader title="Thêm gói mới" />
          <div className="p-4 md:p-5">
            <PlanForm />
          </div>
        </Card>
      </div>
    </>
  )
}

function PlanForm({ plan }: { plan?: Plan }) {
  const key = plan?.id ?? "new"
  return (
    <ActionForm action={savePlanAction} resetOnSuccess={!plan}>
      {plan && <input type="hidden" name="id" value={plan.id} />}
      <div className="grid grid-cols-[1fr_120px] gap-3">
        <Field label="Tên gói" htmlFor={`name-${key}`}>
          <Input id={`name-${key}`} name="name" defaultValue={plan?.name} required />
        </Field>
        <Field label="Coin/giờ" htmlFor={`price-${key}`}>
          <Input id={`price-${key}`} name="pricePerHour" type="number" min={0} defaultValue={plan?.pricePerHour ?? 5} required />
        </Field>
      </div>
      <Field label="Mô tả" htmlFor={`desc-${key}`}>
        <Input id={`desc-${key}`} name="description" defaultValue={plan?.description} maxLength={120} />
      </Field>
      <SubmitButton variant={plan ? "secondary" : "primary"}>{plan ? "Lưu" : "Thêm gói"}</SubmitButton>
    </ActionForm>
  )
}
