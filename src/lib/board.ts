import { prisma } from './prisma'
import { CITIES } from './cities'
import { linkLabel } from './links'

// Sira kurali TEK YERDE: currentBid DESC, firstBidAt ASC (esitlikte eski teklif ustte).
// Disari aciktir cunku "kim 1 numara" sorusunu bids.ts de soruyor — ikinci bir
// kopya cikarsa taht ile tahta farkli cevap verir.
export const SIRALAMA = [{ currentBid: 'desc' as const }, { firstBidAt: 'asc' as const }]

// Yayindaki ilan = odemesi gecmis (currentBid > 0) ilan.
const YAYINDA = { currentBid: { gt: 0 } }

export type Row = {
  id: string
  rank: number
  url: string
  label: string // "@ocakbasivefa" ya da "ocakbasivefa.com"
  name: string
  city: string
  district: string | null
  imageUrl: string | null
  description: string
  currentBid: number
  clickCount: number
  lastBidAt: Date | null
  /** Genel tahti ne zamandan beri tutuyor (yalniz 1 numarada dolu). */
  topSince: Date | null
  /** Genel listedeki sirasi — sehir tahtasinda rozet olarak gosterilir. */
  nationalRank?: number
}

type Kayit = {
  id: string
  url: string
  name: string
  city: string
  district: string | null
  imageUrl: string | null
  description: string
  currentBid: number
  clickCount: number
  lastBidAt: Date | null
  topSince: Date | null
}

function toRow(l: Kayit, rank: number): Row {
  return {
    id: l.id,
    rank,
    url: l.url,
    label: linkLabel(l.url),
    name: l.name,
    city: l.city,
    district: l.district,
    imageUrl: l.imageUrl,
    description: l.description,
    currentBid: l.currentBid,
    clickCount: l.clickCount,
    lastBidAt: l.lastBidAt,
    topSince: l.topSince,
  }
}

/**
 * Genel liste. Sehir tahtasi da ayni ekonominin suzulmus hali.
 *
 * @param skip Sayfalama icin — kacinci siradan baslanacak (0 = Turkiye 1.).
 *             `rank` buna gore kayiyor: 2. sayfada (skip=50) ilk satir 51.
 */
export async function getBoard(
  citySlug?: string,
  take = 50,
  skip = 0
): Promise<Row[]> {
  const listings = await prisma.listing.findMany({
    where: citySlug ? { ...YAYINDA, city: citySlug } : YAYINDA,
    orderBy: SIRALAMA,
    take,
    skip,
  })

  const rows = listings.map((l, i) => toRow(l, skip + i + 1))

  // Sehir tahtasindaysak her ilanin genel sirasini da ekle ("Turkiye 14.")
  if (citySlug && rows.length) {
    const ranks = await nationalRanks(rows.map((r) => r.id))
    for (const r of rows) r.nationalRank = ranks.get(r.id)
  }

  return rows
}

/** Bir sehrin (ya da tum Turkiye'nin) yayindaki ilan sayisi — sayfalama icin. */
export async function getBoardToplam(citySlug?: string): Promise<number> {
  return prisma.listing.count({ where: citySlug ? { ...YAYINDA, city: citySlug } : YAYINDA })
}

/** Verilen ilanlarin genel listedeki sirasi. */
async function nationalRanks(ids: string[]): Promise<Map<string, number>> {
  const all = await prisma.listing.findMany({
    where: YAYINDA,
    orderBy: SIRALAMA,
    select: { id: true },
  })
  const istenen = new Set(ids)
  const map = new Map<string, number>()
  all.forEach((l, i) => {
    if (istenen.has(l.id)) map.set(l.id, i + 1)
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
 * Bos iller de donuyor: bos kutu "burasi bos, senin olabilir" davetidir.
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
      listing: l ? toRow(l, 1) : null,
    }
  })
}

export type Activity = {
  id: string
  amount: number
  label: string
  name: string
  city: string
  passedLabel: string | null
  rankAfter: number | null
  createdAt: Date
}

/** Canli cekisme akisi. Tahtayi izlenebilir yapan sey burasi. */
export async function getActivity(take = 20): Promise<Activity[]> {
  const bids = await prisma.bid.findMany({
    where: { status: 'PAID' },
    orderBy: { createdAt: 'desc' },
    take,
    include: { listing: { select: { url: true, name: true, city: true } } },
  })

  return bids.map((b) => ({
    id: b.id,
    amount: b.amount,
    label: linkLabel(b.listing.url),
    name: b.listing.name,
    city: b.listing.city,
    passedLabel: b.passedLabel,
    rankAfter: b.rankAfter,
    createdAt: b.createdAt,
  }))
}

/** Tahtadaki en yuksek teklif — teklif dogrulamasinda gerekiyor. */
export async function getTopBid(): Promise<number> {
  const top = await prisma.listing.findFirst({ where: YAYINDA, orderBy: SIRALAMA })
  return top?.currentBid ?? 0
}

export type Zirve = {
  id: string
  name: string
  label: string
  city: string
  currentBid: number
  topSince: Date | null
}

/**
 * Su anki 1 numara. Anasayfanin basligi bunu soyluyor: tahtin BOS olmadigini
 * ve ne kadar suredir tutuldugunu gormeyen kimse teklif vermiyor.
 */
export async function getZirve(): Promise<Zirve | null> {
  const l = await prisma.listing.findFirst({ where: YAYINDA, orderBy: SIRALAMA })
  if (!l) return null
  return {
    id: l.id,
    name: l.name,
    label: linkLabel(l.url),
    city: l.city,
    currentBid: l.currentBid,
    topSince: l.topSince,
  }
}

// getStats buradan tasindi -> src/lib/stats.ts (getRakamlar)
