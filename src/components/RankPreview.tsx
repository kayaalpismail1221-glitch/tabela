'use client'

import { useEffect, useState } from 'react'
import { cityName } from '@/lib/cities'
import { tl } from '@/lib/format'

type Rank = {
  national: { rank: number; total: number; firstPlace: number }
  city: { slug: string; rank: number; total: number; firstPlace: number } | null
}

/**
 * "Bu parayi verirsem kacinci olurum?" — teklif kutusunun altinda canli.
 *
 * Karar ani burasi: sirayi gormeden kimse ne kadar verecegine karar veremiyor.
 * Sehirde 1 numara cikiyorsa onu one cikariyoruz; ucuz zafer bu urunun
 * satis argumani.
 */
export function RankPreview({
  amount,
  city,
  exclude,
  onPick,
}: {
  amount: number // kurus
  city?: string
  exclude?: string
  /** "1 numara ol" tiklaninca teklif kutusunu doldurmak icin */
  onPick?: (kurus: number) => void
}) {
  const [data, setData] = useState<Rank | null>(null)
  const [bekliyor, setBekliyor] = useState(false)

  useEffect(() => {
    if (!amount || amount <= 0) return

    const kontrol = new AbortController()

    // Her tusa basista istek atmamak icin kisa gecikme.
    const zaman = setTimeout(async () => {
      setBekliyor(true)
      try {
        const qs = new URLSearchParams({ amount: String(amount) })
        if (city) qs.set('city', city)
        if (exclude) qs.set('exclude', exclude)

        const res = await fetch(`/api/rank?${qs}`, { signal: kontrol.signal })
        if (res.ok) setData(await res.json())
      } catch {
        // iptal ya da ag hatasi — onizleme kritik yol degil
      } finally {
        setBekliyor(false)
      }
    }, 300)

    return () => {
      clearTimeout(zaman)
      kontrol.abort()
    }
  }, [amount, city, exclude])

  // Tutar sifirlanirsa eski onizlemeyi gostermeyi birak (state temizlemeye gerek yok)
  if (amount <= 0 || !data) {
    return (
      <p className="mt-2 text-xs text-muted">
        {bekliyor ? 'Sıra hesaplanıyor…' : 'Tutarı yaz, kaçıncı olacağını göstereyim.'}
      </p>
    )
  }

  const sehirBirinci = data.city?.rank === 1
  // Sehir zirvesi ayni zamanda Turkiye zirvesiyse iki ayni kisayol gostermeyelim
  const tekHedef = data.city != null && data.city.firstPlace === data.national.firstPlace
  const turkiyeBirinci = data.national.rank === 1

  return (
    <div className="mt-2 rounded-xl border border-line bg-ink/60 px-3 py-2.5">
      <p className="text-[11px] uppercase tracking-wider text-muted">Bu teklifle</p>

      <div className="mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className="text-sm">
          <span className="text-muted">Türkiye </span>
          <strong className={`text-lg tabular-nums ${turkiyeBirinci ? 'text-neon' : ''}`}>
            {data.national.rank}.
          </strong>
          <span className="text-xs text-muted"> / {data.national.total}</span>
        </span>

        {data.city && (
          <span className="text-sm">
            <span className="text-muted">{cityName(data.city.slug)} </span>
            <strong className={`text-lg tabular-nums ${sehirBirinci ? 'text-neon' : ''}`}>
              {data.city.rank}.
            </strong>
            <span className="text-xs text-muted"> / {data.city.total}</span>
          </span>
        )}
      </div>

      {sehirBirinci && !turkiyeBirinci && (
        <p className="mt-1.5 text-sm font-bold text-neon">
          {cityName(data.city!.slug)}’ın 1 numarası olursun.
        </p>
      )}
      {turkiyeBirinci && (
        <p className="mt-1.5 text-sm font-bold text-neon">Türkiye 1 numarası olursun.</p>
      )}

      {/* Hedefe tek dokunusla ziplama — kullanicinin hesap yapmasini istemiyoruz */}
      {(!sehirBirinci || !turkiyeBirinci) && (
        <div className="mt-2 flex flex-wrap gap-2">
          {data.city && !sehirBirinci && !tekHedef && (
            <Hedef
              etiket={`${cityName(data.city.slug)}’da 1 numara`}
              tutar={data.city.firstPlace}
              onPick={onPick}
            />
          )}
          {!turkiyeBirinci && (
            <Hedef etiket="Türkiye 1 numara" tutar={data.national.firstPlace} onPick={onPick} />
          )}
        </div>
      )}
    </div>
  )
}

function Hedef({
  etiket,
  tutar,
  onPick,
}: {
  etiket: string
  tutar: number
  onPick?: (kurus: number) => void
}) {
  const icerik = (
    <>
      {etiket}: <strong className="text-text">{tl(tutar)}</strong>
    </>
  )

  if (!onPick) return <span className="text-xs text-muted">{icerik}</span>

  return (
    <button
      type="button"
      onClick={() => onPick(tutar)}
      className="rounded-full border border-line px-2.5 py-1 text-xs text-muted transition hover:border-neon/60 hover:text-text"
    >
      {icerik}
    </button>
  )
}
