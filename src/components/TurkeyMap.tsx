import type { Champion } from '@/lib/board'
import { HARITA_VIEWBOX, IL_YOLLARI } from '@/lib/turkeyMap'
import { tl } from '@/lib/format'
import { TABAN_TEKLIF } from '@/lib/rules'

/**
 * CANLI HARITA — sehir secmenin gorsel yolu.
 *
 * Tamamen SUNUCUDA ciziliyor: her il duz bir baglanti, tooltip yerel <title>.
 * Istemciye tek satir JS gitmiyor — 81 ile tiklama dinleyicisi bagli bir
 * harita, tahtanin en ucuz seyi olmasi gereken yerde en pahali seyi olurdu.
 *
 * Renk = o ilin 1 numarasinin teklifi. Bos il karanlik durur; karanlik il
 * "burasi bos" demenin en kisa yolu ve tahtanin sattigi sey o boslugun
 * kendisi. Dolu iller tekliflerine gore neon'a dogru isiyor: harita bir
 * bakista Turkiye'nin nerede cekistigini gosteriyor.
 */
export function TurkeyMap({ champions }: { champions: Champion[] }) {
  const enYuksek = champions.reduce((m, c) => Math.max(m, c.listing?.currentBid ?? 0), 0)
  const dolu = champions.filter((c) => c.listing).length

  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-2xl font-black">Canlı harita</h2>
        <p className="text-sm text-muted">
          {dolu > 0 ? (
            <>
              <span className="text-neon">{dolu}</span> il tutuldu,{' '}
              <span className="text-text">{81 - dolu}</span> il boş.
            </>
          ) : (
            <>81 il de boş. Haritadan seç, ilk sen tut.</>
          )}
        </p>
      </div>

      <div className="harita mt-4 rounded-2xl border border-line bg-surface/40 p-3 sm:p-5">
        <svg
          viewBox={HARITA_VIEWBOX}
          className="h-auto w-full"
          role="img"
          aria-label="Türkiye haritası — şehir seçmek için ile tıkla"
        >
          {champions.map((c) => {
            const yol = IL_YOLLARI[c.plaka]
            if (!yol) return null

            const teklif = c.listing?.currentBid ?? 0
            const oran = enYuksek > 0 ? teklif / enYuksek : 0
            // Bos il karanlik; dolu ilin en ucuzu bile gorunur olsun diye %30'dan basliyor.
            const dolgu = teklif
              ? `color-mix(in srgb, var(--color-neon) ${Math.round(30 + oran * 70)}%, var(--color-surface-2))`
              : 'var(--color-surface-2)'

            const ipucu = c.listing
              ? `${c.cityName} · 1 numara: ${c.listing.name} — ${tl(teklif)}`
              : `${c.cityName} · boş — ${tl(TABAN_TEKLIF)} ile buranın 1 numarası ol`

            return (
              <a key={c.citySlug} href={`/${c.citySlug}`} aria-label={ipucu}>
                <title>{ipucu}</title>
                <path d={yol} style={{ fill: dolgu }} />
              </a>
            )
          })}
        </svg>
      </div>

      <p className="mt-2 text-xs text-muted">
        İl ne kadar parlaksa oradaki 1 numaranın teklifi o kadar yüksek. Karanlık iller boş.
      </p>
    </section>
  )
}
