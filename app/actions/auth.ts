"use server"

import { redirect } from "next/navigation"
import { addTransaction, mutateDb, newId, readDb } from "@/lib/db"
import { createSession, destroySession, hashPassword, verifyPassword } from "@/lib/auth"
import type { FormState } from "@/lib/form"

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function registerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const username = String(formData.get("username") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const password = String(formData.get("password") ?? "")
  const confirm = String(formData.get("confirm") ?? "")

  if (!USERNAME_RE.test(username)) return { error: "Tên đăng nhập 3-20 ký tự, chỉ chữ, số và _" }
  if (!EMAIL_RE.test(email)) return { error: "Email không hợp lệ" }
  if (password.length < 6) return { error: "Mật khẩu tối thiểu 6 ký tự" }
  if (password !== confirm) return { error: "Mật khẩu xác nhận không khớp" }

  const result = await mutateDb((db) => {
    const lower = username.toLowerCase()
    if (db.users.some((u) => u.username.toLowerCase() === lower)) return { error: "Tên đăng nhập đã tồn tại" }
    if (db.users.some((u) => u.email === email)) return { error: "Email đã được sử dụng" }
    const isFirst = db.users.length === 0
    const id = newId()
    const bonus = db.settings.registerBonus
    db.users.push({
      id,
      username,
      email,
      passwordHash: hashPassword(password),
      role: isFirst ? "admin" : "user",
      coins: bonus,
      banned: false,
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
    })
    if (bonus > 0) addTransaction(db, id, bonus, "bonus", "Thưởng đăng ký tài khoản")
    return { id }
  })

  if ("error" in result) return { error: result.error }
  await createSession(result.id)
  redirect("/dashboard")
}

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const identifier = String(formData.get("identifier") ?? "").trim().toLowerCase()
  const password = String(formData.get("password") ?? "")
  if (!identifier || !password) return { error: "Vui lòng nhập đầy đủ thông tin" }

  const db = await readDb()
  const user = db.users.find((u) => u.username.toLowerCase() === identifier || u.email === identifier)
  if (!user || !verifyPassword(password, user.passwordHash)) return { error: "Sai tài khoản hoặc mật khẩu" }
  if (user.banned) return { error: "Tài khoản đã bị khóa. Liên hệ admin." }

  await mutateDb((d) => {
    const u = d.users.find((x) => x.id === user.id)
    if (u) u.lastLoginAt = Date.now()
  })
  await createSession(user.id)
  redirect("/dashboard")
}

export async function logoutAction() {
  await destroySession()
  redirect("/login")
}

export async function hasAnyUser() {
  const db = await readDb()
  return db.users.length > 0
}
