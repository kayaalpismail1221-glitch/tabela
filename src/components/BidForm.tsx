'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { tl } from '@/lib/format'

export function BidForm({
  listingId,
  current,
  minimum,
  firstPlace,
}: {
  listingId: string
  current: number
  minimum: number
  firstPlace: number
}) {
  const router = useRouter()
  const [lira, setLira] = useState(String(Math.ceil(minimum / 100)))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const amount = Math.round(Number(lira) * 100)
  const fark = amount - current

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)

    const res = await fetch('/api/bids', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId, amount }),
    })
    const data = await res.json()

    setBusy(false)
    if (!res.ok) {
      setError(data.minimum ? `${data.error} En az ${tl(data.minimum)}.` : data.error)
      return
    }
    router.refresh()
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-start gap-3">
      <div className="flex-1 min-w-[12rem]">
        <div className="flex items-center rounded-xl border border-line bg-ink px-3 focus-within:border-neon">
          <input
            type="number"
            inputMode="numeric"
            value={lira}
            min={Math.ceil(minimum / 100)}
            step={50}
            onChange={(e) => setLira(e.target.value)}
            className="w-full bg-transparent py-3 text-lg font-bold tabular-nums outline-none"
          />
          <span className="pl-2 text-muted">₺</span>
        </div>
        <p className="mt-1.5 text-xs text-muted">
          En az {tl(minimum)} · şu an ödeyeceğin fark:{' '}
          <strong className="text-text">{fark > 0 ? tl(fark) : '—'}</strong>
        </p>
        {error && <p className="mt-1.5 text-xs text-hot">{error}</p>}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setLira(String(Math.ceil(firstPlace / 100)))}
          className="rounded-xl border border-line px-4 py-3 text-sm font-bold transition hover:border-neon/60"
        >
          1 numara ol
        </button>
        <button
          type="submit"
          disabled={busy || amount <= current}
          className="rounded-xl bg-neon px-6 py-3 font-bold text-ink transition hover:brightness-110 disabled:opacity-40"
        >
          {busy ? 'Gönderiliyor…' : 'Teklif ver'}
        </button>
      </div>
    </form>
  )
}
