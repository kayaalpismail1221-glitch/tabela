import { ListingForm } from '@/components/ListingForm'
import { getTopBid } from '@/lib/board'
import { priceOfFirstPlace, TABAN_TEKLIF } from '@/lib/rules'
import { tl } from '@/lib/format'
import { cityBySlug } from '@/lib/cities'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'İlan Ver — Tabela' }

export default async function IlanVerPage({ searchParams }: PageProps<'/ilan-ver'>) {
  const sp = await searchParams
  const raw = typeof sp.sehir === 'string' ? sp.sehir : ''
  const defaultCity = cityBySlug(raw) ? raw : ''

  const topBid = await getTopBid()

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:py-12">
      <h1 className="text-3xl font-black sm:text-4xl">Tahtaya çık</h1>
      <p className="mt-2 text-muted">
        Tek liste, iki görünüm: ilanın hem Türkiye tahtasında hem şehir tahtanda görünür.
        Şehrinde 1 numara olmak <strong className="text-text">{tl(TABAN_TEKLIF)}</strong>’den
        başlıyor.
      </p>

      <div className="mt-8">
        <ListingForm defaultCity={defaultCity} firstPlace={priceOfFirstPlace(topBid)} />
      </div>
    </div>
  )
}
