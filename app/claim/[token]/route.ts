import { NextResponse, type NextRequest } from "next/server"
import { addTransaction, mutateDb } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const user = await getCurrentUser()
  const back = (status: string) => NextResponse.redirect(new URL(`/earn?status=${status}`, req.url))
  if (!user) return NextResponse.redirect(new URL("/login", req.url))

  const status = await mutateDb((db) => {
    const claim = db.linkClaims.find((c) => c.token === token)
    if (!claim || claim.userId !== user.id) return "invalid"
    if (claim.claimedAt) return "used"
    const task = db.linkTasks.find((t) => t.id === claim.taskId)
    if (!task) return "invalid"
    if (Date.now() - claim.createdAt < db.settings.minClaimSeconds * 1000) return "fast"
    const u = db.users.find((x) => x.id === user.id)
    if (!u) return "invalid"
    claim.claimedAt = Date.now()
    u.coins += task.reward
    addTransaction(db, u.id, task.reward, "link", `Vượt link "${task.name}"`)
    return `ok-${task.reward}`
  })
  return back(status)
}
