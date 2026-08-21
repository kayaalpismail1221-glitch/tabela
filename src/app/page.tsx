import Link from 'next/link'
import { getBoard, getCityChampions, getActivity, getTopBid } from '@/lib/board'
import { Board, TopSpot } from '@/components/Board'
import { CityChampions } from '@/components/CityChampions'
import { ActivityFeed } from '@/components/ActivityFeed'
import { LivePill } from '@/components/LivePill'
import { ClaimFirst } from '@/components/ClaimFirst'
import { TotalRaised } from '@/components/TotalRaised'
import { getRakamlar } from '@/lib/stats'
import { priceOfFirstPlace } from '@/lib/rules'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [rows, champions, activity, rakamlar, topBid] = await Promise.all([
    getBoard(undefined, 50),
    getCityChampions(),
    getActivity(20),
    getRakamlar(),
    getTopBid(),
  ])

  const [first, ...rest] = rows

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <section className="text-center">
        <LivePill aktif={rakamlar.aktif} ziyaretci={rakamlar.ziyaretci} />

        <div className="mt-6">
          <ClaimFirst zirveFiyati={priceOfFirstPlace(topBid)} />
        </div>

        <p className="mt-6 text-sm text-muted">
          <Link href="/kurallar" className="hover:text-text">
            Nasıl çalışıyor?
          </Link>
        </p>
      </section>

      <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div>
          {first && <TopSpot row={first} />}
          <div className="mt-4">
            <Board rows={rest} />
          </div>
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
