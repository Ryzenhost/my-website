import { Badge } from "./card"
import { isBotActive, type Bot } from "@/lib/db"

export function remaining(expiresAt: number | null, now = Date.now()) {
  if (!expiresAt || expiresAt <= now) return "Hết giờ"
  const mins = Math.floor((expiresAt - now) / 60_000)
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h > 0 ? `${h}h ${m}p` : `${m} phút`
}

export function BotStatus({ bot }: { bot: Bot }) {
  const now = Date.now()
  if (!isBotActive(bot, now)) {
    return <Badge tone="muted">{bot.expiresAt && bot.expiresAt > now ? "Tạm dừng" : "Đã dừng"}</Badge>
  }
  const fresh = bot.worker && now - bot.worker.lastSeen < 90_000
  if (fresh && bot.worker?.online) return <Badge tone="green">Đang AFK</Badge>
  if (fresh) return <Badge tone="red">Lỗi kết nối</Badge>
  return <Badge tone="amber">Chờ worker</Badge>
}
