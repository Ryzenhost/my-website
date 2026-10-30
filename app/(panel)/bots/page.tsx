import { Pause, Play, Trash2 } from "lucide-react"
import { createBotAction, deleteBotAction, extendBotAction, toggleBotAction } from "@/app/actions/user"
import { ActionButton, ActionForm } from "@/components/action-form"
import { Badge, Card, CardHeader, EmptyState, PageHeader } from "@/components/card"
import { BotStatus, remaining } from "@/components/bot-status"
import { Field, Input, Select, SubmitButton } from "@/components/ui"
import { requireUser } from "@/lib/auth"
import { readDb } from "@/lib/db"
import { formatCoin } from "@/lib/form"

const VERSIONS = ["auto", "1.21.4", "1.21.1", "1.20.4", "1.20.1", "1.19.4", "1.18.2", "1.17.1", "1.16.5", "1.12.2", "1.8.9"]

export default async function BotsPage() {
  const user = await requireUser()
  const db = await readDb()
  const bots = db.bots.filter((b) => b.userId === user.id)
  const plans = db.plans.filter((p) => p.active)

  return (
    <>
      <PageHeader title="Bot AFK" description="Tạo bot, chọn gói và gia hạn theo giờ. Coin bị trừ ngay khi gia hạn." />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
        <Card>
          <CardHeader title="Tạo bot mới" />
          <div className="p-4 md:p-5">
            <ActionForm action={createBotAction}>
              <Field label="Tên bot" htmlFor="name">
                <Input id="name" name="name" placeholder="Bot farm sắt" maxLength={40} required />
              </Field>
              <div className="grid grid-cols-[1fr_96px] gap-3">
                <Field label="Địa chỉ server" htmlFor="host">
                  <Input id="host" name="host" placeholder="play.server.vn" required />
                </Field>
                <Field label="Port" htmlFor="port">
                  <Input id="port" name="port" type="number" defaultValue={25565} min={1} max={65535} required />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Tên in-game" htmlFor="username">
                  <Input id="username" name="username" placeholder="AfkBot_01" pattern="[A-Za-z0-9_]{3,16}" required />
                </Field>
                <Field label="Phiên bản" htmlFor="version">
                  <Select id="version" name="version" defaultValue="auto">
                    {VERSIONS.map((v) => (
                      <option key={v} value={v}>
                        {v === "auto" ? "Tự động" : v}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
              <Field label="Gói" htmlFor="planId" hint="Chỉ hỗ trợ server offline-mode (cracked).">
                <Select id="planId" name="planId" required>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - {p.pricePerHour} coin/giờ
                    </option>
                  ))}
                </Select>
              </Field>
              <SubmitButton>Tạo bot</SubmitButton>
            </ActionForm>
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          {bots.length === 0 && (
            <Card>
              <EmptyState title="Bạn chưa có bot nào" description="Điền form bên cạnh để tạo bot đầu tiên." />
            </Card>
          )}
          {bots.map((bot) => {
            const plan = db.plans.find((p) => p.id === bot.planId)
            return (
              <Card key={bot.id}>
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border p-4 md:p-5">
                  <div className="flex min-w-0 flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <h2 className="truncate font-semibold text-foreground">{bot.name}</h2>
                      <BotStatus bot={bot} />
                    </div>
                    <p className="truncate font-mono text-xs text-muted">
                      {bot.username} @ {bot.host}:{bot.port} - {bot.version}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ActionButton action={toggleBotAction.bind(null, bot.id)} label={bot.status === "running" ? "Tạm dừng" : "Chạy"}>
                      {bot.status === "running" ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
                      {bot.status === "running" ? "Dừng" : "Chạy"}
                    </ActionButton>
                    <ActionButton
                      action={deleteBotAction.bind(null, bot.id)}
                      variant="danger"
                      label="Xóa bot"
                      confirmText="Xóa bot này? Thời gian còn lại sẽ không được hoàn coin."
                    >
                      <Trash2 className="size-3.5" />
                    </ActionButton>
                  </div>
                </div>
                <div className="flex flex-col gap-4 p-4 md:flex-row md:items-end md:justify-between md:p-5">
                  <dl className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex flex-col">
                      <dt className="text-xs text-muted">Gói</dt>
                      <dd className="font-medium text-foreground">{plan?.name ?? "-"}</dd>
                    </div>
                    <div className="flex flex-col">
                      <dt className="text-xs text-muted">Giá</dt>
                      <dd className="font-mono font-medium text-coin">{plan ? `${formatCoin(plan.pricePerHour)}/h` : "-"}</dd>
                    </div>
                    <div className="flex flex-col">
                      <dt className="text-xs text-muted">Còn lại</dt>
                      <dd className="font-mono font-medium text-foreground">{remaining(bot.expiresAt)}</dd>
                    </div>
                  </dl>
                  <ActionForm action={extendBotAction} className="flex-row items-end gap-2" resetOnSuccess={false}>
                    <input type="hidden" name="botId" value={bot.id} />
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor={`hours-${bot.id}`} className="text-xs text-muted">
                        Gia hạn (giờ)
                      </label>
                      <Select id={`hours-${bot.id}`} name="hours" defaultValue="1" className="w-28">
                        {[1, 2, 3, 6, 12, 24, 48, 72, 168].map((h) => (
                          <option key={h} value={h}>
                            {h}h{plan ? ` - ${h * plan.pricePerHour}c` : ""}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <SubmitButton>Gia hạn</SubmitButton>
                  </ActionForm>
                </div>
                {bot.worker?.message && (
                  <p className="border-t border-border px-4 py-2.5 font-mono text-xs text-muted md:px-5">
                    <Badge tone="muted">log</Badge> {bot.worker.message}
                  </p>
                )}
              </Card>
            )
          })}
        </div>
      </div>
    </>
  )
}
