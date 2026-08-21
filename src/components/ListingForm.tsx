'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CITIES } from '@/lib/cities'
import { tl } from '@/lib/format'
import { TABAN_TEKLIF, MIN_ARTIS } from '@/lib/rules'
import { RankPreview } from './RankPreview'

export function ListingForm({ defaultCity = '' }: { defaultCity?: string }) {
  const router = useRouter()
  const [link, setLink] = useState('')
  const [name, setName] = useState('')
  const [city, setCity] = useState(defaultCity)
  const [district, setDistrict] = useState('')
  const [description, setDescription] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [ownerEmail, setOwnerEmail] = useState('')
  const [ownerPhone, setOwnerPhone] = useState('')
  const [lira, setLira] = useState(String(TABAN_TEKLIF / 100))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const amount = Math.round(Number(lira) * 100)
  const gecerli =
    link.trim().length >= 2 &&
    name.trim().length >= 2 &&
    city !== '' &&
    description.trim().length >= 5 &&
    ownerName.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail) &&
    amount >= TABAN_TEKLIF

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)

    const res = await fetch('/api/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        link,
        name,
        city,
        district,
        description,
        ownerName,
        ownerEmail,
        ownerPhone,
        amount,
      }),
    })
    const data = await res.json()

    setBusy(false)
    if (!res.ok) {
      setError(data.minimum ? `${data.error} En az ${tl(data.minimum)}.` : data.error)
      return
    }
    // Canli modda Iyzico odeme sayfasina gidiyoruz
    if (data.paymentUrl) {
      window.location.href = data.paymentUrl
      return
    }
    router.push(`/ilan/${data.listingId}`)
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <Field label="Bağlantın" hint="Instagram profilin ya da kendi siten — tıklayan oraya gider.">
        <input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="@ocakbasivefa veya siten.com"
          className="w-full rounded-xl border border-line bg-ink px-3 py-3 outline-none focus:border-neon"
        />
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

      {/* Iletisim: hem odemenin alici bilgisi hem "uste cikildin" bildirimi.
          Uydurma alici verisi Iyzico'nun fraud skorlamasini bozuyor. */}
      <fieldset className="rounded-xl border border-line p-4">
        <legend className="px-1 text-sm font-bold">İletişim</legend>
        <p className="text-xs text-muted">
          Fatura ve “üste çıkıldın” bildirimi için. Tahtada görünmez.
        </p>

        <div className="mt-3 space-y-4">
          <Field label="Ad soyad">
            <input
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="İsmail Kayaalp"
              className="w-full rounded-xl border border-line bg-ink px-3 py-3 outline-none focus:border-neon"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="E-posta">
              <input
                type="email"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
                placeholder="ad@ornek.com"
                className="w-full rounded-xl border border-line bg-ink px-3 py-3 outline-none focus:border-neon"
              />
            </Field>

            <Field label="Telefon" hint="İsteğe bağlı.">
              <input
                type="tel"
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value)}
                placeholder="+90 5xx xxx xx xx"
                className="w-full rounded-xl border border-line bg-ink px-3 py-3 outline-none focus:border-neon"
              />
            </Field>
          </div>
        </div>
      </fieldset>

      <div>
        <span className="text-sm font-bold">Teklifin</span>
        <div className="mt-1.5 flex items-center rounded-xl border border-line bg-ink px-3 focus-within:border-neon">
          <input
            type="number"
            inputMode="numeric"
            value={lira}
            min={TABAN_TEKLIF / 100}
            step={MIN_ARTIS / 100}
            onChange={(e) => setLira(e.target.value)}
            className="w-full min-w-0 bg-transparent py-3 text-lg font-bold tabular-nums outline-none"
          />
          <span className="pl-2 text-muted">₺</span>
        </div>

        {/* Kacinci olacagini gormeden kimse ne kadar verecegine karar veremiyor */}
        <RankPreview
          amount={amount}
          city={city || undefined}
          onPick={(kurus) => setLira(String(Math.ceil(kurus / 100)))}
        />

        <span className="mt-1.5 block text-xs text-muted">Taban {tl(TABAN_TEKLIF)}.</span>
      </div>

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
