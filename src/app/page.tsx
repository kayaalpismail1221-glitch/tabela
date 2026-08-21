import Link from 'next/link'
import { getBoard, getCityChampions, getActivity, getStats } from '@/lib/board'
import { Board, TopSpot } from '@/components/Board'
import { CityChampions } from '@/components/CityChampions'
import { ActivityFeed } from '@/components/ActivityFeed'
import { tl } from '@/lib/format'
import { TABAN_TEKLIF } from '@/lib/rules'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [rows, champions, activity, stats] = await Promise.all([
    getBoard(undefined, 50),
    getCityChampions(),
    getActivity(20),
    getStats(),
  ])

  const [first, ...rest] = rows

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <section className="text-center">
        <h1 className="text-4xl font-black leading-[1.05] sm:text-6xl">
          Türkiye’nin
          <br />
          <span className="neon text-neon">en iddialı</span> restoranları
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-balance text-muted">
          Sıra teklife göre. Kim daha çok verirse üstte. Şehrinde 1 numara olmak{' '}
          <span className="font-bold text-text">{tl(TABAN_TEKLIF)}</span>’den başlıyor.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/ilan-ver"
            className="rounded-full bg-neon px-6 py-3 font-bold text-ink transition hover:brightness-110"
          >
            İlan Ver
          </Link>
          <Link
            href="/kurallar"
            className="rounded-full border border-line px-6 py-3 font-bold transition hover:border-neon/60"
          >
            Nasıl çalışıyor?
          </Link>
        </div>

        <dl className="mx-auto mt-8 grid max-w-lg grid-cols-3 gap-3 text-sm">
          <Stat label="ilan" value={stats.listings.toLocaleString('tr-TR')} />
          <Stat label="şehir" value={`${stats.cities} / 81`} />
          <Stat label="toplam teklif" value={tl(stats.volume)} />
        </dl>
      </section>

      <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_20rem]">
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
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface/50 px-3 py-2">
      <dt className="text-[11px] uppercase tracking-wider text-muted">{label}</dt>
      <dd className="font-bold tabular-nums">{value}</dd>
    </div>
  )
}
