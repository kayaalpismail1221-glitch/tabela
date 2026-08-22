'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { tl } from '@/lib/format'
import { MIN_ARTIS, TABAN_TEKLIF } from '@/lib/rules'

/**
 * Anasayfanin basligi bir baslik degil, bir FIYAT: "1 numarayi su kadara
 * alirsin". Ziyaretci daha ilk saniyede tahtanin ne kadara mal oldugunu
 * goruyor; − / + ile rakami kendi eliyle oynatabiliyor.
 */
export function ClaimFirst({
  zirveFiyati,
  zirve,
}: {
  zirveFiyati: number
  /** Tahti su an kim tutuyor. Bos tahta ile dolu tahta ayni cumleyi kurmaz:
   *  birinde davet var, digerinde rakip. `soz` sunucuda hesaplandi. */
  zirve?: { id: string; name: string; soz: string } | null
}) {
  const router = useRouter()
  const [tutar, setTutar] = useState(zirveFiyati)

  const oynat = (yon: 1 | -1) =>
    setTutar((t) => Math.max(TABAN_TEKLIF, t + yon * MIN_ARTIS))

  return (
    <div>
      <h1 className="text-3xl font-black leading-[1.1] sm:text-5xl">
        Türkiye’nin ve şehrinin
        <br />
        <span className="neon text-neon">en iddialı</span> işletmesi ol
      </h1>

      <div className="mt-5 text-xl font-black sm:text-3xl">
        1 numarayı{' '}
        <span className="inline-flex items-center gap-2 align-middle">
          <Dugme label="azalt" onClick={() => oynat(-1)}>
            −
          </Dugme>
          <span className="tabular-nums text-neon">{tl(tutar)}</span>
          <Dugme label="artır" onClick={() => oynat(1)}>
            +
          </Dugme>
        </span>{' '}
        ’ye al
      </div>

      {zirve ? (
        <p className="mt-4 text-sm text-muted">
          Zirve şu an{' '}
          <Link href={`/ilan/${zirve.id}`} className="font-bold text-text hover:text-neon">
            {zirve.name}
          </Link>
          ’de — {zirve.soz}.
        </p>
      ) : (
        <p className="mt-4 text-sm text-muted">Taht boş. İlk ilanı veren 1 numara olur.</p>
      )}

      <p className="mx-auto mt-3 max-w-lg text-balance text-sm text-muted">
        Yeni ilanlar <span className="text-text">{tl(TABAN_TEKLIF)}</span>’den başlıyor. Daha az
        verirsen de tahtaya girersin — tutarının hak ettiği sıraya oturursun.
      </p>

      <button
        onClick={() => router.push(`/ilan-ver?teklif=${Math.round(tutar / 100)}`)}
        className="mt-6 rounded-full bg-neon px-8 py-3 font-black text-ink transition hover:brightness-110"
      >
        Tahtaya çık
      </button>
    </div>
  )
}

function Dugme({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid h-8 w-8 place-items-center rounded-full border border-line bg-surface text-lg font-bold text-muted transition hover:border-neon/60 hover:text-text sm:h-9 sm:w-9"
    >
      {children}
    </button>
  )
}
