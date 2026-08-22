import { ListingForm } from '@/components/ListingForm'
import { TABAN_TEKLIF } from '@/lib/rules'
import { cityBySlug } from '@/lib/cities'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'İlan Ver — Tabela' }

export default async function IlanVerPage({ searchParams }: PageProps<'/ilan-ver'>) {
  const sp = await searchParams
  const raw = typeof sp.sehir === 'string' ? sp.sehir : ''
  const defaultCity = cityBySlug(raw) ? raw : ''

  // Anasayfadaki "1 numarayi X'e al" secimi forma tasiniyor
  const teklifRaw = typeof sp.teklif === 'string' ? Number(sp.teklif) : NaN
  const defaultLira =
    Number.isFinite(teklifRaw) && teklifRaw >= TABAN_TEKLIF / 100 ? Math.round(teklifRaw) : null

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:py-12">
      <h1 className="text-3xl font-black sm:text-4xl">Tahtaya çık</h1>
      <p className="mt-2 text-muted">
        Tek liste, iki görünüm: ilanın hem Türkiye tahtasında hem şehir tahtanda görünür.{' '}
        <strong className="text-text">Şehrinin en popüleri ol.</strong>
      </p>

      <div className="mt-8">
        <ListingForm defaultCity={defaultCity} defaultLira={defaultLira} />
      </div>
    </div>
  )
}
