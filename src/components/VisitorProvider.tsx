'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Sayim = { aktif: number; ziyaretci: number } | null

const Ctx = createContext<Sayim>(null)

/**
 * Ziyaretci nabzi TEK YERDE, kok yerlesimde.
 *
 * Onceden yalnizca anasayfadaki serit ping atiyordu; sehir tahtasina ya da
 * ilan sayfasina gelen hic sayilmiyordu. Artik hangi sayfa acilirsa acilsin
 * sayiliyor, ve tek istek atiliyor — serit de ayni sonucu okuyor.
 */
export function VisitorProvider({ children }: { children: React.ReactNode }) {
  const [sayim, setSayim] = useState<Sayim>(null)

  useEffect(() => {
    let alive = true

    const ping = async () => {
      // Ping HER ZAMAN atilir — arka plandaki sekme de bir ziyaretcidir.
      // "Su an burada" sayisini sismesin diye gorunurlugu sunucuya bildirip
      // karari orada veriyoruz.
      try {
        const res = await fetch('/api/ping', {
          method: 'POST',
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gorunur: document.visibilityState === 'visible' }),
        })
        if (!res.ok) return
        const d = await res.json()
        if (alive) setSayim({ aktif: d.aktif, ziyaretci: d.ziyaretci })
      } catch {
        // sessiz gec — sayac kritik yol degil
      }
    }

    ping()
    const id = setInterval(ping, 60_000)
    document.addEventListener('visibilitychange', ping)

    return () => {
      alive = false
      clearInterval(id)
      document.removeEventListener('visibilitychange', ping)
    }
  }, [])

  return <Ctx.Provider value={sayim}>{children}</Ctx.Provider>
}

/** Ping henuz donmediyse null — cagiran sunucudan gelen degeri gosterir. */
export function useZiyaretci(): Sayim {
  return useContext(Ctx)
}
