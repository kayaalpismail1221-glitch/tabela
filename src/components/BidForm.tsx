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
  baslangic = null,
  iletisimGerekli = false,
  sahiplikGerekli = false,
}: {
  listingId: string
  city: string
  current: number
  minimum: number
  /** Mailden gelen "geri al" tutari — kutu bu rakamla acilir. */
  baslangic?: number | null
  /** Ilanda kayitli e-posta yoksa burada toplaniyor — odeme ve bildirim buna bagli. */
  iletisimGerekli?: boolean
  /** Ilanda e-posta VARSA sahiplik kaniti isteniyor: giris yok, kanit o e-posta. */
  sahiplikGerekli?: boolean
}) {
  const router = useRouter()
  const [lira, setLira] = useState(String(Math.ceil(Math.max(baslangic ?? 0, minimum) / 100)))
  const [ownerName, setOwnerName] = useState('')
  const [ownerEmail, setOwnerEmail] = useState('')
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
      body: JSON.stringify({ listingId, amount, ownerName, ownerEmail }),
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
    // Zafer ekrani sirayi aldigi ani gosteriyor; refresh tek basina sessiz.
    router.push(`?zafer=${data.bidId ?? ''}`)
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

      {iletisimGerekli && (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <input
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            placeholder="Ad soyad"
            autoComplete="name"
            className="w-full rounded-xl border border-line bg-ink px-3 py-2.5 text-sm outline-none focus:border-neon"
          />
          <input
            value={ownerEmail}
            onChange={(e) => setOwnerEmail(e.target.value)}
            placeholder="E-posta"
            type="email"
            inputMode="email"
            autoComplete="email"
            className="w-full rounded-xl border border-line bg-ink px-3 py-2.5 text-sm outline-none focus:border-neon"
          />
          <p className="text-xs text-muted sm:col-span-2">
            Üste çıkıldığında haber verebilmemiz için. Tahtada görünmez.
          </p>
        </div>
      )}

      {/* Giris yok; sahiplik kaniti ilani verirken kullanilan e-posta. */}
      {sahiplikGerekli && (
        <div className="mt-3">
          <input
            value={ownerEmail}
            onChange={(e) => setOwnerEmail(e.target.value)}
            placeholder="İlanı verirken kullandığın e-posta"
            type="email"
            inputMode="email"
            autoComplete="email"
            className="w-full rounded-xl border border-line bg-ink px-3 py-2.5 text-sm outline-none focus:border-neon"
          />
          <p className="mt-1 text-xs text-muted">
            Başkasının ilanını yükseltmeyesin diye soruyoruz. Tahtada görünmez.
          </p>
        </div>
      )}

      {error && <p className="mt-1.5 text-xs text-hot">{error}</p>}

      <PaymentMarks className="mt-3" />

      <button
        type="submit"
        disabled={busy || amount <= current || (sahiplikGerekli && !ownerEmail.trim())}
        className="mt-3 w-full rounded-xl bg-neon px-6 py-3 font-bold text-ink transition hover:brightness-110 disabled:opacity-40"
      >
        {busy ? 'Gönderiliyor…' : 'Teklif ver'}
      </button>
    </form>
  )
}
