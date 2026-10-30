"use client"

import Link from "next/link"
import { useActionState } from "react"
import { loginAction, registerAction } from "@/app/actions/auth"
import { Field, FormMessage, Input, SubmitButton } from "./ui"

export function LoginForm() {
  const [state, action] = useActionState(loginAction, undefined)
  return (
    <form action={action} className="flex flex-col gap-4">
      <Field label="Tên đăng nhập hoặc email" htmlFor="identifier">
        <Input id="identifier" name="identifier" autoComplete="username" required />
      </Field>
      <Field label="Mật khẩu" htmlFor="password">
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </Field>
      <FormMessage state={state} />
      <SubmitButton className="w-full">Đăng nhập</SubmitButton>
      <p className="text-center text-sm text-muted">
        {"Chưa có tài khoản? "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Đăng ký ngay
        </Link>
      </p>
    </form>
  )
}

export function RegisterForm({ firstUser }: { firstUser: boolean }) {
  const [state, action] = useActionState(registerAction, undefined)
  return (
    <form action={action} className="flex flex-col gap-4">
      {firstUser && (
        <p className="rounded-lg border border-coin/30 bg-coin/10 px-3 py-2 text-sm text-coin">
          Đây là tài khoản đầu tiên - tài khoản này sẽ trở thành Admin.
        </p>
      )}
      <Field label="Tên đăng nhập" htmlFor="username">
        <Input id="username" name="username" autoComplete="username" minLength={3} maxLength={20} required />
      </Field>
      <Field label="Email" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </Field>
      <Field label="Mật khẩu" htmlFor="password">
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={6} required />
      </Field>
      <Field label="Xác nhận mật khẩu" htmlFor="confirm">
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={6} required />
      </Field>
      <FormMessage state={state} />
      <SubmitButton className="w-full">Tạo tài khoản</SubmitButton>
      <p className="text-center text-sm text-muted">
        {"Đã có tài khoản? "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Đăng nhập
        </Link>
      </p>
    </form>
  )
}
