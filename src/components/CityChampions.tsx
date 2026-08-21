import Link from 'next/link'
import type { Champion } from '@/lib/board'
import { tl } from '@/lib/format'
import { TABAN_TEKLIF } from '@/lib/rules'
import { Avatar } from './Avatar'

/**
 * 81 ilin 1 numarasi. Ekran goruntusu alinasi ekran burasi.
 * Bos kutular bilerek duruyor: "burasi bos" en iyi satis cumlesi.
 */
export function CityChampions({ champions }: { champions: Champion[] }) {
  const dolu = champions.filter((c) => c.listing).length

  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-black sm:text-2xl">Şehir Şampiyonları</h2>
        <p className="text-sm text-muted">
          <span className="font-bold text-text">{dolu}</span> ilin sahibi var,{' '}
          <span className="font-bold text-neon">{81 - dolu}</span> il boş.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {champions.map((c) => (
          <Link
            key={c.citySlug}
            href={`/${c.citySlug}`}
            className={
              c.listing
                ? 'group rounded-xl border border-line bg-surface p-3 transition hover:border-neon/60 hover:bg-surface-2'
                : 'group rounded-xl border border-dashed border-line/70 p-3 transition hover:border-neon/60'
            }
          >
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted">
              <span className="rounded bg-surface-2 px-1.5 py-0.5 tabular-nums">
                {String(c.plaka).padStart(2, '0')}
              </span>
              <span className="truncate">{c.cityName}</span>
            </div>

            {c.listing ? (
              <div className="mt-2.5 flex items-center gap-2.5">
                <Avatar
                  seed={c.listing.url}
                  label={c.listing.name}
                  size={34}
                  imageUrl={c.listing.imageUrl}
                />
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold leading-tight">{c.listing.name}</div>
                  <div className="truncate text-xs tabular-nums text-neon">
                    {tl(c.listing.currentBid)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-2.5">
                <div className="text-sm font-bold text-muted group-hover:text-text">Boş</div>
                <div className="text-xs text-muted/80">
                  {tl(TABAN_TEKLIF)} ile buranın 1 numarası ol
                </div>
              </div>
            )}
          </Link>
        ))}
      </div>
    </section>
  )
}
