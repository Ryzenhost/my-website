import Link from "next/link"
import { redirect } from "next/navigation"
import { Logo } from "@/components/logo"
import { getCurrentUser } from "@/lib/auth"
import { readDb } from "@/lib/db"

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  if (await getCurrentUser()) redirect("/dashboard")
  const db = await readDb()
  return (
    <div className="pixel-grid flex min-h-dvh flex-col items-center justify-center gap-8 px-4 py-10">
      <Link href="/">
        <Logo name={db.settings.siteName} />
      </Link>
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-2xl shadow-black/40">{children}</div>
    </div>
  )
}
