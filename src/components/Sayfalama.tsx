import Link from 'next/link'

/**
 * Sayfa gec/geri. Tahta 50'yi asinca burada devreye giriyor — tek sayfada
 * sonsuza kadar buyumek yerine "Turkiye Top" 50'lik dilimler halinde.
 *
 * `taban`a `?sayfa=N` eklenerek gidiliyor; N=1 icin parametre hic yazilmiyor
 * ki anasayfanin adresi `/`de kalsin (paylasilan/yer imlenen link sabit olsun).
 */
export function Sayfalama({
  sayfa,
  toplamSayfa,
  taban,
}: {
  sayfa: number
  toplamSayfa: number
  taban: string
}) {
  if (toplamSayfa <= 1) return null

  const adres = (n: number) => (n <= 1 ? taban : `${taban}?sayfa=${n}`)

  return (
    <nav className="mt-6 flex items-center justify-center gap-3 text-sm">
      {sayfa > 1 ? (
        <Link
          href={adres(sayfa - 1)}
          className="rounded-full border border-line px-4 py-2 font-bold transition hover:border-neon/60"
        >
          ← Önceki
        </Link>
      ) : (
        <span className="rounded-full border border-line/40 px-4 py-2 font-bold text-muted/50">
          ← Önceki
        </span>
      )}

      <span className="text-muted">
        Sayfa <span className="font-bold text-text">{sayfa}</span> / {toplamSayfa}
      </span>

      {sayfa < toplamSayfa ? (
        <Link
          href={adres(sayfa + 1)}
          className="rounded-full border border-line px-4 py-2 font-bold transition hover:border-neon/60"
        >
          Sonraki →
        </Link>
      ) : (
        <span className="rounded-full border border-line/40 px-4 py-2 font-bold text-muted/50">
          Sonraki →
        </span>
      )}
    </nav>
  )
}
