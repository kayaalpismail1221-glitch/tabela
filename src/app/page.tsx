import Link from 'next/link'
import { getBoard, getCityChampions, getActivity, getTopBid, getZirve } from '@/lib/board'
import { Board } from '@/components/Board'
import { CityChampions } from '@/components/CityChampions'
import { ActivityFeed } from '@/components/ActivityFeed'
import { LivePill } from '@/components/LivePill'
import { ClaimFirst } from '@/components/ClaimFirst'
import { TotalRaised } from '@/components/TotalRaised'
import { ziyaretKaydet } from '@/lib/stats'
import { headers } from 'next/headers'
import { priceOfFirstPlace } from '@/lib/rules'
import { tahtSozu } from '@/lib/format'

export const dynamic = 'force-dynamic'

/**
 * Ziyaretciyi sunucuda da isaretliyoruz: aksi halde ilk boyamada ziyaret
 * HENUZ kaydedilmedigi icin "0 kisi burada" gorunup saniye sonra 1'e
 * sicriyordu — bozuk gibi duruyordu.
 */
async function ziyaretiKaydet() {
  const h = await headers()
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'yok'
  return ziyaretKaydet(ip, h.get('user-agent') ?? 'yok')
}

export default async function HomePage() {
  const [rows, champions, activity, rakamlar, topBid, zirve] = await Promise.all([
    getBoard(undefined, 50),
    getCityChampions(),
    getActivity(20),
    ziyaretiKaydet(),
    getTopBid(),
    getZirve(),
  ])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <section className="text-center">
        <LivePill aktif={rakamlar.aktif} ziyaretci={rakamlar.ziyaretci} />

        <div className="mt-6">
          <ClaimFirst
            zirveFiyati={priceOfFirstPlace(topBid)}
            zirve={
              zirve && zirve.topSince
                ? { id: zirve.id, name: zirve.name, soz: tahtSozu(zirve.topSince) }
                : null
            }
          />
        </div>

        <p className="mt-6 text-sm text-muted">
          <Link href="/kurallar" className="hover:text-text">
            Nasıl çalışıyor?
          </Link>
        </p>
      </section>

      <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div>
          <Board rows={rows} ayracEtiketi="Türkiye ilk 3" />
        </div>

        <div className="lg:sticky lg:top-20 lg:self-start">
          <ActivityFeed
            initial={activity.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() }))}
          />
        </div>
      </div>

      <div className="mt-16">
        <CityChampions champions={champions} />
      </div>

      {/* Rakami saklamak yerine one koymak — 0 TL yaziyorsa 0 TL yazar */}
      <TotalRaised r={rakamlar} />
    </div>
  )
}
