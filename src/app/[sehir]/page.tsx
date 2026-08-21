import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getBoard } from '@/lib/board'
import { cityBySlug, CITIES } from '@/lib/cities'
import { Board } from '@/components/Board'
import { tl } from '@/lib/format'
import { TABAN_TEKLIF } from '@/lib/rules'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: PageProps<'/[sehir]'>): Promise<Metadata> {
  const { sehir } = await params
  const city = cityBySlug(sehir)
  if (!city) return {}
  return {
    title: `${city.name} tahtası — Tabela`,
    description: `${city.name}’nin en iddialı işletmeleri. Sıra teklife göre.`,
  }
}

export default async function CityPage({ params }: PageProps<'/[sehir]'>) {
  const { sehir } = await params
  const city = cityBySlug(sehir)
  if (!city) notFound()

  const rows = await getBoard(city.slug, 50)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <nav className="text-sm text-muted">
        <Link href="/" className="hover:text-text">
          Türkiye
        </Link>
        <span className="mx-2">/</span>
        <span className="text-text">{city.name}</span>
      </nav>

      <header className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black sm:text-5xl">
            {city.name} <span className="neon text-neon">tahtası</span>
          </h1>
          <p className="mt-2 text-muted">
            {rows.length ? `${rows.length} ilan` : 'Henüz ilan yok'} · plaka {city.plaka}
          </p>
        </div>
        <Link
          href={`/ilan-ver?sehir=${city.slug}`}
          className="rounded-full bg-neon px-5 py-2.5 font-bold text-ink transition hover:brightness-110"
        >
          {rows.length ? 'Bu tahtaya gir' : 'İlk ilanı sen ver'}
        </Link>
      </header>

      <div className="mt-8">
        <Board
          rows={rows}
          showCity={false}
          ayracEtiketi={`${city.name} ilk 3`}
          bosMesaj={`${city.name}’de ilk ilanı veren buranın 1 numarası olur.`}
        />
      </div>

      {!rows.length && (
        <p className="mt-6 text-center text-sm text-muted">
          {city.name}’de tahtayı kimse almamış. {tl(TABAN_TEKLIF)} ile buranın 1 numarası olabilir
          ve anasayfadaki Şehir Şampiyonları listesine girebilirsin.
        </p>
      )}

      <section className="mt-16">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted">Diğer şehirler</h2>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {CITIES.filter((c) => c.slug !== city.slug).map((c) => (
            <Link
              key={c.slug}
              href={`/${c.slug}`}
              className="rounded-full border border-line px-2.5 py-1 text-xs text-muted transition hover:border-neon/60 hover:text-text"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
