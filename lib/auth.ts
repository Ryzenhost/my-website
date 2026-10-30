import "server-only"
import crypto from "node:crypto"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { readDb, type User } from "./db"

const COOKIE = "afk_session"
const MAX_AGE = 60 * 60 * 24 * 7

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex")
  const hash = crypto.scryptSync(password, salt, 64).toString("hex")
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":")
  if (!salt || !hash) return false
  const test = crypto.scryptSync(password, salt, 64)
  const known = Buffer.from(hash, "hex")
  return known.length === test.length && crypto.timingSafeEqual(known, test)
}

async function secret() {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET
  const db = await readDb()
  return db.settings.sessionSecret
}

function sign(payload: string, key: string) {
  return crypto.createHmac("sha256", key).update(payload).digest("base64url")
}

export async function createSession(userId: string) {
  const exp = Date.now() + MAX_AGE * 1000
  const payload = `${userId}.${exp}`
  const token = `${payload}.${sign(payload, await secret())}`
  const store = await cookies()
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: process.env.NODE_ENV === "development" ? "none" : "lax",
    path: "/",
    maxAge: MAX_AGE,
  })
}

export async function destroySession() {
  const store = await cookies()
  store.delete(COOKIE)
}

export async function getCurrentUser(): Promise<User | null> {
  const store = await cookies()
  const token = store.get(COOKIE)?.value
  if (!token) return null
  const [userId, exp, sig] = token.split(".")
  if (!userId || !exp || !sig) return null
  const expected = sign(`${userId}.${exp}`, await secret())
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null
  if (Number(exp) < Date.now()) return null
  const db = await readDb()
  const user = db.users.find((u) => u.id === userId)
  if (!user || user.banned) return null
  return user
}

export async function requireUser() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  return user
}

export async function requireAdmin() {
  const user = await requireUser()
  if (user.role !== "admin") redirect("/dashboard")
  return user
}

export type PublicUser = Omit<User, "passwordHash">

export function toPublic(user: User): PublicUser {
  const { passwordHash: _omit, ...rest } = user
  return rest
}
