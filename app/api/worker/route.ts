import { NextResponse, type NextRequest } from "next/server"
import crypto from "node:crypto"
import { isBotActive, mutateDb, readDb } from "@/lib/db"

export const dynamic = "force-dynamic"

async function authorized(req: NextRequest) {
  const key = req.headers.get("x-worker-key") ?? ""
  const db = await readDb()
  const expected = process.env.WORKER_KEY ?? db.settings.workerKey
  const a = Buffer.from(key)
  const b = Buffer.from(expected)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

export async function GET(req: NextRequest) {
  if (!(await authorized(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const db = await readDb()
  const now = Date.now()
  const bots = db.bots
    .filter((b) => isBotActive(b, now))
    .map(({ id, host, port, version, username, expiresAt }) => ({ id, host, port, version, username, expiresAt }))
  return NextResponse.json({ bots })
}

type StatusReport = { id: string; online: boolean; message: string }

export async function POST(req: NextRequest) {
  if (!(await authorized(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = (await req.json().catch(() => null)) as { reports?: StatusReport[] } | null
  const reports = Array.isArray(body?.reports) ? body.reports.slice(0, 500) : []
  await mutateDb((db) => {
    for (const r of reports) {
      const bot = db.bots.find((b) => b.id === r.id)
      if (bot) bot.worker = { online: Boolean(r.online), message: String(r.message ?? "").slice(0, 200), lastSeen: Date.now() }
    }
  })
  return NextResponse.json({ ok: true })
}
