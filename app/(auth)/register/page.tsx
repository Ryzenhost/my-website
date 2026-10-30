import type { Metadata } from "next"
import { RegisterForm } from "@/components/auth-forms"
import { readDb } from "@/lib/db"

export const metadata: Metadata = { title: "Đăng ký - AFK Bot Panel" }

export default async function RegisterPage() {
  const db = await readDb()
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-foreground">Tạo tài khoản</h1>
        <p className="text-sm text-muted">Nhận ngay {db.settings.registerBonus} coin khi đăng ký.</p>
      </div>
      <RegisterForm firstUser={db.users.length === 0} />
    </div>
  )
}
