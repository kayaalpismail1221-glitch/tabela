import Link from 'next/link'
import type { Champion } from '@/lib/board'
import { tl } from '@/lib/format'
import { Avatar } from './Avatar'

/**
 * SEHRIN POPULERLERI — kesintisiz akan serit.
 *
 * Sehir sampiyonlari zaten asagida bir izgarada duruyor; oradan farki
 * HAREKET. Duran bir liste "burasi dolu" der, akan bir serit "burasi
 * calisiyor" der. Tahtanin canli oldugunu gosteren en ucuz sey bu.
 *
 * Animasyon saf CSS: serit iki kez basiliyor ve yarisi kadar kaydiriliyor,
 * boylece bas ve son birbirine dikissiz baglaniyor. JS yok.
 */

/** Serit ekrani doldurmadan donmesi tuhaf duruyor; taban liste bu sayiya tamamlaniyor. */
const EN_AZ_OGE = 12

export function PopulerSerit({ champions }: { champions: Champion[] }) {
  const dolular = champions.filter((c) => c.listing)
  if (!dolular.length) return null

  // Az sayida sampiyon varsa liste tekrarlanarak dolduruluyor.
  const taban: Champion[] = []
  while (taban.length < EN_AZ_OGE) taban.push(...dolular)

  // Ikinci kopya kaydirmanin dikissiz kapanmasi icin.
  const seri = [...taban, ...taban]

  return (
    <section className="rounded-2xl border border-neon/30 bg-surface/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest">
          <span aria-hidden>👑</span> Şehrin popülerleri
        </h2>
        <p className="text-xs text-muted">
          <span className="font-bold text-neon">{dolular.length}</span> şehirde taht kuruldu
        </p>
      </div>

      <div className="serit-kutu mt-3">
        {/* Sure oge sayisiyla oranli: kalabalik serit hizlanmasin. Katsayi
            olcuyle secildi — bir oge ~380px, saniyede ~50px rahat okunuyor. */}
        <div className="serit" style={{ animationDuration: `${taban.length * 8}s` }}>
          {seri.map((c, i) => (
            <Link
              key={`${c.citySlug}-${i}`}
              href={`/ilan/${c.listing!.id}`}
              className="mr-2 flex shrink-0 items-center gap-2 rounded-full border border-line bg-ink py-1.5 pl-1.5 pr-3 transition hover:border-neon/60"
            >
              <Avatar
                seed={c.listing!.url}
                label={c.listing!.name}
                size={28}
                imageUrl={c.listing!.imageUrl}
              />
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                {String(c.plaka).padStart(2, '0')} · {c.cityName}
              </span>
              <span className="max-w-[10rem] truncate text-sm font-bold">{c.listing!.name}</span>
              <span className="shrink-0 rounded-full bg-neon/15 px-2 py-0.5 text-xs font-black tabular-nums text-neon">
                {tl(c.listing!.currentBid)}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
