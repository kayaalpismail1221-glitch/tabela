import { prisma } from './prisma'
import { checkBid } from './rules'

/**
 * ODEME HENUZ BAGLI DEGIL.
 *
 * Tahsilat icin tuzel kisilik + Iyzico/PayTR uye isyeri sart (Stripe Turkiye'yi
 * desteklemiyor). O gelene kadar teklifler TEST MODUNDA aninda PAID sayiliyor.
 *
 * Canliya alirken sira:
 *   1. Bid PENDING olarak yazilir
 *   2. Odeme saglayicisina yonlendirilir
 *   3. Webhook PAID'e cevirir ve applyPaidBid cagrilir  <-- tek giris noktasi
 *
 * applyPaidBid zaten ayri duruyor; webhook'u ona baglamak yeterli olacak.
 */
export const TEST_MODU = process.env.PAYMENT_MODE !== 'live'

export type PlaceResult =
  | { ok: true; listingId: string; bidId: string; paid: number; rank: number }
  | { ok: false; error: string; minimum?: number }

/** Tahtadaki en yuksek teklif. */
async function topBid(): Promise<number> {
  const top = await prisma.listing.findFirst({
    where: { currentBid: { gt: 0 } },
    orderBy: { currentBid: 'desc' },
    select: { currentBid: true },
  })
  return top?.currentBid ?? 0
}

/**
 * Teklif ver / yukselt. Odeme baglaninca bu fonksiyon PENDING kayit uretip
 * donecek; simdilik test modunda dogrudan uyguluyor.
 */
export async function placeBid(listingId: string, amount: number): Promise<PlaceResult> {
  const listing = await prisma.listing.findUnique({ where: { id: listingId } })
  if (!listing) return { ok: false, error: 'İlan bulunamadı.' }

  const top = await topBid()
  const check = checkBid(amount, listing.currentBid, top)
  if (!check.ok) return { ok: false, error: check.reason, minimum: check.minimum }

  // Bu teklifle geride birakilan en guclu rakip — aktivite akisinin cumlesi.
  const passed = await prisma.listing.findFirst({
    where: {
      id: { not: listing.id },
      currentBid: { gt: listing.currentBid, lt: amount },
    },
    orderBy: { currentBid: 'desc' },
    select: { handle: true },
  })

  const above = await prisma.listing.count({ where: { currentBid: { gt: amount } } })
  const rank = above + 1

  const bid = await prisma.$transaction(async (tx) => {
    const created = await tx.bid.create({
      data: {
        listingId: listing.id,
        amount,
        paid: check.paid,
        status: TEST_MODU ? 'PAID' : 'PENDING',
        passedHandle: passed?.handle ?? null,
        rankAfter: rank,
      },
    })

    if (TEST_MODU) {
      await tx.listing.update({
        where: { id: listing.id },
        data: {
          currentBid: amount,
          firstBidAt: listing.firstBidAt ?? new Date(),
        },
      })
    }

    return created
  })

  return { ok: true, listingId: listing.id, bidId: bid.id, paid: check.paid, rank }
}

/**
 * Odeme onaylandiginda cagrilacak TEK giris noktasi.
 * (Webhook baglaninca burasi kullanilacak — idempotent tutuldu.)
 */
export async function applyPaidBid(bidId: string): Promise<void> {
  const bid = await prisma.bid.findUnique({ where: { id: bidId } })
  if (!bid || bid.status === 'PAID') return

  await prisma.$transaction(async (tx) => {
    await tx.bid.update({ where: { id: bid.id }, data: { status: 'PAID' } })
    const listing = await tx.listing.findUnique({ where: { id: bid.listingId } })
    if (!listing) return
    // Daha yuksek bir teklif arada gectiyse geri sarma.
    if (bid.amount > listing.currentBid) {
      await tx.listing.update({
        where: { id: listing.id },
        data: { currentBid: bid.amount, firstBidAt: listing.firstBidAt ?? new Date() },
      })
    }
  })
}
