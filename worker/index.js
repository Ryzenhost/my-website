import mineflayer from "mineflayer"

const PANEL_URL = (process.env.PANEL_URL || "").replace(/\/$/, "")
const WORKER_KEY = process.env.WORKER_KEY || ""
const SYNC_MS = Number(process.env.SYNC_MS || 30_000)

if (!PANEL_URL || !WORKER_KEY) {
  console.error("Thiếu PANEL_URL hoặc WORKER_KEY")
  process.exit(1)
}

const sessions = new Map()

function log(id, msg) {
  console.log(`[${new Date().toISOString()}] [${id}] ${msg}`)
}

function startBot(cfg) {
  const state = { cfg, bot: null, online: false, message: "Đang kết nối...", stopped: false, retry: null, afk: null }
  sessions.set(cfg.id, state)

  const connect = () => {
    if (state.stopped) return
    const bot = mineflayer.createBot({
      host: cfg.host,
      port: cfg.port,
      username: cfg.username,
      version: cfg.version === "auto" ? false : cfg.version,
      auth: "offline",
      hideErrors: true,
    })
    state.bot = bot

    bot.once("spawn", () => {
      state.online = true
      state.message = `Đã vào server ${cfg.host}`
      log(cfg.id, state.message)
      clearInterval(state.afk)
      state.afk = setInterval(() => {
        if (!bot.entity) return
        bot.setControlState("jump", true)
        setTimeout(() => bot.setControlState("jump", false), 400)
        bot.look(Math.random() * Math.PI * 2, 0, true).catch(() => {})
        bot.swingArm("right")
      }, 25_000)
    })

    bot.on("kicked", (reason) => {
      state.message = `Bị kick: ${typeof reason === "string" ? reason : JSON.stringify(reason)}`.slice(0, 200)
    })
    bot.on("error", (err) => {
      state.message = `Lỗi: ${err.message}`.slice(0, 200)
    })
    bot.on("end", () => {
      state.online = false
      clearInterval(state.afk)
      if (state.stopped) return
      log(cfg.id, `Mất kết nối, thử lại sau 15s (${state.message})`)
      state.retry = setTimeout(connect, 15_000)
    })
  }

  connect()
}

function stopBot(id) {
  const state = sessions.get(id)
  if (!state) return
  state.stopped = true
  clearTimeout(state.retry)
  clearInterval(state.afk)
  try {
    state.bot?.quit()
  } catch {}
  sessions.delete(id)
  log(id, "Đã dừng")
}

const sameConfig = (a, b) => a.host === b.host && a.port === b.port && a.username === b.username && a.version === b.version

async function sync() {
  try {
    const res = await fetch(`${PANEL_URL}/api/worker`, { headers: { "x-worker-key": WORKER_KEY } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const { bots } = await res.json()
    const wanted = new Map(bots.map((b) => [b.id, b]))

    for (const [id, state] of sessions) {
      const next = wanted.get(id)
      if (!next || !sameConfig(state.cfg, next)) stopBot(id)
    }
    for (const cfg of bots) if (!sessions.has(cfg.id)) startBot(cfg)

    const reports = [...sessions.values()].map((s) => ({ id: s.cfg.id, online: s.online, message: s.message }))
    await fetch(`${PANEL_URL}/api/worker`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-worker-key": WORKER_KEY },
      body: JSON.stringify({ reports }),
    })
  } catch (err) {
    console.error("Sync lỗi:", err.message)
  }
}

console.log(`Worker khởi động, panel: ${PANEL_URL}`)
sync()
setInterval(sync, SYNC_MS)

process.on("SIGINT", () => {
  for (const id of [...sessions.keys()]) stopBot(id)
  process.exit(0)
})
