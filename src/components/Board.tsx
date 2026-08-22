import Link from 'next/link'
import type { Row } from '@/lib/board'
import { cityName } from '@/lib/cities'
import { tl, since, tahtSozu } from '@/lib/format'
import { Avatar } from './Avatar'

/**
 * Ilk uc sira BUYUK kart, gerisi duz satir.
 *
 * Sebep: tahtanin sattigi sey "listede olmak" degil, "ustte olmak". Ucuncu
 * ile dorduncu arasindaki gorsel ucurum, dorduncunun teklif yukseltme
 * sebebinin ta kendisi.
 */
const VURGU = [
  'border-neon/60 bg-gradient-to-br from-neon/10 to-surface',
  'border-neon/35 bg-gradient-to-br from-neon/[0.06] to-surface',
  'border-neon/25 bg-gradient-to-br from-neon/[0.04] to-surface',
]

function Zaman({ row }: { row: Row }) {
  return (
    <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted">
      {row.lastBidAt && <span>{since(row.lastBidAt)}</span>}
      {row.lastBidAt && <span className="text-neon/60">•</span>}
      <span className="font-bold text-text/70">
        {row.clickCount.toLocaleString('tr-TR')} tıklama
      </span>
    </span>
  )
}

function TopCard({ row, showCity }: { row: Row; showCity: boolean }) {
  const taht = row.rank === 1 && !row.nationalRank && row.topSince ? tahtSozu(row.topSince) : null

  return (
    <div
      className={`group relative flex items-start gap-3 rounded-2xl border p-4 transition hover:brightness-110 sm:gap-4 sm:p-5 ${VURGU[row.rank - 1] ?? VURGU[2]}`}
    >
      {/* Gizli ana link: tum karti kaplar, disariya yonlendirir (yeni sekmede).
          ⚠️ Digger icerik `position` VERMIYOR bilerek: pozisyonlanmis
          (position != static) elemanlar, z-index'ten BAGIMSIZ olarak normal
          akistaki (static) elemanlarin HER ZAMAN ustunde boyanir/tiklamayi
          yakalar. Once icerige `relative z-10` verilmisti — bu onu bu
          gorunmez linkten daha yuksek katmana koyuyordu ve isim/aciklama/
          rozet/avatar UZERINE gelen tiklamalar hicbir yere gitmiyordu; yalniz
          bu ogelerin ARASINDAKI bosluklar tiklanabiliyordu. Simdi tersi:
          icerik duz akista (position yok), yalniz "Yukselt" linki kendi
          hedefine gitsin diye `relative z-10` ile bu overlay'in USTUNE
          cikariliyor. */}
      <a href={`/git/${row.id}`} target="_blank" rel="noopener noreferrer" className="absolute inset-0" />

      <span
        className={`mt-0.5 shrink-0 rounded-full bg-neon px-2.5 py-1 text-sm font-black tabular-nums text-ink ${row.rank === 1 ? 'pulse' : ''}`}
      >
        #{row.rank}
      </span>

      <Avatar seed={row.url} label={row.name} size={52} imageUrl={row.imageUrl} />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="truncate text-lg font-black sm:text-xl">{row.name}</span>
          <span className="truncate text-xs text-muted">
            {row.label}
            {showCity && ` · ${cityName(row.city)}`}
            {row.district ? `, ${row.district}` : ''}
          </span>
          {row.nationalRank && (
            <span className="shrink-0 rounded-full border border-line px-2 py-0.5 text-[10px] font-bold text-muted">
              Türkiye {row.nationalRank}.
            </span>
          )}
        </div>

        <p className="mt-1 line-clamp-2 text-sm text-text/80">{row.description}</p>

        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
          <Zaman row={row} />
          {taht && (
            <span className="rounded-full border border-neon/40 px-2 py-0.5 text-[10px] font-bold text-neon">
              {taht}
            </span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="text-right text-lg font-black tabular-nums text-neon sm:text-2xl">
          {tl(row.currentBid)}
        </span>
        <Link
          href={`/ilan/${row.id}`}
          className="relative z-10 rounded-full bg-neon/10 px-3 py-1 text-xs font-bold text-neon transition hover:bg-neon/20"
        >
          Yükselt
        </Link>
      </div>
    </div>
  )
}

/** Dorduncu ve sonrasi. */
export function BoardRow({ row, showCity = true }: { row: Row; showCity?: boolean }) {
  return (
    <div className="group relative flex items-center gap-3 border-b border-line px-3 py-3 transition hover:bg-surface sm:gap-4 sm:px-4">
      {/* Ayni kural TopCard'da anlatildi: icerik position ALMAZ, yalniz
          "Yukselt" linki `relative z-10` ile bu gorunmez linkin ustune cikar. */}
      <a href={`/git/${row.id}`} target="_blank" rel="noopener noreferrer" className="absolute inset-0" />

      <span className="w-8 shrink-0 text-right text-base font-black tabular-nums text-muted sm:w-10">
        {row.rank}
      </span>

      <Avatar seed={row.url} label={row.name} imageUrl={row.imageUrl} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-bold">{row.name}</span>
          {row.nationalRank && (
            <span className="hidden shrink-0 rounded-full border border-line px-2 py-0.5 text-[10px] font-bold text-muted sm:inline">
              Türkiye {row.nationalRank}.
            </span>
          )}
        </div>
        <div className="truncate text-xs text-muted">
          {row.label}
          {showCity && ` · ${cityName(row.city)}`}
          {row.district ? `, ${row.district}` : ''}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3 text-right">
        <div className="hidden flex-col items-end sm:flex">
          <div className="font-bold tabular-nums">{tl(row.currentBid)}</div>
          <div className="text-[11px] text-muted">{row.clickCount.toLocaleString('tr-TR')} tık</div>
        </div>
        <Link
          href={`/ilan/${row.id}`}
          className="relative z-10 rounded-full bg-neon/10 px-3 py-1.5 text-xs font-bold text-neon transition hover:bg-neon/20"
        >
          <span className="sm:hidden">{tl(row.currentBid)}</span>
          <span className="hidden sm:inline">Yükselt</span>
        </Link>
      </div>
    </div>
  )
}

function Ayrac({ etiket }: { etiket: string }) {
  return (
    <div className="my-6 flex items-center gap-4">
      <span className="h-px flex-1 bg-line" />
      <span className="rounded-full border border-neon/40 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-neon">
        {etiket}
      </span>
      <span className="h-px flex-1 bg-line" />
    </div>
  )
}

/**
 * Bir sayfadaki BUYUK kart sayisi. 10 — ilk sayfanin "populer 3"unden
 * genisletildi (2026-08-22 karari): tahtanin en gorunur kismi buyudu.
 */
const BUYUK_SAYISI = 10

export function Board({
  rows,
  showCity = true,
  bosMesaj = 'İlk ilanı veren 1 numara olur.',
  ayracEtiketi = 'İlk 10',
}: {
  rows: Row[]
  showCity?: boolean
  bosMesaj?: string
  ayracEtiketi?: string
}) {
  if (!rows.length) {
    return (
      <div className="rounded-2xl border border-dashed border-line p-10 text-center">
        <p className="text-lg font-bold">Burası henüz boş.</p>
        <p className="mt-1 text-sm text-muted">{bosMesaj}</p>
        <Link
          href="/ilan-ver"
          className="mt-4 inline-block rounded-full bg-neon px-5 py-2 text-sm font-bold text-ink"
        >
          İlanı sen ver
        </Link>
      </div>
    )
  }

  // rows sayfalanmis gelebiliyor (bkz. getBoard skip); 2. sayfada "ilk 10"
  // kurali GECERLI DEGIL — buyuk kart yalniz sayfanin gercekten basiysa
  // (rank 1'den basliyorsa) gosterilir, yoksa 51-60 gibi bir aralik da
  // "buyuk" gorunup yanlis bir ust siralama iddia ederdi.
  const sayfaBasiMi = rows[0]?.rank === 1
  const buyukler = sayfaBasiMi ? rows.slice(0, BUYUK_SAYISI) : []
  const gerisi = sayfaBasiMi ? rows.slice(BUYUK_SAYISI) : rows

  return (
    <div>
      {buyukler.length > 0 && (
        <div className="space-y-3">
          {buyukler.map((r) => (
            <TopCard key={r.id} row={r} showCity={showCity} />
          ))}
        </div>
      )}

      {/* Ayrac buyukler DOLDUGUNDA anlamli; kucuk bir tahtada gurultu olur */}
      {buyukler.length === BUYUK_SAYISI && gerisi.length > 0 && <Ayrac etiket={ayracEtiketi} />}

      {gerisi.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-line bg-surface/40">
          {gerisi.map((r) => (
            <BoardRow key={r.id} row={r} showCity={showCity} />
          ))}
        </div>
      )}
    </div>
  )
}
