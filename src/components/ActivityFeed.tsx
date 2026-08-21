'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { cityName } from '@/lib/cities'
import { tl, since } from '@/lib/format'

type Item = {
  id: string
  amount: number
  label: string
  name: string
  city: string
  passedLabel: string | null
  rankAfter: number | null
  createdAt: string
}

/**
 * Tahtayi izlenebilir yapan sey tahta degil, tahtin el degistirmesi.
 * v0'da 8 saniyede bir yoklama; hacim artinca Pusher'a tasinir.
 */
export function ActivityFeed({ initial }: { initial: Item[] }) {
  const [items, setItems] = useState<Item[]>(initial)
  const [freshId, setFreshId] = useState<string | null>(null)

  useEffect(() => {
    let alive = true

    const tick = async () => {
      try {
        const res = await fetch('/api/activity', { cache: 'no-store' })
        if (!res.ok) return
        const data: Item[] = await res.json()
        if (!alive || !data.length) return
        setItems((prev) => {
          if (prev[0]?.id !== data[0].id) setFreshId(data[0].id)
          return data
        })
      } catch {
        // sessiz gec — akis kritik yol degil
      }
    }

    const id = setInterval(tick, 8000)
    return () => {
      alive = false
      clearInterval(id)
    }
  }, [])

  return (
    <aside className="rounded-2xl border border-line bg-surface/40">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cool opacity-70" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-cool" />
        </span>
        <h2 className="text-sm font-bold uppercase tracking-widest">Canlı çekişme</h2>
      </div>

      <ul className="max-h-[520px] divide-y divide-line overflow-y-auto">
        {items.map((it) => (
          <li
            key={it.id}
            className={`px-4 py-3 text-sm ${it.id === freshId ? 'slide-in bg-neon/5' : ''}`}
          >
            <Link href={`/${it.city}`} className="text-[11px] uppercase tracking-wider text-muted">
              {cityName(it.city)}
            </Link>
            <p className="mt-0.5 leading-snug">
              <span className="font-bold">{it.name}</span>{' '}
              {it.passedLabel ? (
                <>
                  <span className="text-muted">şunu geçti:</span>{' '}
                  <span className="text-hot">{it.passedLabel}</span>
                </>
              ) : (
                <span className="text-muted">tahtaya çıktı</span>
              )}
            </p>
            <p className="mt-1 flex items-center gap-2 text-xs">
              <span className="font-bold tabular-nums text-neon">{tl(it.amount)}</span>
              <span className="text-muted">{since(it.createdAt)}</span>
            </p>
          </li>
        ))}

        {!items.length && (
          <li className="px-4 py-6 text-center text-sm text-muted">Henüz hareket yok.</li>
        )}
      </ul>
    </aside>
  )
}
