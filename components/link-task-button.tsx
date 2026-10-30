"use client"

import { useState, useTransition } from "react"
import { ExternalLink, Loader2 } from "lucide-react"
import { startLinkTaskAction } from "@/app/actions/user"
import { Button } from "./ui"

export function LinkTaskButton({ taskId }: { taskId: string }) {
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="flex flex-col items-end gap-1.5">
      <Button
        disabled={pending}
        onClick={() =>
          start(async () => {
            setError(null)
            const res = await startLinkTaskAction(taskId)
            if (res.error) setError(res.error)
            else if (res.url) window.open(res.url, "_blank", "noopener")
          })
        }
      >
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <ExternalLink className="size-4" aria-hidden />}
        Vượt link
      </Button>
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
