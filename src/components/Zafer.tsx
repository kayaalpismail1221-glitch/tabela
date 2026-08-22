'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { tl } from '@/lib/format'

/**
 * ZAFER EKRANI — dongunun paylasilan adimi.
 *
 * Teklif gectikten sonra sayfayi sessizce tazelemek, parayi alip hicbir sey
 * hissettirmemektir. Sirayi alan an gorulmeden kimse ekran goruntusu almiyor;
 * ekran goruntusu alinmadan da bu isin bedava dagitimi olmuyor.
 *
 * Ekran yalnizca GERCEK ve TAZE bir teklifle aciliyor — dogrulamayi sunucu
 * yapiyor (bkz. ilan sayfasi), burasi sadece gosteriyor.
 */
export function Zafer({
  listingId,
  name,
  cityLabel,
  nationalRank,
  cityRank,
  amount,
  paylasUrl,
  bildirimAdresi,
}: {
  listingId: string
  name: string
  cityLabel: string
  nationalRank: number
  cityRank: number
  amount: number
  /** Paylasilacak mutlak adres — sunucuda cozuluyor (bkz. src/lib/site.ts). */
  paylasUrl: string
  /** Uste cikilinca haber verilecek adres — yoksa uyari gosteriyoruz. */
  bildirimAdresi: string | null
}) {
  const router = useRouter()
  const [kopyalandi, setKopyalandi] = useState(false)

  const kapat = () => router.replace(`/ilan/${listingId}`, { scroll: false })

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && kapat()
    window.addEventListener('keydown', esc)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', esc)
      document.body.style.overflow = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const zirve = nationalRank === 1
  const sehirZirvesi = cityRank === 1

  const baslik = zirve
    ? 'TÜRKİYE 1 NUMARA'
    : sehirZirvesi
      ? `${cityLabel.toLocaleUpperCase('tr-TR')} 1 NUMARASI`
      : `TÜRKİYE ${nationalRank}.`

  const paylasMetni = zirve
    ? `${name} şu an Türkiye’nin 1 numarası. Geçebilene aşk olsun.`
    : sehirZirvesi
      ? `${name} ${cityLabel}’in 1 numarası. Geçmek isteyen buyursun.`
      : `${name} tahtada Türkiye ${nationalRank}., ${cityLabel} ${cityRank}. sırada.`

  async function kopyala() {
    try {
      await navigator.clipboard.writeText(`${paylasMetni} ${paylasUrl}`)
      setKopyalandi(true)
      setTimeout(() => setKopyalandi(false), 2000)
    } catch {
      // Pano izni yoksa sessiz gec — WhatsApp ve rozet yollari duruyor.
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/90 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Teklifin geçti"
      onClick={kapat}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="slide-in my-auto w-full max-w-md rounded-3xl border border-neon/40 bg-surface p-6 text-center shadow-[0_0_80px_-20px_#ffb020] sm:p-8"
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-cool">Teklifin geçti</p>

        <h2 className="neon mt-3 text-3xl font-black leading-tight text-neon sm:text-4xl">
          {baslik}
        </h2>

        <p className="mt-2 text-sm text-muted">
          <span className="text-text">{name}</span> · {tl(amount)} ·{' '}
          {zirve ? `${cityLabel} 1.` : `${cityLabel} ${cityRank}.`}
        </p>

        {/* Rozet: paylasilacak sey bu, kucuk ama gorunur dursun */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/rozet/${listingId}`}
          alt={`${name} story rozeti`}
          className="mx-auto mt-5 w-40 rounded-xl border border-line"
        />

        <div className="mt-5 grid gap-2">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${paylasMetni} ${paylasUrl}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-neon px-5 py-3 font-black text-ink transition hover:brightness-110"
          >
            WhatsApp’ta paylaş
          </a>

          <a
            href={`/rozet/${listingId}`}
            download={`tabela-${listingId}.png`}
            className="rounded-xl border border-line px-5 py-3 font-bold transition hover:border-neon/60"
          >
            Story rozetini indir
          </a>

          <button
            type="button"
            onClick={kopyala}
            className="rounded-xl border border-line px-5 py-3 font-bold transition hover:border-neon/60"
          >
            {kopyalandi ? 'Kopyalandı' : 'Bağlantıyı kopyala'}
          </button>
        </div>

        <p className="mt-5 text-xs text-muted">
          {bildirimAdresi ? (
            <>
              Üste çıkılırsa <span className="text-text">{bildirimAdresi}</span> adresine haber
              vereceğiz.
            </>
          ) : (
            <>Üste çıkıldığında haber verebilmemiz için ilanına bir e-posta ekle.</>
          )}
        </p>

        <button
          type="button"
          onClick={kapat}
          className="mt-3 text-xs text-muted underline underline-offset-4 hover:text-text"
        >
          Tahtaya dön
        </button>
      </div>
    </div>
  )
}
