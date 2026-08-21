'use client'

import { useZiyaretci } from './VisitorProvider'

/**
 * Sayfanin en ustundeki canli serit. Kendi istegini ATMIYOR — sayimi kok
 * yerlesimdeki VisitorProvider yapiyor, burasi yalnizca gosteriyor.
 * Ping donene kadar sunucudan gelen deger duruyor, sifir yanip sonmuyor.
 */
export function LivePill({ aktif, ziyaretci }: { aktif: number; ziyaretci: number }) {
  const canli = useZiyaretci()
  const n = canli ?? { aktif, ziyaretci }

  const sayi = (x: number) => x.toLocaleString('tr-TR')

  return (
    <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-line bg-surface/60 px-4 py-1.5 text-xs sm:text-sm">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cool opacity-70" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-cool" />
      </span>
      <span className="font-bold text-cool">{sayi(n.aktif)} kişi burada</span>
      <span className="text-muted">·</span>
      <span className="text-muted">
        açılıştan beri <span className="text-text">{sayi(n.ziyaretci)}</span> ziyaretçi
      </span>
    </div>
  )
}
