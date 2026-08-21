'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { tl } from '@/lib/format'
import { MIN_ARTIS } from '@/lib/rules'
import { RankPreview } from './RankPreview'
import { PaymentMarks } from './PaymentMarks'

export function BidForm({
  listingId,
  city,
  current,
  minimum,
}: {
  listingId: string
  city: string
  current: number
  minimum: number
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
    // Canli modda odeme sayfasina gidiyoruz; test modunda teklif aninda gecerli
    if (data.paymentUrl) {
      window.location.href = data.paymentUrl
      return
    }
    router.refresh()
  }

  return (
    <form onSubmit={submit}>
      <div className="flex items-center rounded-xl border border-line bg-ink px-3 focus-within:border-neon">
        <input
          type="number"
          inputMode="numeric"
          value={lira}
          min={Math.ceil(minimum / 100)}
          step={MIN_ARTIS / 100}
          onChange={(e) => setLira(e.target.value)}
          className="w-full min-w-0 bg-transparent py-3 text-lg font-bold tabular-nums outline-none"
        />
        <span className="pl-2 text-muted">₺</span>
      </div>

      <p className="mt-1.5 text-xs text-muted">
        En az {tl(minimum)} · şu an ödeyeceğin fark:{' '}
        <strong className="text-text">{fark > 0 ? tl(fark) : '—'}</strong>
      </p>

      {/* Yukseltmenin karsiligini once goster, sonra parayi iste */}
      <RankPreview
        amount={amount}
        city={city}
        exclude={listingId}
        current={current}
        onPick={(kurus) => setLira(String(Math.ceil(kurus / 100)))}
      />

      {error && <p className="mt-1.5 text-xs text-hot">{error}</p>}

      <PaymentMarks className="mt-3" />

      <button
        type="submit"
        disabled={busy || amount <= current}
        className="mt-3 w-full rounded-xl bg-neon px-6 py-3 font-bold text-ink transition hover:brightness-110 disabled:opacity-40"
      >
        {busy ? 'Gönderiliyor…' : 'Teklif ver'}
      </button>
    </form>
  )
}
