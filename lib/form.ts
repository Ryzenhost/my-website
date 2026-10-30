export type FormState = { error?: string; success?: string } | undefined

export const formatCoin = (n: number) => new Intl.NumberFormat("vi-VN").format(n)

export function formatDate(ts: number) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(ts)
}
