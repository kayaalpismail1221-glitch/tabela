'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CITIES } from '@/lib/cities'
import { tl } from '@/lib/format'
import { TABAN_TEKLIF, MIN_ARTIS } from '@/lib/rules'
import { RankPreview } from './RankPreview'
import { PaymentMarks } from './PaymentMarks'

/**
 * Tek ekranlik ilan formu.
 *
 * Kurucu fikir: FORMU KULLANICI DOLDURMASIN. Adresi yapistirinca ad, aciklama
 * ve logo sunucudan cekiliyor (`/api/site-bilgisi`); kullaniciya duzeltmek
 * kaliyor. Surtunme, tahtayi bos birakan tek sey.
 */

/** Hazir tutar dugmeleri — taban ve iki basamak ustu. */
const HIZLI = [TABAN_TEKLIF, TABAN_TEKLIF + 2 * MIN_ARTIS, TABAN_TEKLIF + 6 * MIN_ARTIS]

const EPOSTA = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function ListingForm({
  defaultCity = '',
  defaultLira = null,
}: {
  defaultCity?: string
  defaultLira?: number | null
}) {
  const router = useRouter()
  const [link, setLink] = useState('')
  const [name, setName] = useState('')
  const [city, setCity] = useState(defaultCity)
  const [district, setDistrict] = useState('')
  const [description, setDescription] = useState('')
  const [logo, setLogo] = useState<string | null>(null) // cekilen amblem (data URI)
  const [logoUrl, setLogoUrl] = useState('') // elle yapistirilan adres
  const [ownerName, setOwnerName] = useState('')
  const [ownerEmail, setOwnerEmail] = useState('')
  const [ownerPhone, setOwnerPhone] = useState('')
  const [lira, setLira] = useState(String(defaultLira ?? TABAN_TEKLIF / 100))
  const [cekiliyor, setCekiliyor] = useState(false)
  const [cekmeNotu, setCekmeNotu] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const amount = Math.round(Number(lira) * 100)
  const gecerli =
    link.trim().length >= 2 &&
    name.trim().length >= 2 &&
    city !== '' &&
    description.trim().length >= 5 &&
    amount >= TABAN_TEKLIF

  /** Adresten ad/aciklama/logo cek. Bulunamayan alan kullanicinin yazdigi gibi kalir. */
  async function bilgileriCek() {
    if (!link.trim()) return
    setCekiliyor(true)
    setCekmeNotu(null)
    try {
      const res = await fetch('/api/site-bilgisi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ link }),
      })
      const data = await res.json()
      if (!res.ok) {
        setCekmeNotu(data.error ?? 'Bilgi çekilemedi.')
        return
      }
      // Kullanicinin yazdigini EZMIYORUZ; yalnizca bos alanlari dolduruyoruz.
      if (data.ad && !name.trim()) setName(data.ad)
      if (data.aciklama && !description.trim()) setDescription(String(data.aciklama).slice(0, 90))
      if (data.logo) setLogo(data.logo)
      setCekmeNotu(
        data.not ??
          (data.ad || data.logo ? 'Bilgiler dolduruldu, kontrol et.' : 'Bir şey bulunamadı, elle yaz.')
      )
    } catch {
      setCekmeNotu('Bilgi çekilemedi, elle yaz.')
    } finally {
      setCekiliyor(false)
    }
  }

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
        imageUrl: logo,
        logoUrl,
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
    if (data.paymentUrl) {
      window.location.href = data.paymentUrl
      return
    }
    // Zafer ekrani: sirayi aldigi ani gormeden kimse paylasmiyor.
    router.push(`/ilan/${data.listingId}?zafer=${data.bidId ?? ''}`)
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <Field label="Bağlantın" hint="Instagram profilin ya da kendi siten — tıklayan oraya gider.">
        <div className="flex gap-2">
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="@ocakbasivefa veya siten.com"
            className="w-full min-w-0 rounded-xl border border-line bg-ink px-3 py-3 outline-none focus:border-neon"
          />
          <button
            type="button"
            onClick={bilgileriCek}
            disabled={cekiliyor || link.trim().length < 2}
            className="shrink-0 rounded-xl border border-neon/50 px-4 py-3 text-sm font-bold text-neon transition hover:bg-neon/10 disabled:opacity-40"
          >
            {cekiliyor ? 'Çekiliyor…' : 'Bilgileri çek'}
          </button>
        </div>
        {cekmeNotu && <span className="mt-1 block text-xs text-cool">{cekmeNotu}</span>}
      </Field>

      <div className="flex items-end gap-3">
        <div className="min-w-0 flex-1">
          <Field label="İşletme adı">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ocakbaşı Vefa"
              className="w-full rounded-xl border border-line bg-ink px-3 py-3 outline-none focus:border-neon"
            />
          </Field>
        </div>

        {/* Amblem: cekildiyse gorunur, begenmeyen kaldirir */}
        <div className="mb-[1.4rem] flex shrink-0 flex-col items-center gap-1">
          <div className="grid h-[3.25rem] w-[3.25rem] place-items-center overflow-hidden rounded-xl border border-line bg-ink">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-lg font-black text-muted">
                {name.trim().charAt(0).toLocaleUpperCase('tr-TR') || '?'}
              </span>
            )}
          </div>
          {logo && (
            <button
              type="button"
              onClick={() => setLogo(null)}
              className="text-[10px] text-muted underline underline-offset-2 hover:text-text"
            >
              kaldır
            </button>
          )}
        </div>
      </div>

      <Field label="Logo" hint="Galeriden yükle veya adres yapıştır.">
        <div className="flex gap-2">
          <input
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://siten.com/logo.png"
            className="w-full rounded-xl border border-line bg-ink px-3 py-3 outline-none focus:border-neon"
          />
          <label className="flex shrink-0 cursor-pointer items-center gap-1 rounded-xl border border-line bg-ink px-3 py-3 text-sm text-muted hover:border-neon hover:text-text">
            📷
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const reader = new FileReader()
                reader.onload = () => {
                  const result = reader.result as string
                  setLogo(result)
                  setLogoUrl('')
                }
                reader.readAsDataURL(file)
              }}
            />
          </label>
        </div>
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

      <div className="rounded-2xl border border-line bg-surface/40 p-4">
        <div className="text-sm font-bold">Seni nasıl bulalım?</div>
        <p className="mt-1 text-xs text-muted">
          Tahtada <strong className="text-text">görünmez</strong>. Üste çıkıldığında haber vermek ve
          ödeme makbuzunu göndermek için gerekiyor.
        </p>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <input
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            placeholder="Ad soyad"
            autoComplete="name"
            className="w-full rounded-xl border border-line bg-ink px-3 py-3 outline-none focus:border-neon"
          />
          <input
            value={ownerEmail}
            onChange={(e) => setOwnerEmail(e.target.value)}
            placeholder="E-posta"
            type="email"
            inputMode="email"
            autoComplete="email"
            className="w-full rounded-xl border border-line bg-ink px-3 py-3 outline-none focus:border-neon"
          />
        </div>

        <input
          value={ownerPhone}
          onChange={(e) => setOwnerPhone(e.target.value)}
          placeholder="Telefon (isteğe bağlı)"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          className="mt-3 w-full rounded-xl border border-line bg-ink px-3 py-3 outline-none focus:border-neon"
        />
      </div>



      <div>
        <span className="text-sm font-bold">Teklifin</span>

        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center rounded-xl border border-line bg-ink px-3 focus-within:border-neon">
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

          {HIZLI.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setLira(String(k / 100))}
              className={`rounded-xl border px-3 py-3 text-sm font-bold tabular-nums transition ${
                amount === k
                  ? 'border-neon bg-neon text-ink'
                  : 'border-line text-muted hover:border-neon/60 hover:text-text'
              }`}
            >
              {tl(k)}
            </button>
          ))}
        </div>

        {/* Kacinci olacagini gormeden kimse ne kadar verecegine karar veremiyor */}
        <RankPreview
          amount={amount}
          city={city || undefined}
          onPick={(kurus) => setLira(String(Math.ceil(kurus / 100)))}
        />
      </div>

      {error && <p className="text-sm text-hot">{error}</p>}

      {/* Kabul edilen kartlar + sozlesme onayi — odeme adiminda gorunmesi sart */}
      <PaymentMarks />

      <button
        type="submit"
        disabled={!gecerli || busy}
        className="w-full rounded-xl bg-neon px-6 py-4 font-black text-ink transition hover:brightness-110 disabled:opacity-40"
      >
        {busy ? 'Gönderiliyor…' : `Şehrinin en popüleri ol · ${tl(amount || TABAN_TEKLIF)}`}
      </button>

      <p className="text-xs text-muted">
        <strong className="text-text">Tek seferlik ödeme, abonelik değil.</strong> Teklif, üste
        çıkılana kadar geçerlidir; iade edilmez. Sıralama ödemeye göredir ve kalite değerlendirmesi
        değildir.
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
