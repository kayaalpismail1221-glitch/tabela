'use client'

import { useEffect, useState } from 'react'

/**
 * Sayfanin en ustundeki canli serit: su an kac kisi burada, acilistan beri
 * kac ziyaretci geldi. Ayni istek ziyaretciyi de kaydediyor — sayac ile
 * ziyaret tek turda hallolsun diye.
 */
export function LivePill({ aktif, ziyaretci }: { aktif: number; ziyaretci: number }) {
  const [n, setN] = useState({ aktif, ziyaretci })

  useEffect(() => {
    let alive = true

    const ping = async () => {
      try {
        const res = await fetch('/api/ping', { method: 'POST', cache: 'no-store' })
        if (!res.ok) return
        const d = await res.json()
        if (alive) setN({ aktif: d.aktif, ziyaretci: d.ziyaretci })
      } catch {
        // sessiz gec — sayac kritik yol degil
      }
    }

    ping()
    const id = setInterval(ping, 60_000)
    return () => {
      alive = false
      clearInterval(id)
    }
  }, [])

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
