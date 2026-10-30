"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  Bot,
  Coins,
  Gift,
  History,
  LayoutDashboard,
  Link2,
  LogOut,
  Menu,
  Settings,
  Shield,
  Users,
  UserCog,
  Package,
  Ticket,
  X,
  Server,
} from "lucide-react"
import { logoutAction } from "@/app/actions/auth"
import { Logo } from "./logo"
import { cn } from "./ui"
import { formatCoin } from "@/lib/form"

const userNav = [
  { href: "/dashboard", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/bots", label: "Bot AFK", icon: Bot },
  { href: "/earn", label: "Vượt link kiếm coin", icon: Link2 },
  { href: "/giftcode", label: "Giftcode", icon: Gift },
  { href: "/history", label: "Lịch sử coin", icon: History },
  { href: "/account", label: "Tài khoản", icon: UserCog },
]

const adminNav = [
  { href: "/admin", label: "Thống kê", icon: Shield },
  { href: "/admin/users", label: "Người dùng", icon: Users },
  { href: "/admin/bots", label: "Tất cả bot", icon: Server },
  { href: "/admin/giftcodes", label: "Giftcode", icon: Ticket },
  { href: "/admin/links", label: "Nhiệm vụ link", icon: Link2 },
  { href: "/admin/plans", label: "Gói giá", icon: Package },
  { href: "/admin/settings", label: "Cài đặt web", icon: Settings },
]

type Props = {
  siteName: string
  username: string
  role: "admin" | "user"
  coins: number
  children: React.ReactNode
}

export function AppShell({ siteName, username, role, coins, children }: Props) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`))

  const nav = (
    <nav className="flex flex-1 flex-col gap-6 overflow-y-auto p-3" aria-label="Menu chính">
      <NavGroup title="Menu">
        {userNav.map((item) => (
          <NavItem key={item.href} {...item} active={isActive(item.href)} onClick={() => setOpen(false)} />
        ))}
      </NavGroup>
      {role === "admin" && (
        <NavGroup title="Quản trị">
          {adminNav.map((item) => (
            <NavItem key={item.href} {...item} active={isActive(item.href)} onClick={() => setOpen(false)} />
          ))}
        </NavGroup>
      )}
    </nav>
  )

  const footer = (
    <div className="flex flex-col gap-3 border-t border-border p-3">
      <div className="flex items-center justify-between rounded-lg bg-surface-2 px-3 py-2.5">
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium text-foreground">{username}</span>
          <span className="text-xs text-muted">{role === "admin" ? "Quản trị viên" : "Thành viên"}</span>
        </div>
        <span className="flex items-center gap-1 font-mono text-sm font-semibold text-coin">
          <Coins className="size-4" aria-hidden />
          {formatCoin(coins)}
        </span>
      </div>
      <form action={logoutAction}>
        <button
          type="submit"
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-danger"
        >
          <LogOut className="size-4" aria-hidden />
          Đăng xuất
        </button>
      </form>
    </div>
  )

  return (
    <div className="flex min-h-dvh">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border bg-surface lg:flex">
        <div className="flex h-16 items-center border-b border-border px-4">
          <Link href="/dashboard">
            <Logo name={siteName} />
          </Link>
        </div>
        {nav}
        {footer}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button className="absolute inset-0 bg-black/60" aria-label="Đóng menu" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-border bg-surface">
            <div className="flex h-16 items-center justify-between border-b border-border px-4">
              <Logo name={siteName} />
              <button onClick={() => setOpen(false)} className="rounded-md p-1.5 text-muted hover:bg-surface-2" aria-label="Đóng menu">
                <X className="size-5" />
              </button>
            </div>
            {nav}
            {footer}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 backdrop-blur lg:hidden">
          <button onClick={() => setOpen(true)} className="rounded-md p-2 text-foreground hover:bg-surface-2" aria-label="Mở menu">
            <Menu className="size-5" />
          </button>
          <Logo name={siteName} />
          <span className="flex items-center gap-1 font-mono text-sm font-semibold text-coin">
            <Coins className="size-4" aria-hidden />
            {formatCoin(coins)}
          </span>
        </header>
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 md:p-8">{children}</main>
      </div>
    </div>
  )
}

function NavGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wider text-muted/70">{title}</p>
      {children}
    </div>
  )
}

function NavItem({
  href,
  label,
  icon: Icon,
  active,
  onClick,
}: {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  active: boolean
  onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
        active ? "bg-primary/10 font-medium text-primary" : "text-muted hover:bg-surface-2 hover:text-foreground",
      )}
    >
      <Icon className="size-4" />
      {label}
    </Link>
  )
}
