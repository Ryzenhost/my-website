import { AppShell } from "@/components/app-shell"
import { requireUser } from "@/lib/auth"
import { readDb } from "@/lib/db"

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser()
  const db = await readDb()
  return (
    <AppShell siteName={db.settings.siteName} username={user.username} role={user.role} coins={user.coins}>
      {children}
    </AppShell>
  )
}
