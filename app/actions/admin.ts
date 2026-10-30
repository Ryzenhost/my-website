"use server"

import crypto from "node:crypto"
import { revalidatePath } from "next/cache"
import { addTransaction, mutateDb, newId } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import type { FormState } from "@/lib/form"

async function assertAdmin() {
  const user = await getCurrentUser()
  if (!user || user.role !== "admin") throw new Error("Forbidden")
  return user
}

const toInt = (v: FormDataEntryValue | null, fallback = 0) => {
  const n = Number(v)
  return Number.isFinite(n) ? Math.trunc(n) : fallback
}

export async function adjustCoinsAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await assertAdmin()
  const userId = String(formData.get("userId") ?? "")
  const amount = toInt(formData.get("amount"))
  const note = String(formData.get("note") ?? "").trim().slice(0, 100)
  if (!amount || Math.abs(amount) > 10_000_000) return { error: "Số coin không hợp lệ" }
  const result = await mutateDb((db) => {
    const user = db.users.find((u) => u.id === userId)
    if (!user) return { error: "Không tìm thấy người dùng" }
    user.coins = Math.max(0, user.coins + amount)
    addTransaction(db, user.id, amount, "admin", note || `Admin ${admin.username} điều chỉnh`)
    return { success: `Đã ${amount > 0 ? "cộng" : "trừ"} ${Math.abs(amount)} coin cho ${user.username}` }
  })
  revalidatePath("/admin/users")
  return result
}

export async function setUserRoleAction(userId: string, role: "admin" | "user") {
  const admin = await assertAdmin()
  if (userId === admin.id) return
  await mutateDb((db) => {
    const user = db.users.find((u) => u.id === userId)
    if (user) user.role = role
  })
  revalidatePath("/admin/users")
}

export async function toggleBanAction(userId: string) {
  const admin = await assertAdmin()
  if (userId === admin.id) return
  await mutateDb((db) => {
    const user = db.users.find((u) => u.id === userId)
    if (!user) return
    user.banned = !user.banned
    if (user.banned) db.bots.forEach((b) => b.userId === userId && (b.status = "stopped"))
  })
  revalidatePath("/admin/users")
}

export async function deleteUserAction(userId: string) {
  const admin = await assertAdmin()
  if (userId === admin.id) return
  await mutateDb((db) => {
    db.users = db.users.filter((u) => u.id !== userId)
    db.bots = db.bots.filter((b) => b.userId !== userId)
  })
  revalidatePath("/admin/users")
}

export async function adminStopBotAction(botId: string) {
  await assertAdmin()
  await mutateDb((db) => {
    const bot = db.bots.find((b) => b.id === botId)
    if (bot) bot.status = "stopped"
  })
  revalidatePath("/admin/bots")
}

export async function adminDeleteBotAction(botId: string) {
  await assertAdmin()
  await mutateDb((db) => {
    db.bots = db.bots.filter((b) => b.id !== botId)
  })
  revalidatePath("/admin/bots")
}

export async function createGiftcodeAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await assertAdmin()
  let code = String(formData.get("code") ?? "").trim().toUpperCase()
  if (!code) code = crypto.randomBytes(4).toString("hex").toUpperCase()
  const reward = toInt(formData.get("reward"))
  const maxUses = toInt(formData.get("maxUses"), 1)
  const days = toInt(formData.get("days"))
  if (!/^[A-Z0-9_-]{3,32}$/.test(code)) return { error: "Mã 3-32 ký tự (A-Z, 0-9, _ -)" }
  if (reward < 1) return { error: "Phần thưởng phải lớn hơn 0" }
  if (maxUses < 1) return { error: "Số lượt dùng phải lớn hơn 0" }
  const result = await mutateDb((db) => {
    if (db.giftcodes.some((g) => g.code === code)) return { error: "Mã đã tồn tại" }
    db.giftcodes.unshift({
      id: newId(),
      code,
      reward,
      maxUses,
      usedBy: [],
      expiresAt: days > 0 ? Date.now() + days * 86400_000 : null,
      active: true,
      createdAt: Date.now(),
    })
    return { success: `Đã tạo giftcode ${code}` }
  })
  revalidatePath("/admin/giftcodes")
  return result
}

export async function toggleGiftcodeAction(id: string) {
  await assertAdmin()
  await mutateDb((db) => {
    const g = db.giftcodes.find((x) => x.id === id)
    if (g) g.active = !g.active
  })
  revalidatePath("/admin/giftcodes")
}

export async function deleteGiftcodeAction(id: string) {
  await assertAdmin()
  await mutateDb((db) => {
    db.giftcodes = db.giftcodes.filter((g) => g.id !== id)
  })
  revalidatePath("/admin/giftcodes")
}

export async function createLinkTaskAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await assertAdmin()
  const name = String(formData.get("name") ?? "").trim().slice(0, 60)
  const reward = toInt(formData.get("reward"))
  const apiTemplate = String(formData.get("apiTemplate") ?? "").trim()
  const cooldownMinutes = Math.max(0, toInt(formData.get("cooldownMinutes"), 30))
  const dailyLimit = Math.max(1, toInt(formData.get("dailyLimit"), 10))
  if (!name) return { error: "Vui lòng nhập tên nhiệm vụ" }
  if (reward < 1) return { error: "Phần thưởng phải lớn hơn 0" }
  if (apiTemplate && (!/^https:\/\//.test(apiTemplate) || !apiTemplate.includes("{url}")))
    return { error: "API phải bắt đầu bằng https:// và chứa {url}" }
  await mutateDb((db) => {
    db.linkTasks.unshift({
      id: newId(),
      name,
      reward,
      apiTemplate,
      cooldownMinutes,
      dailyLimit,
      active: true,
      createdAt: Date.now(),
    })
  })
  revalidatePath("/admin/links")
  return { success: "Đã thêm nhiệm vụ vượt link" }
}

export async function toggleLinkTaskAction(id: string) {
  await assertAdmin()
  await mutateDb((db) => {
    const t = db.linkTasks.find((x) => x.id === id)
    if (t) t.active = !t.active
  })
  revalidatePath("/admin/links")
}

export async function deleteLinkTaskAction(id: string) {
  await assertAdmin()
  await mutateDb((db) => {
    db.linkTasks = db.linkTasks.filter((t) => t.id !== id)
  })
  revalidatePath("/admin/links")
}

export async function savePlanAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await assertAdmin()
  const id = String(formData.get("id") ?? "")
  const name = String(formData.get("name") ?? "").trim().slice(0, 40)
  const pricePerHour = toInt(formData.get("pricePerHour"))
  const description = String(formData.get("description") ?? "").trim().slice(0, 120)
  if (!name) return { error: "Vui lòng nhập tên gói" }
  if (pricePerHour < 0) return { error: "Giá không hợp lệ" }
  await mutateDb((db) => {
    const existing = db.plans.find((p) => p.id === id)
    if (existing) Object.assign(existing, { name, pricePerHour, description })
    else db.plans.push({ id: newId(), name, pricePerHour, description, active: true })
  })
  revalidatePath("/admin/plans")
  return { success: id ? "Đã cập nhật gói" : "Đã thêm gói mới" }
}

export async function togglePlanAction(id: string) {
  await assertAdmin()
  await mutateDb((db) => {
    const p = db.plans.find((x) => x.id === id)
    if (p) p.active = !p.active
  })
  revalidatePath("/admin/plans")
}

export async function saveSettingsAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await assertAdmin()
  const siteName = String(formData.get("siteName") ?? "").trim().slice(0, 40)
  const announcement = String(formData.get("announcement") ?? "").trim().slice(0, 300)
  const registerBonus = Math.max(0, toInt(formData.get("registerBonus")))
  const minClaimSeconds = Math.max(0, toInt(formData.get("minClaimSeconds"), 15))
  if (!siteName) return { error: "Tên web không được để trống" }
  await mutateDb((db) => {
    Object.assign(db.settings, { siteName, announcement, registerBonus, minClaimSeconds })
  })
  revalidatePath("/", "layout")
  return { success: "Đã lưu cài đặt" }
}

export async function rotateWorkerKeyAction() {
  await assertAdmin()
  await mutateDb((db) => {
    db.settings.workerKey = crypto.randomBytes(16).toString("hex")
  })
  revalidatePath("/admin/settings")
}

export async function grantRefund(userId: string, amount: number, note: string) {
  await assertAdmin()
  await mutateDb((db) => {
    const user = db.users.find((u) => u.id === userId)
    if (!user) return
    user.coins += amount
    addTransaction(db, userId, amount, "refund", note)
  })
}
