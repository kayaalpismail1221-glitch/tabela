import Link from 'next/link'
import type { Row } from '@/lib/board'
import { cityName } from '@/lib/cities'
import { tl } from '@/lib/format'
import { Avatar } from './Avatar'

function rankColor(rank: number) {
  if (rank === 1) return 'text-neon'
  if (rank <= 3) return 'text-text'
  return 'text-muted'
}

/** Zirvedeki ilan — tahtanin vitrini. */
export function TopSpot({ row }: { row: Row }) {
  return (
    <Link
      href={`/ilan/${row.id}`}
      className="pulse group block rounded-2xl border border-neon/40 bg-gradient-to-br from-surface-2 to-surface p-5 transition hover:border-neon"
    >
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-neon">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-neon" />
        Türkiye 1 numara
      </div>

      <div className="mt-4 flex items-start gap-4">
        <Avatar seed={row.url} label={row.name} size={64} imageUrl={row.imageUrl} />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-2xl font-black leading-tight">{row.name}</h2>
          <p className="mt-0.5 truncate text-sm text-muted">
            {row.label} · {cityName(row.city)}
            {row.district ? `, ${row.district}` : ''}
          </p>
          <p className="mt-2 line-clamp-2 text-sm text-text/80">{row.description}</p>
        </div>
        <div className="hidden text-right sm:block">
          <div className="neon text-3xl font-black text-neon">{tl(row.currentBid)}</div>
          <div className="text-xs text-muted">{row.clickCount.toLocaleString('tr-TR')} tıklama</div>
        </div>
      </div>

      <div className="mt-4 text-sm font-semibold text-neon group-hover:underline sm:hidden">
        {tl(row.currentBid)}
      </div>
    </Link>
  )
}

export function BoardRow({ row, showCity = true }: { row: Row; showCity?: boolean }) {
  return (
    <Link
      href={`/ilan/${row.id}`}
      className="flex items-center gap-3 border-b border-line px-3 py-3 transition hover:bg-surface sm:gap-4 sm:px-4"
    >
      <span
        className={`w-8 shrink-0 text-right text-lg font-black tabular-nums sm:w-10 sm:text-xl ${rankColor(row.rank)}`}
      >
        {row.rank}
      </span>

      <Avatar seed={row.url} label={row.name} imageUrl={row.imageUrl} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-bold">{row.name}</span>
          {row.nationalRank && row.nationalRank <= 50 && (
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

      <div className="shrink-0 text-right">
        <div className="font-bold tabular-nums">{tl(row.currentBid)}</div>
        <div className="text-[11px] text-muted">{row.clickCount.toLocaleString('tr-TR')} tık</div>
      </div>
    </Link>
  )
}

export function Board({ rows, showCity = true }: { rows: Row[]; showCity?: boolean }) {
  if (!rows.length) {
    return (
      <div className="rounded-2xl border border-dashed border-line p-10 text-center">
        <p className="text-lg font-bold">Burası henüz boş.</p>
        <p className="mt-1 text-sm text-muted">İlk ilanı veren 1 numara olur.</p>
        <Link
          href="/ilan-ver"
          className="mt-4 inline-block rounded-full bg-neon px-5 py-2 text-sm font-bold text-ink"
        >
          İlanı sen ver
        </Link>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface/40">
      {rows.map((r) => (
        <BoardRow key={r.id} row={r} showCity={showCity} />
      ))}
    </div>
  )
}
