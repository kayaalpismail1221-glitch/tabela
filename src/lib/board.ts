import { prisma } from './prisma'
import { CITIES } from './cities'

// Sira kurali TEK YERDE: currentBid DESC, firstBidAt ASC (esitlikte eski teklif ustte).
const SIRALAMA = [{ currentBid: 'desc' as const }, { firstBidAt: 'asc' as const }]

// Yayindaki ilan = odemesi gecmis (currentBid > 0) ilan.
const YAYINDA = { currentBid: { gt: 0 } }

export type Row = {
  id: string
  rank: number
  handle: string
  name: string
  city: string
  district: string | null
  imageUrl: string | null
  description: string
  currentBid: number
  clickCount: number
  /** Genel listedeki sirasi — sehir tahtasinda rozet olarak gosterilir. */
  nationalRank?: number
}

/** Genel liste. Sehir tahtasi da ayni ekonominin suzulmus hali. */
export async function getBoard(citySlug?: string, take = 50): Promise<Row[]> {
  const listings = await prisma.listing.findMany({
    where: citySlug ? { ...YAYINDA, city: citySlug } : YAYINDA,
    orderBy: SIRALAMA,
    take,
  })

  const rows: Row[] = listings.map((l, i) => ({
    id: l.id,
    rank: i + 1,
    handle: l.handle,
    name: l.name,
    city: l.city,
    district: l.district,
    imageUrl: l.imageUrl,
    description: l.description,
    currentBid: l.currentBid,
    clickCount: l.clickCount,
  }))

  // Sehir tahtasindaysak her ilanin genel sirasini da ekle ("Turkiye 14.")
  if (citySlug && rows.length) {
    const ranks = await nationalRanks(rows.map((r) => r.id))
    for (const r of rows) r.nationalRank = ranks.get(r.id)
  }

  return rows
}

/** Verilen ilanlarin genel listedeki sirasi. */
async function nationalRanks(ids: string[]): Promise<Map<string, number>> {
  const all = await prisma.listing.findMany({
    where: YAYINDA,
    orderBy: SIRALAMA,
    select: { id: true },
  })
  const map = new Map<string, number>()
  all.forEach((l, i) => {
    if (ids.includes(l.id)) map.set(l.id, i + 1)
  })
  return map
}

export type Champion = {
  citySlug: string
  cityName: string
  plaka: number
  listing: Row | null
}

/**
 * Sehir Sampiyonlari — 81 ilin 1 numarasi.
 * Bos iller de donuyor: bos kutu "burasi bos, 500 TL'ye senin" davetidir.
 */
export async function getCityChampions(): Promise<Champion[]> {
  const all = await prisma.listing.findMany({ where: YAYINDA, orderBy: SIRALAMA })

  const first = new Map<string, (typeof all)[number]>()
  for (const l of all) if (!first.has(l.city)) first.set(l.city, l)

  return CITIES.map((c) => {
    const l = first.get(c.slug)
    return {
      citySlug: c.slug,
      cityName: c.name,
      plaka: c.plaka,
      listing: l
        ? {
            id: l.id,
            rank: 1,
            handle: l.handle,
            name: l.name,
            city: l.city,
            district: l.district,
            imageUrl: l.imageUrl,
            description: l.description,
            currentBid: l.currentBid,
            clickCount: l.clickCount,
          }
        : null,
    }
  })
}

export type Activity = {
  id: string
  amount: number
  handle: string
  name: string
  city: string
  passedHandle: string | null
  rankAfter: number | null
  createdAt: Date
}

/** Canli cekisme akisi. Tahtayi izlenebilir yapan sey burasi. */
export async function getActivity(take = 20): Promise<Activity[]> {
  const bids = await prisma.bid.findMany({
    where: { status: 'PAID' },
    orderBy: { createdAt: 'desc' },
    take,
    include: { listing: { select: { handle: true, name: true, city: true } } },
  })

  return bids.map((b) => ({
    id: b.id,
    amount: b.amount,
    handle: b.listing.handle,
    name: b.listing.name,
    city: b.listing.city,
    passedHandle: b.passedHandle,
    rankAfter: b.rankAfter,
    createdAt: b.createdAt,
  }))
}

/** Tahtadaki en yuksek teklif — teklif dogrulamasinda gerekiyor. */
export async function getTopBid(): Promise<number> {
  const top = await prisma.listing.findFirst({ where: YAYINDA, orderBy: SIRALAMA })
  return top?.currentBid ?? 0
}

export async function getStats() {
  const [count, sum] = await Promise.all([
    prisma.listing.count({ where: YAYINDA }),
    prisma.bid.aggregate({ where: { status: 'PAID' }, _sum: { paid: true } }),
  ])
  const cities = await prisma.listing.findMany({
    where: YAYINDA,
    select: { city: true },
    distinct: ['city'],
  })
  return { listings: count, volume: sum._sum.paid ?? 0, cities: cities.length }
}
