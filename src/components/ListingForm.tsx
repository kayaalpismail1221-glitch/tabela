'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CITIES } from '@/lib/cities'
import { tl } from '@/lib/format'
import { TABAN_TEKLIF } from '@/lib/rules'

export function ListingForm({
  defaultCity = '',
  firstPlace,
}: {
  defaultCity?: string
  firstPlace: number
}) {
  const router = useRouter()
  const [handle, setHandle] = useState('')
  const [name, setName] = useState('')
  const [city, setCity] = useState(defaultCity)
  const [district, setDistrict] = useState('')
  const [description, setDescription] = useState('')
  const [lira, setLira] = useState(String(TABAN_TEKLIF / 100))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const amount = Math.round(Number(lira) * 100)
  const gecerli =
    handle.trim().length >= 2 &&
    name.trim().length >= 2 &&
    city !== '' &&
    description.trim().length >= 5 &&
    amount >= TABAN_TEKLIF

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)

    const res = await fetch('/api/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ handle, name, city, district, description, amount }),
    })
    const data = await res.json()

    setBusy(false)
    if (!res.ok) {
      setError(data.minimum ? `${data.error} En az ${tl(data.minimum)}.` : data.error)
      return
    }
    router.push(`/ilan/${data.listingId}`)
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <Field label="Instagram kullanıcı adı" hint="Doğrulama için bio’ya bir kod koyman istenecek.">
        <div className="flex items-center rounded-xl border border-line bg-ink px-3 focus-within:border-neon">
          <span className="text-muted">@</span>
          <input
            value={handle}
            onChange={(e) => setHandle(e.target.value.replace(/^@/, '').toLowerCase())}
            placeholder="ocakbasivefa"
            className="w-full bg-transparent py-3 pl-1 outline-none"
          />
        </div>
      </Field>

      <Field label="İşletme adı">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ocakbaşı Vefa"
          className="w-full rounded-xl border border-line bg-ink px-3 py-3 outline-none focus:border-neon"
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Şehir" hint="Şehir tahtasına buradan düşersin.">
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full rounded-xl border border-line bg-ink px-3 py-3 outline-none focus:border-neon"
          >
            <option value="">Seç…</option>
            {CITIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.plaka} · {c.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="İlçe" hint="İsteğe bağlı.">
          <input
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            placeholder="Beyoğlu"
            className="w-full rounded-xl border border-line bg-ink px-3 py-3 outline-none focus:border-neon"
          />
        </Field>
      </div>

      <Field label="Tek satır iddia" hint={`${description.length}/90`}>
        <input
          value={description}
          maxLength={90}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="İnce hamur. Tartışmayı kabul etmiyoruz."
          className="w-full rounded-xl border border-line bg-ink px-3 py-3 outline-none focus:border-neon"
        />
      </Field>

      <Field
        label="Teklifin"
        hint={`Taban ${tl(TABAN_TEKLIF)} · Türkiye 1 numarası olmak ${tl(firstPlace)}`}
      >
        <div className="flex items-center rounded-xl border border-line bg-ink px-3 focus-within:border-neon">
          <input
            type="number"
            inputMode="numeric"
            value={lira}
            min={TABAN_TEKLIF / 100}
            step={50}
            onChange={(e) => setLira(e.target.value)}
            className="w-full bg-transparent py-3 text-lg font-bold tabular-nums outline-none"
          />
          <span className="pl-2 text-muted">₺</span>
        </div>
      </Field>

      {error && <p className="text-sm text-hot">{error}</p>}

      <button
        type="submit"
        disabled={!gecerli || busy}
        className="w-full rounded-xl bg-neon px-6 py-4 font-black text-ink transition hover:brightness-110 disabled:opacity-40"
      >
        {busy ? 'Gönderiliyor…' : 'Tahtaya çık'}
      </button>

      <p className="text-xs text-muted">
        Teklif, üste çıkılana kadar geçerlidir; iade edilmez. Sıralama ödemeye göredir ve kalite
        değerlendirmesi değildir.
      </p>
    </form>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  )
}
