"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { addTransaction, isBotActive, mutateDb, newId } from "@/lib/db"
import { getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth"
import type { FormState } from "@/lib/form"

async function getUserId() {
  const user = await getCurrentUser()
  if (!user) throw new Error("Unauthorized")
  return user.id
}

const HOST_RE = /^[a-zA-Z0-9.-]{1,253}$/
const IGN_RE = /^[a-zA-Z0-9_]{3,16}$/
const MAX_BOTS_PER_USER = 10
const MAX_HOURS = 720

export async function createBotAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const userId = await getUserId()
  const name = String(formData.get("name") ?? "").trim().slice(0, 40)
  const host = String(formData.get("host") ?? "").trim()
  const port = Number(formData.get("port") ?? 25565)
  const version = String(formData.get("version") ?? "auto").trim().slice(0, 12)
  const username = String(formData.get("username") ?? "").trim()
  const planId = String(formData.get("planId") ?? "")

  if (!name) return { error: "Vui lòng nhập tên bot" }
  if (!HOST_RE.test(host)) return { error: "Địa chỉ server không hợp lệ" }
  if (!Number.isInteger(port) || port < 1 || port > 65535) return { error: "Port không hợp lệ" }
  if (!IGN_RE.test(username)) return { error: "Tên in-game 3-16 ký tự, chỉ chữ, số và _" }

  const result = await mutateDb((db) => {
    const plan = db.plans.find((p) => p.id === planId && p.active)
    if (!plan) return { error: "Gói không hợp lệ" }
    if (db.bots.filter((b) => b.userId === userId).length >= MAX_BOTS_PER_USER)
      return { error: `Tối đa ${MAX_BOTS_PER_USER} bot mỗi tài khoản` }
    db.bots.unshift({
      id: newId(),
      userId,
      name,
      host,
      port,
      version,
      username,
      planId: plan.id,
      status: "stopped",
      expiresAt: null,
      createdAt: Date.now(),
    })
    return { success: "Đã tạo bot. Hãy gia hạn giờ để bot bắt đầu AFK." }
  })
  revalidatePath("/bots")
  return result
}

export async function extendBotAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const userId = await getUserId()
  const botId = String(formData.get("botId") ?? "")
  const hours = Number(formData.get("hours") ?? 0)
  if (!Number.isInteger(hours) || hours < 1 || hours > 168) return { error: "Số giờ từ 1 đến 168" }

  const result = await mutateDb((db) => {
    const bot = db.bots.find((b) => b.id === botId && b.userId === userId)
    if (!bot) return { error: "Không tìm thấy bot" }
    const plan = db.plans.find((p) => p.id === bot.planId)
    if (!plan) return { error: "Gói của bot không còn tồn tại" }
    const user = db.users.find((u) => u.id === userId)
    if (!user) return { error: "Unauthorized" }
    const cost = plan.pricePerHour * hours
    if (user.coins < cost) return { error: `Không đủ coin. Cần ${cost} coin.` }

    const now = Date.now()
    const base = isBotActive(bot, now) ? (bot.expiresAt as number) : now
    const newExpiry = base + hours * 3600_000
    if (newExpiry - now > MAX_HOURS * 3600_000) return { error: `Tối đa ${MAX_HOURS} giờ còn lại` }

    user.coins -= cost
    bot.expiresAt = newExpiry
    bot.status = "running"
    addTransaction(db, userId, -cost, "bot", `Duy trì bot "${bot.name}" ${hours}h (${plan.name})`)
    return { success: `Đã gia hạn ${hours}h, trừ ${cost} coin.` }
  })
  revalidatePath("/bots")
  revalidatePath("/dashboard")
  return result
}

export async function toggleBotAction(botId: string) {
  const userId = await getUserId()
  await mutateDb((db) => {
    const bot = db.bots.find((b) => b.id === botId && b.userId === userId)
    if (!bot) return
    if (bot.status === "running") {
      bot.status = "stopped"
    } else if (bot.expiresAt && bot.expiresAt > Date.now()) {
      bot.status = "running"
    }
  })
  revalidatePath("/bots")
}

export async function deleteBotAction(botId: string) {
  const userId = await getUserId()
  await mutateDb((db) => {
    db.bots = db.bots.filter((b) => !(b.id === botId && b.userId === userId))
  })
  revalidatePath("/bots")
}

export async function redeemGiftcodeAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const userId = await getUserId()
  const code = String(formData.get("code") ?? "").trim().toUpperCase()
  if (!code) return { error: "Vui lòng nhập giftcode" }

  const result = await mutateDb((db) => {
    const gift = db.giftcodes.find((g) => g.code === code)
    if (!gift || !gift.active) return { error: "Giftcode không tồn tại hoặc đã bị vô hiệu" }
    if (gift.expiresAt && gift.expiresAt < Date.now()) return { error: "Giftcode đã hết hạn" }
    if (gift.usedBy.includes(userId)) return { error: "Bạn đã sử dụng giftcode này" }
    if (gift.usedBy.length >= gift.maxUses) return { error: "Giftcode đã hết lượt sử dụng" }
    const user = db.users.find((u) => u.id === userId)
    if (!user) return { error: "Unauthorized" }
    gift.usedBy.push(userId)
    user.coins += gift.reward
    addTransaction(db, userId, gift.reward, "giftcode", `Nhập giftcode ${gift.code}`)
    return { success: `Nhận thành công ${gift.reward} coin!` }
  })
  revalidatePath("/giftcode")
  revalidatePath("/dashboard")
  return result
}

function extractShortUrl(json: unknown): string | null {
  if (!json || typeof json !== "object") return null
  const o = json as Record<string, unknown>
  for (const key of ["shortenedUrl", "shortened_url", "short_url", "shortUrl", "short", "url", "link"]) {
    const v = o[key]
    if (typeof v === "string" && /^https?:\/\//.test(v)) return v
  }
  if (o.data && typeof o.data === "object") return extractShortUrl(o.data)
  return null
}

export async function startLinkTaskAction(taskId: string): Promise<{ error?: string; url?: string }> {
  const userId = await getUserId()
  const h = await headers()
  const proto = h.get("x-forwarded-proto") ?? "https"
  const host = h.get("x-forwarded-host") ?? h.get("host")
  const origin = `${proto}://${host}`

  const prepared = await mutateDb((db) => {
    const task = db.linkTasks.find((t) => t.id === taskId && t.active)
    if (!task) return { error: "Nhiệm vụ không tồn tại" }
    const now = Date.now()
    const mine = db.linkClaims.filter((c) => c.userId === userId && c.taskId === taskId && c.claimedAt)
    const today = mine.filter((c) => now - (c.claimedAt as number) < 86400_000)
    if (today.length >= task.dailyLimit) return { error: "Bạn đã đạt giới hạn hôm nay cho nhiệm vụ này" }
    const last = Math.max(0, ...mine.map((c) => c.claimedAt as number))
    const wait = last + task.cooldownMinutes * 60_000 - now
    if (wait > 0) return { error: `Vui lòng chờ ${Math.ceil(wait / 60_000)} phút nữa` }
    db.linkClaims = db.linkClaims.filter((c) => c.claimedAt || now - c.createdAt < 86400_000)
    const token = newId() + newId()
    db.linkClaims.push({ token, userId, taskId, createdAt: now, claimedAt: null })
    return { token, apiTemplate: task.apiTemplate }
  })
  if ("error" in prepared) return { error: prepared.error }

  const destination = `${origin}/claim/${prepared.token}`
  if (!prepared.apiTemplate) return { url: destination }

  try {
    const apiUrl = prepared.apiTemplate.replace("{url}", encodeURIComponent(destination))
    const res = await fetch(apiUrl, { cache: "no-store", signal: AbortSignal.timeout(10_000) })
    const text = await res.text()
    let short: string | null = null
    try {
      short = extractShortUrl(JSON.parse(text))
    } catch {
      if (/^https?:\/\/\S+$/.test(text.trim())) short = text.trim()
    }
    if (!short) return { error: "Không tạo được link rút gọn, thử lại sau" }
    return { url: short }
  } catch {
    return { error: "Dịch vụ rút gọn link đang lỗi, thử lại sau" }
  }
}

export async function changePasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const userId = await getUserId()
  const current = String(formData.get("current") ?? "")
  const next = String(formData.get("next") ?? "")
  if (next.length < 6) return { error: "Mật khẩu mới tối thiểu 6 ký tự" }
  return mutateDb((db) => {
    const user = db.users.find((u) => u.id === userId)
    if (!user || !verifyPassword(current, user.passwordHash)) return { error: "Mật khẩu hiện tại không đúng" }
    user.passwordHash = hashPassword(next)
    return { success: "Đã đổi mật khẩu" }
  })
}
