import "server-only"
import { promises as fs } from "node:fs"
import path from "node:path"
import crypto from "node:crypto"

export type Role = "admin" | "user"

export type User = {
  id: string
  username: string
  email: string
  passwordHash: string
  role: Role
  coins: number
  banned: boolean
  createdAt: number
  lastLoginAt?: number
}

export type Plan = {
  id: string
  name: string
  pricePerHour: number
  description: string
  active: boolean
}

export type BotStatus = "running" | "stopped"

export type Bot = {
  id: string
  userId: string
  name: string
  host: string
  port: number
  version: string
  username: string
  planId: string
  status: BotStatus
  expiresAt: number | null
  createdAt: number
  worker?: { online: boolean; message: string; lastSeen: number }
}

export type GiftCode = {
  id: string
  code: string
  reward: number
  maxUses: number
  usedBy: string[]
  expiresAt: number | null
  active: boolean
  createdAt: number
}

export type LinkTask = {
  id: string
  name: string
  reward: number
  apiTemplate: string
  cooldownMinutes: number
  dailyLimit: number
  active: boolean
  createdAt: number
}

export type LinkClaim = {
  token: string
  userId: string
  taskId: string
  createdAt: number
  claimedAt: number | null
}

export type TxType = "giftcode" | "link" | "bot" | "admin" | "bonus" | "refund"

export type Transaction = {
  id: string
  userId: string
  amount: number
  type: TxType
  note: string
  createdAt: number
}

export type Settings = {
  siteName: string
  announcement: string
  registerBonus: number
  minClaimSeconds: number
  workerKey: string
  sessionSecret: string
}

export type Database = {
  users: User[]
  plans: Plan[]
  bots: Bot[]
  giftcodes: GiftCode[]
  linkTasks: LinkTask[]
  linkClaims: LinkClaim[]
  transactions: Transaction[]
  settings: Settings
}

const DATA_DIR =
  process.env.DATA_DIR ?? (process.env.VERCEL ? "/tmp/afk-bot-data" : path.join(process.cwd(), "data"))
const DATA_FILE = path.join(DATA_DIR, "db.json")

export const newId = () => crypto.randomBytes(8).toString("hex")

function createDefault(): Database {
  const now = Date.now()
  return {
    users: [],
    plans: [
      { id: newId(), name: "Cơ bản", pricePerHour: 5, description: "1 bot AFK, tự kết nối lại", active: true },
      { id: newId(), name: "Tiêu chuẩn", pricePerHour: 10, description: "Ưu tiên kết nối, chống kick AFK", active: true },
      { id: newId(), name: "VIP", pricePerHour: 20, description: "Ưu tiên cao nhất, hỗ trợ riêng", active: true },
    ],
    bots: [],
    giftcodes: [
      {
        id: newId(),
        code: "WELCOME",
        reward: 50,
        maxUses: 1000,
        usedBy: [],
        expiresAt: null,
        active: true,
        createdAt: now,
      },
    ],
    linkTasks: [
      {
        id: newId(),
        name: "Vượt link mẫu",
        reward: 10,
        apiTemplate: "",
        cooldownMinutes: 30,
        dailyLimit: 10,
        active: true,
        createdAt: now,
      },
    ],
    linkClaims: [],
    transactions: [],
    settings: {
      siteName: "AFK Bot Panel",
      announcement: "Chào mừng! Nhập giftcode WELCOME để nhận 50 coin miễn phí.",
      registerBonus: 20,
      minClaimSeconds: 15,
      workerKey: crypto.randomBytes(16).toString("hex"),
      sessionSecret: crypto.randomBytes(32).toString("hex"),
    },
  }
}

let cache: Database | null = null
let queue: Promise<unknown> = Promise.resolve()

async function load(): Promise<Database> {
  if (cache) return cache
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8")
    cache = JSON.parse(raw) as Database
  } catch {
    cache = createDefault()
    await persist(cache)
  }
  return cache
}

async function persist(data: Database) {
  await fs.mkdir(DATA_DIR, { recursive: true })
  const tmp = `${DATA_FILE}.${process.pid}.tmp`
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8")
  await fs.rename(tmp, DATA_FILE)
}

export async function readDb(): Promise<Database> {
  await queue
  const data = await load()
  return structuredClone(data)
}

export function mutateDb<T>(fn: (db: Database) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const data = await load()
    const draft = structuredClone(data)
    const result = await fn(draft)
    await persist(draft)
    cache = draft
    return result
  })
  queue = run.catch(() => undefined)
  return run
}

export function addTransaction(db: Database, userId: string, amount: number, type: TxType, note: string) {
  db.transactions.unshift({ id: newId(), userId, amount, type, note, createdAt: Date.now() })
  if (db.transactions.length > 5000) db.transactions.length = 5000
}

export function isBotActive(bot: Bot, now = Date.now()) {
  return bot.status === "running" && bot.expiresAt !== null && bot.expiresAt > now
}
