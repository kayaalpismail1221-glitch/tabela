import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cityBySlug } from '@/lib/cities'
import { TABAN_TEKLIF, MIN_ARTIS, priceOfFirstPlace } from '@/lib/rules'

export const dynamic = 'force-dynamic'

/**
 * "Bu parayi verirsem kacinci olurum?"
 *
 * Teklif kutusuna yazarken canli calisir. Karar anini burasi tasiyor:
 * kullanici sirayi gormeden ne kadar vereceğine karar veremiyor.
 *
 * `exclude` — mevcut bir ilan teklifini yukseltiyorsa kendini saymamak icin.
 */
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams

  const amount = Number(sp.get('amount'))
  const citySlug = sp.get('city') ?? ''
  const exclude = sp.get('exclude') ?? ''

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: 'Gecersiz tutar.' }, { status: 400 })
  }

  const city = cityBySlug(citySlug) ? citySlug : null
  const disinda = exclude ? { id: { not: exclude } } : {}
  const yayinda = { currentBid: { gt: 0 }, ...disinda }

  // Esitlikte eski teklif ustte kalir; yeni gelen teklif esitleri GECEMEZ.
  const ustunde = { currentBid: { gte: amount } }

  const [nationalAbove, nationalTotal, top] = await Promise.all([
    prisma.listing.count({ where: { ...yayinda, ...ustunde } }),
    prisma.listing.count({ where: yayinda }),
    prisma.listing.findFirst({
      where: yayinda,
      orderBy: { currentBid: 'desc' },
      select: { currentBid: true },
    }),
  ])

  const topBid = top?.currentBid ?? 0

  let sehir = null
  if (city) {
    const [cityAbove, cityTotal, cityTop] = await Promise.all([
      prisma.listing.count({ where: { ...yayinda, city, ...ustunde } }),
      prisma.listing.count({ where: { ...yayinda, city } }),
      prisma.listing.findFirst({
        where: { ...yayinda, city },
        orderBy: { currentBid: 'desc' },
        select: { currentBid: true },
      }),
    ])

    const cityTopBid = cityTop?.currentBid ?? 0
    // Sehirde 1 numara olmanin bedeli. Sehir zirvesi genel zirveyi asiyorsa
    // genel zirve kurali (ZIRVE_FARKI) devreye girer.
    let sehirBirinciligi = cityTopBid === 0 ? TABAN_TEKLIF : cityTopBid + MIN_ARTIS
    if (sehirBirinciligi > topBid) sehirBirinciligi = priceOfFirstPlace(topBid)

    sehir = {
      slug: city,
      rank: cityAbove + 1,
      total: cityTotal + 1, // kendisi de listeye katilacak
      firstPlace: sehirBirinciligi,
    }
  }

  return NextResponse.json({
    national: {
      rank: nationalAbove + 1,
      total: nationalTotal + 1,
      firstPlace: priceOfFirstPlace(topBid),
    },
    city: sehir,
  })
}
