import { Gift } from "lucide-react"
import { redeemGiftcodeAction } from "@/app/actions/user"
import { ActionForm } from "@/components/action-form"
import { Card, CardHeader, EmptyState, PageHeader } from "@/components/card"
import { Input, SubmitButton } from "@/components/ui"
import { requireUser } from "@/lib/auth"
import { readDb } from "@/lib/db"
import { formatCoin, formatDate } from "@/lib/form"

export default async function GiftcodePage() {
  const user = await requireUser()
  const db = await readDb()
  const used = db.transactions.filter((t) => t.userId === user.id && t.type === "giftcode").slice(0, 20)

  return (
    <>
      <PageHeader title="Giftcode" description="Nhập giftcode từ sự kiện, fanpage, Discord để nhận coin." />
      <Card className="mx-auto w-full max-w-lg p-6">
        <div className="mb-5 flex flex-col items-center gap-3 text-center">
          <span className="flex size-14 items-center justify-center rounded-xl bg-coin/10 text-coin">
            <Gift className="size-7" aria-hidden />
          </span>
          <h2 className="text-lg font-semibold text-foreground">Nhập giftcode</h2>
        </div>
        <ActionForm action={redeemGiftcodeAction}>
          <label htmlFor="code" className="sr-only">
            Giftcode
          </label>
          <Input id="code" name="code" placeholder="VD: WELCOME" className="h-12 text-center font-mono text-lg uppercase tracking-widest" required />
          <SubmitButton className="h-11">Nhận thưởng</SubmitButton>
        </ActionForm>
      </Card>

      <Card>
        <CardHeader title="Giftcode đã dùng" />
        {used.length === 0 ? (
          <EmptyState title="Chưa dùng giftcode nào" description="Lịch sử nhập code sẽ hiển thị ở đây." />
        ) : (
          <ul className="divide-y divide-border">
            {used.map((t) => (
              <li key={t.id} className="flex items-center justify-between px-4 py-3 md:px-5">
                <div className="flex flex-col">
                  <span className="text-sm text-foreground">{t.note}</span>
                  <span className="text-xs text-muted">{formatDate(t.createdAt)}</span>
                </div>
                <span className="font-mono text-sm font-semibold text-primary">+{formatCoin(t.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  )
}
