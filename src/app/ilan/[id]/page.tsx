import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { cityName } from '@/lib/cities'
import { parseLink } from '@/lib/links'
import { tl, since, tahtSozu } from '@/lib/format'
import { suggestedMinimum, priceOfFirstPlace } from '@/lib/rules'
import { Avatar } from '@/components/Avatar'
import { BidForm } from '@/components/BidForm'
import { Zafer } from '@/components/Zafer'
import { mutlak } from '@/lib/site'

export const dynamic = 'force-dynamic'

/** Zafer ekrani bu sure icinde acilir; eski bir baglantiyla tekrar acilmaz. */
const ZAFER_PENCERESI_MS = 2 * 60 * 60 * 1000

export default async function ListingPage({ params, searchParams }: PageProps<'/ilan/[id]'>) {
  const { id } = await params
  const sp = await searchParams

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { bids: { where: { status: 'PAID' }, orderBy: { createdAt: 'desc' }, take: 10 } },
  })
  if (!listing) notFound()

  const [cityAbove, nationalAbove, top] = await Promise.all([
    prisma.listing.count({
      where: { city: listing.city, currentBid: { gt: listing.currentBid } },
    }),
    prisma.listing.count({ where: { currentBid: { gt: listing.currentBid } } }),
    prisma.listing.findFirst({
      where: { currentBid: { gt: 0 } },
      orderBy: { currentBid: 'desc' },
      select: { currentBid: true },
    }),
  ])

  const cityRank = cityAbove + 1
  const nationalRank = nationalAbove + 1
  const topBid = top?.currentBid ?? 0
  const link = parseLink(listing.url)

  // Zafer ekrani yalnizca GERCEK, ODENMIS ve TAZE bir teklifle acilir:
  // adres cubuguna ?zafer=... yazip kendine kupa dagitilmasin.
  const zaferId = typeof sp.zafer === 'string' && sp.zafer ? sp.zafer : null
  const zaferBid = zaferId ? await zaferTeklifi(zaferId, listing.id) : null

  // "Uste cikildin" mailindeki dugme buraya tutar tasiyor; kutu o rakamla acilir.
  const geriAlLira = Number(typeof sp.geriAl === 'string' ? sp.geriAl : NaN)
  const baslangic =
    Number.isFinite(geriAlLira) && geriAlLira > 0 ? Math.round(geriAlLira) * 100 : null

  const odeme = typeof sp.odeme === 'string' ? sp.odeme : null

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      {zaferBid && (
        <Zafer
          listingId={listing.id}
          name={listing.name}
          cityLabel={cityName(listing.city)}
          nationalRank={nationalRank}
          cityRank={cityRank}
          amount={zaferBid.amount}
          paylasUrl={mutlak(`/ilan/${listing.id}`)}
          bildirimAdresi={listing.ownerEmail}
        />
      )}

      {/* Odeme donusu sessiz kalmasin: basarisiz odeme kullaniciya soylenir */}
      {(odeme === 'basarisiz' || odeme === 'hata') && (
        <p className="mb-5 rounded-xl border border-hot/50 bg-hot/10 px-4 py-3 text-sm text-hot">
          Ödeme tamamlanamadı, teklifin uygulanmadı. Kart hesabından tutar çekilmediyse tekrar
          deneyebilirsin.
        </p>
      )}

      <nav className="text-sm text-muted">
        <Link href="/" className="hover:text-text">
          Türkiye
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/${listing.city}`} className="hover:text-text">
          {cityName(listing.city)}
        </Link>
      </nav>

      <header className="mt-5 flex items-start gap-4">
        <Avatar seed={listing.url} label={listing.name} size={72} imageUrl={listing.imageUrl} />
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-black leading-tight sm:text-4xl">{listing.name}</h1>
          <p className="mt-1 text-muted">
            {link?.label ?? listing.url} · {cityName(listing.city)}
            {listing.district ? `, ${listing.district}` : ''}
          </p>
          {nationalRank === 1 && listing.topSince && (
            <p className="mt-2 inline-block rounded-full border border-neon/40 px-2.5 py-1 text-xs font-bold text-neon">
              {tahtSozu(listing.topSince)}
            </p>
          )}
          <p className="mt-3 text-text/80">{listing.description}</p>
        </div>
      </header>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Cell label="Türkiye" value={`${nationalRank}.`} accent={nationalRank === 1} />
        <Cell label={cityName(listing.city)} value={`${cityRank}.`} accent={cityRank === 1} />
        <Cell label="Teklif" value={tl(listing.currentBid)} />
        <Cell label="Tıklama" value={listing.clickCount.toLocaleString('tr-TR')} />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={`/git/${listing.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-line px-5 py-2.5 font-bold transition hover:border-neon/60"
        >
          {link?.kind === 'WEB' ? 'Siteye git' : 'Instagram’da aç'}
        </a>
        <a
          href={`/rozet/${listing.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-line px-5 py-2.5 font-bold transition hover:border-neon/60"
        >
          Story rozetini indir
        </a>
      </div>

      <section className="mt-10 rounded-2xl border border-line bg-surface/40 p-5">
        <h2 className="text-lg font-black">Teklifi yükselt</h2>
        <p className="mt-1 text-sm text-muted">
          Yatırdığın <strong className="text-text">{tl(listing.currentBid)}</strong> duruyor; sadece{' '}
          <strong className="text-text">farkı</strong> ödersin.
          {/* Zaten 1 numaraysa "1 numarayi al" demek sacma — yalniz altindakilere */}
          {nationalRank > 1 && priceOfFirstPlace(topBid) > listing.currentBid && (
            <>
              {' '}
              1 numarayı almak için ek{' '}
              <strong className="text-neon">
                {tl(priceOfFirstPlace(topBid) - listing.currentBid)}
              </strong>{' '}
              yeter.
            </>
          )}
        </p>
        <div className="mt-4">
          {/* key: teklif degisince form yeniden kurulsun, kutuda eski (artik
              gecersiz) tutar kalmasin */}
          <BidForm
            key={`${listing.currentBid}-${baslangic ?? ''}`}
            listingId={listing.id}
            city={listing.city}
            current={listing.currentBid}
            minimum={suggestedMinimum(listing.currentBid)}
            baslangic={baslangic}
            iletisimGerekli={!listing.ownerEmail}
          />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted">Teklif geçmişi</h2>
        <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-surface/40">
          {listing.bids.map((b) => (
            <li key={b.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <span>
                <span className="font-bold tabular-nums">{tl(b.amount)}</span>
                {b.passedLabel && (
                  <span className="ml-2 text-muted">{b.passedLabel} geçildi</span>
                )}
              </span>
              <span className="text-xs text-muted">{since(b.createdAt)}</span>
            </li>
          ))}
          {!listing.bids.length && (
            <li className="px-4 py-6 text-center text-sm text-muted">Henüz teklif yok.</li>
          )}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted">Story rozeti</h2>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/rozet/${listing.id}`}
          alt={`${listing.name} rozeti`}
          className="mt-3 w-48 rounded-xl border border-line"
        />
      </section>
    </div>
  )
}

/**
 * Zafer ekranini acmaya yetkili teklif. Ilana ait, ODENMIS ve taze olmayan
 * hicbir teklif kupa acmaz.
 *
 * Sorgu bilerek bilesenin DISINDA: `Date.now()` render sirasinda cagrilan
 * saf olmayan bir fonksiyon, React derleyicisi hakli olarak sikayet ediyor.
 */
async function zaferTeklifi(bidId: string, listingId: string) {
  return prisma.bid.findFirst({
    where: {
      id: bidId,
      listingId,
      status: 'PAID',
      createdAt: { gt: new Date(Date.now() - ZAFER_PENCERESI_MS) },
    },
    select: { amount: true },
  })
}

function Cell({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-line bg-surface/50 px-3 py-2">
      <div className="text-[11px] uppercase tracking-wider text-muted">{label}</div>
      <div className={`text-lg font-black tabular-nums ${accent ? 'text-neon' : ''}`}>{value}</div>
    </div>
  )
}
