import type { TxType } from "./db"

export const TX_LABEL: Record<TxType, { label: string; tone: "muted" | "green" | "amber" | "red" }> = {
  giftcode: { label: "Giftcode", tone: "amber" },
  link: { label: "Vượt link", tone: "green" },
  bot: { label: "Duy trì bot", tone: "red" },
  admin: { label: "Admin", tone: "muted" },
  bonus: { label: "Thưởng", tone: "amber" },
  refund: { label: "Hoàn coin", tone: "green" },
}
