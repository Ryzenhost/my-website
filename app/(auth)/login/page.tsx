import type { Metadata } from "next"
import { LoginForm } from "@/components/auth-forms"

export const metadata: Metadata = { title: "Đăng nhập - AFK Bot Panel" }

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-foreground">Đăng nhập</h1>
        <p className="text-sm text-muted">Quản lý bot AFK của bạn.</p>
      </div>
      <LoginForm />
    </div>
  )
}
