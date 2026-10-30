import Link from "next/link"
import { Bot, Clock, Coins, Gift, Link2, ShieldCheck } from "lucide-react"
import { Logo } from "@/components/logo"
import { getCurrentUser } from "@/lib/auth"
import { readDb } from "@/lib/db"
import { formatCoin } from "@/lib/form"

const features = [
  { icon: Bot, title: "Treo bot 24/7", text: "Bot tự vào server, chống kick AFK và tự kết nối lại khi rớt mạng." },
  { icon: Clock, title: "Trả theo giờ", text: "Chọn gói, gia hạn theo giờ. Coin chỉ bị trừ cho thời gian bạn chọn." },
  { icon: Link2, title: "Vượt link kiếm coin", text: "Hoàn thành nhiệm vụ vượt link để nhận coin miễn phí mỗi ngày." },
  { icon: Gift, title: "Giftcode", text: "Nhập giftcode từ sự kiện để nhận thêm coin duy trì bot." },
]

export default async function HomePage() {
  const [user, db] = await Promise.all([getCurrentUser(), readDb()])
  const plans = db.plans.filter((p) => p.active)
  const ctaHref = user ? "/dashboard" : "/register"

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <Logo name={db.settings.siteName} />
          <nav className="flex items-center gap-2">
            {user ? (
              <Link href="/dashboard" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                Vào bảng điều khiển
              </Link>
            ) : (
              <>
                <Link href="/login" className="rounded-lg px-3 py-2 text-sm text-muted hover:text-foreground">
                  Đăng nhập
                </Link>
                <Link href="/register" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                  Đăng ký
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="pixel-grid border-b border-border">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-20 text-center md:py-28">
            <span className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <span className="size-1.5 rounded-full bg-primary" aria-hidden />
              Hỗ trợ Java Edition 1.8 - 1.21
            </span>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-foreground text-balance md:text-6xl">
              Treo bot AFK Minecraft <span className="text-primary">không cần bật máy</span>
            </h1>
            <p className="max-w-xl text-base text-muted text-pretty md:text-lg">
              Giữ server luôn có người, farm tự động, giữ chunk load cả ngày. Kiếm coin miễn phí bằng giftcode và vượt link.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href={ctaHref} className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                Bắt đầu miễn phí
              </Link>
              <a href="#pricing" className="rounded-lg border border-border bg-surface px-6 py-3 text-sm font-semibold text-foreground hover:bg-surface-2">
                Xem bảng giá
              </a>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-4 px-4 py-16 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5">
              <f.icon className="size-6 text-primary" aria-hidden />
              <h2 className="font-semibold text-foreground">{f.title}</h2>
              <p className="text-sm text-muted text-pretty">{f.text}</p>
            </div>
          ))}
        </section>

        <section id="pricing" className="border-t border-border bg-surface/50">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-16">
            <div className="flex flex-col gap-2 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">Bảng giá theo giờ</h2>
              <p className="text-muted">Mỗi giờ bot hoạt động sẽ trừ coin theo gói bạn chọn.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {plans.map((p, i) => (
                <div
                  key={p.id}
                  className={`flex flex-col gap-4 rounded-xl border p-6 ${i === 1 ? "border-primary bg-primary/5" : "border-border bg-surface"}`}
                >
                  <h3 className="font-semibold text-foreground">{p.name}</h3>
                  <p className="flex items-baseline gap-1.5">
                    <Coins className="size-5 self-center text-coin" aria-hidden />
                    <span className="font-mono text-3xl font-bold text-foreground">{formatCoin(p.pricePerHour)}</span>
                    <span className="text-sm text-muted">coin / giờ</span>
                  </p>
                  <p className="text-sm text-muted">{p.description}</p>
                  <Link
                    href={ctaHref}
                    className={`mt-auto rounded-lg px-4 py-2.5 text-center text-sm font-semibold ${i === 1 ? "bg-primary text-primary-foreground hover:bg-primary/90" : "border border-border text-foreground hover:bg-surface-2"}`}
                  >
                    Chọn gói
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-6 text-sm text-muted">
          <span>{db.settings.siteName}</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="size-4" aria-hidden />
            Không liên kết với Mojang
          </span>
        </div>
      </footer>
    </div>
  )
}
