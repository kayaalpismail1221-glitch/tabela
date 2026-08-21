import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getBoard } from '@/lib/board'
import { cityBySlug, CITIES } from '@/lib/cities'
import { Board } from '@/components/Board'
import { tl } from '@/lib/format'
import { TABAN_TEKLIF } from '@/lib/rules'
import { Avatar } from '@/components/Avatar'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: PageProps<'/[sehir]'>): Promise<Metadata> {
  const { sehir } = await params
  const city = cityBySlug(sehir)
  if (!city) return {}
  return {
    title: `${city.name} tahtası — Tabela`,
    description: `${city.name}’nin en iddialı restoranları. Sıra teklife göre.`,
  }
}

export default async function CityPage({ params }: PageProps<'/[sehir]'>) {
  const { sehir } = await params
  const city = cityBySlug(sehir)
  if (!city) notFound()

  const rows = await getBoard(city.slug, 50)
  const [champ, ...rest] = rows

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
          {champ ? 'Bu tahtaya gir' : 'İlk ilanı sen ver'}
        </Link>
      </header>

      {champ && (
        <Link
          href={`/ilan/${champ.id}`}
          className="mt-8 flex items-center gap-4 rounded-2xl border border-neon/40 bg-gradient-to-br from-surface-2 to-surface p-5 transition hover:border-neon"
        >
          <Avatar seed={champ.handle} label={champ.name} size={56} imageUrl={champ.imageUrl} />
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold uppercase tracking-widest text-neon">
              {city.name} 1 numara
            </div>
            <div className="truncate text-xl font-black">{champ.name}</div>
            <div className="truncate text-sm text-muted">
              @{champ.handle}
              {champ.nationalRank ? ` · Türkiye ${champ.nationalRank}.` : ''}
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="neon text-xl font-black text-neon">{tl(champ.currentBid)}</div>
          </div>
        </Link>
      )}

      <div className="mt-4">
        {rest.length > 0 ? (
          <Board rows={rest} showCity={false} />
        ) : champ ? (
          // Sampiyon var ama rakibi yok — "burasi bos" demek yaniltici olurdu.
          <div className="rounded-2xl border border-dashed border-line p-8 text-center">
            <p className="font-bold">{champ.name} bu şehirde rakipsiz.</p>
            <p className="mt-1 text-sm text-muted">
              {tl(champ.currentBid)} teklifle tahtayı tek başına tutuyor.
            </p>
            <Link
              href={`/ilan-ver?sehir=${city.slug}`}
              className="mt-4 inline-block rounded-full bg-neon px-5 py-2 text-sm font-bold text-ink"
            >
              Meydan oku
            </Link>
          </div>
        ) : (
          <Board rows={[]} showCity={false} />
        )}
      </div>

      {!champ && (
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
